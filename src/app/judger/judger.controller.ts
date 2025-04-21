import { Context, controller, inject, provide } from 'midway';
import { route, authPerm } from '@/lib/decorators/controller.decorator';
import { CJudgerMeta } from './judger.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CJudgerService } from './judger.service';
import { ILodash } from '@/utils/libs/lodash';
import { CProblemService } from '../problem/problem.service';
import {
  IGetJudgerDataFileReq,
  IGetJudgerDataArchiveReq,
  IUploadJudgerDataReq,
  IGetLanguageConfigResp,
} from '@/common/contracts/judger';
import { Codes } from '@/common/codes';
import { ReqError } from '@/lib/global/error';
import { EPerm } from '@/common/configs/perm.config';
import { CPromiseQueue } from '@/utils/libs/promise-queue';
import { CContestService } from '../contest/contest.service';
import { CCompetitionService } from '../competition/competition.service';

@provide()
@controller('/')
export default class JudgerController {
  @inject('judgerMeta')
  meta: CJudgerMeta;

  @inject('judgerService')
  service: CJudgerService;

  @inject()
  problemService: CProblemService;

  @inject()
  contestService: CContestService;

  @inject()
  competitionService: CCompetitionService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  @route()
  @authPerm(EPerm.ReadProblemData)
  async [routesBe.getJudgerDataFile.i](ctx: Context) {
    const { path } = ctx.request.body as IGetJudgerDataFileReq;
    return this.service.getDataFile(path);
  }

  @route(undefined, { customResp: true })
  @authPerm(EPerm.ReadProblemData)
  async [routesBe.getJudgerDataArchive.i](ctx: Context) {
    const { problemId } = ctx.request.body as IGetJudgerDataArchiveReq;
    const res = await this.service.getDataArchive(problemId);
    if (!Buffer.isBuffer(res)) {
      ctx.body = ctx.helper.rFail(Codes.GENERAL_ENTITY_NOT_EXIST);
      return;
    }
    ctx.set('content-type', 'application/octet-stream');
    ctx.attachment(`data-${problemId}.zip`);
    ctx.body = res;
  }

  @route()
  @authPerm(EPerm.WriteProblemData)
  async [routesBe.prepareJudgerDataUpdate.i](_ctx: Context) {
    const checkRes = await this.service.checkIsDataGitStatusClean();
    if (!checkRes) {
      throw new ReqError(Codes.JUDGER_DATA_GIT_WD_NOT_CLEAN);
    }
    await this.service.pullDataGit();
    await this.service.checkoutDataGit();
  }

  @route()
  @authPerm(EPerm.WriteProblemData)
  async [routesBe.uploadJudgerData.i](ctx: Context) {
    const { name, email, commitMessage } = ctx.request.body as IUploadJudgerDataReq;
    let { problemId } = ctx.request.body as IUploadJudgerDataReq;
    problemId = +problemId;
    if (!problemId) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    const data = ctx.request.files?.filter((f) => f.field === 'data')[0];
    if (!data) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }

    const availableMimeList = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-zip',
    ];
    if (!availableMimeList.includes(data.mime)) {
      ctx.logger.error('Invalid judger data data mime:', data.mime);
      throw new ReqError(Codes.JUDGER_UNSUPPORTED_DATA_FORMAT);
    }
    // TODO check zip file to prevent zip bomb or directory traversal attack
    const updateRes = await this.service.updateData(
      problemId,
      data.filepath,
      name && email
        ? ({
            name,
            email,
            commitMessage,
          } as {
            name: string;
            email: string;
            commitMessage: string;
          })
        : undefined,
    );
    if (!updateRes) {
      throw new ReqError(Codes.JUDGER_INVALID_DATA);
    }
    await this.service.commitAndPushDataGit(problemId, name!, email!, commitMessage!);
    // update problem revision
    this.problemService.update(problemId, {});
    this.problemService.clearDetailCache(problemId);
    const pq = new this.PromiseQueue(20, Infinity);
    const contestIds = await this.contestService.getAllContestIdsByProblemId(problemId);
    const competitionIds = await this.competitionService.getAllCompetitionIdsByProblemId(problemId);
    const queueTasks = [
      ...contestIds.map((contestId) =>
        pq.add(() => this.contestService.clearContestProblemsCache(contestId)),
      ),
      ...competitionIds.map((competitionId) =>
        pq.add(() => this.competitionService.clearCompetitionProblemsCache(competitionId)),
      ),
    ];
    await Promise.all(queueTasks);
  }

  @route()
  async [routesBe.getLanguageConfig.i](_ctx: Context): Promise<IGetLanguageConfigResp> {
    return this.service.getLanguageConfig();
  }
}
