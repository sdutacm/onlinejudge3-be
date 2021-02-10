import { Context, controller, inject, provide } from 'midway';
import { route, auth } from '@/lib/decorators/controller.decorator';
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
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @auth('admin')
  async [routesBe.getJudgerDataFile.i](ctx: Context) {
    const { path } = ctx.request.body as IGetJudgerDataFileReq;
    return this.service.getDataFile(path);
  }

  @route(undefined, { customResp: true })
  @auth('admin')
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
  @auth('admin')
  async [routesBe.prepareJudgerDataUpdate.i](_ctx: Context) {
    const checkRes = await this.service.checkIsDataGitStatusClean();
    if (!checkRes) {
      throw new ReqError(Codes.JUDGER_DATA_GIT_WD_NOT_CLEAN);
    }
    await this.service.pullDataGit();
    await this.service.checkoutDataGit();
  }

  @route()
  @auth('admin')
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
    if (data.mime !== 'application/zip') {
      throw new ReqError(Codes.JUDGER_UNSUPPORTED_DATA_FORMAT);
    }
    const updateRes = await this.service.updateData(problemId, data.filepath);
    if (!updateRes) {
      throw new ReqError(Codes.JUDGER_INVALID_DATA);
    }
    await this.service.commitAndPushDataGit(problemId, name, email, commitMessage);
  }

  @route()
  async [routesBe.getLanguageConfig.i](_ctx: Context): Promise<IGetLanguageConfigResp> {
    return this.service.getLanguageConfig();
  }
}
