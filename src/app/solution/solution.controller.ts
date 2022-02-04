import { Context, controller, inject, provide } from 'midway';
import {
  route,
  getDetail,
  id,
  rateLimitUser,
  authPerm,
} from '@/lib/decorators/controller.decorator';
import { CSolutionMeta } from './solution.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CSolutionService } from './solution.service';
import { ILodash } from '@/utils/libs/lodash';
import { CProblemService } from '../problem/problem.service';
import { CContestService } from '../contest/contest.service';
import {
  IGetSolutionListReq,
  IUpdateSolutionShareReq,
  ISubmitSolutionReq,
  ISubmitSolutionResp,
  IBatchGetSolutionDetailReq,
  IRejudgeSolutionReq,
} from '@/common/contracts/solution';
import { IMSolutionDetail, IMSolutionServiceCreateOpt, ISolutionModel } from './solution.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { EContestType, EContestUserStatus, ESolutionResult } from '@/common/enums';
import { CPromiseQueue } from '@/utils/libs/promise-queue';
import { CJudgerService } from '../judger/judger.service';
import { EPerm } from '@/common/configs/perm.config';

@provide()
@controller('/')
export default class SolutionController {
  @inject('solutionMeta')
  meta: CSolutionMeta;

  @inject('solutionService')
  service: CSolutionService;

  @inject()
  problemService: CProblemService;

  @inject()
  contestService: CContestService;

  @inject()
  judgerService: CJudgerService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  @route()
  async [routesBe.getSolutionList.i](ctx: Context) {
    const req = { ...ctx.request.body } as IGetSolutionListReq;
    const { contestId } = req;
    if (contestId && !ctx.helper.isContestLoggedIn(contestId)) {
      delete req.contestId;
    }
    const { lt = null, gt, limit, order = [] } = req;
    // if (lt === undefined && gt === undefined) {
    //   throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    // }
    delete req.lt;
    delete req.gt;
    delete req.limit;
    delete req.order;
    const list = await this.service.getList(req, {
      lt,
      gt,
      limit,
      order,
    });
    list.forEach((d) => {
      if (
        d.contest &&
        !ctx.helper.isContestEnded(d.contest) &&
        !ctx.helper.isContestLoggedIn(d.contest.contestId) &&
        !ctx.helper.checkPerms(EPerm.ContestAccess)
      ) {
        delete d.time;
        delete d.memory;
        delete d.codeLength;
      }
    });
    return {
      lt,
      gt,
      limit: limit,
      rows: list,
    };
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.getSolutionDetail.i](ctx: Context) {
    const detail = ctx.detail as IMSolutionDetail;
    const isSelf = this.service.isSolutionSelf(ctx, detail);
    let canSharedView = ctx.loggedIn && detail.shared;
    if (detail.contest) {
      canSharedView = canSharedView && ctx.helper.isContestEnded(detail.contest);
    }
    if (!(ctx.helper.checkPerms(EPerm.ReadSolution) || canSharedView || isSelf)) {
      if (
        detail.contest &&
        !ctx.helper.isContestEnded(detail.contest) &&
        !ctx.helper.isContestLoggedIn(detail.contest.contestId)
      ) {
        delete detail.time;
        delete detail.memory;
        delete detail.codeLength;
      }
      delete detail.code;
      delete detail.compileInfo;
    }
    return detail;
  }

  @route()
  async [routesBe.batchGetSolutionDetail.i](ctx: Context) {
    let { solutionIds } = ctx.request.body as IBatchGetSolutionDetailReq;
    solutionIds = this.lodash.uniq(solutionIds.slice(0, 100));
    const solutionDetailMap: Record<ISolutionModel['solutionId'], IMSolutionDetail> = {};
    for (const solutionId of solutionIds) {
      const detail = await this.service.getDetail(solutionId);
      if (detail) {
        const isSelf = this.service.isSolutionSelf(ctx, detail);
        let canSharedView = ctx.loggedIn && detail.shared;
        if (detail.contest) {
          canSharedView = canSharedView && ctx.helper.isContestEnded(detail.contest);
        }
        if (!(ctx.helper.checkPerms(EPerm.ReadSolution) || canSharedView || isSelf)) {
          if (
            detail.contest &&
            !ctx.helper.isContestEnded(detail.contest) &&
            !ctx.helper.isContestLoggedIn(detail.contest.contestId)
          ) {
            delete detail.time;
            delete detail.memory;
            delete detail.codeLength;
          }
          delete detail.code;
          delete detail.compileInfo;
        }
        solutionDetailMap[solutionId] = detail;
      }
    }
    return solutionDetailMap;
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.updateSolutionShare.i](ctx: Context) {
    const solutionId = ctx.id!;
    const { shared } = ctx.request.body as IUpdateSolutionShareReq;
    const detail = ctx.detail as IMSolutionDetail;
    const isSelf = this.service.isSolutionSelf(ctx, detail);
    if (!isSelf) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    await this.service.update(solutionId, {
      shared,
    });
    await this.service.clearDetailCache(solutionId);
  }

  @route()
  @rateLimitUser(60, 12)
  async [routesBe.submitSolution.i](ctx: Context): Promise<ISubmitSolutionResp> {
    const { problemId, language, code } = ctx.request.body as ISubmitSolutionReq;
    const judgerLanguage = this.utils.judger.convertOJLanguageToRiver(language);
    const languageConfig = await this.judgerService.getLanguageConfig();
    if (!languageConfig.find((l) => l.language === judgerLanguage)) {
      throw new ReqError(Codes.SOLUTION_INVALID_LANGUAGE);
    }
    let { contestId } = ctx.request.body as ISubmitSolutionReq;
    if (!contestId) {
      if (!ctx.loggedIn) {
        throw new ReqError(Codes.GENERAL_NOT_LOGGED_IN);
      }
    } else {
      if (!ctx.helper.isContestLoggedIn(contestId)) {
        throw new ReqError(Codes.CONTEST_NOT_LOGGED_IN);
      }
    }
    const problem = await this.problemService.getDetail(problemId, null);
    const contest = contestId ? await this.contestService.getDetail(contestId, null) : null;
    let sess = ctx.helper.getGlobalSession();
    if (!problem) {
      throw new ReqError(Codes.SOLUTION_PROBLEM_NOT_EXIST);
    }
    // 比赛提交
    if (contestId) {
      if (!contest) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NOT_EXIST);
      }
      if (ctx.helper.isContestPending(contest) || ctx.helper.isContestEnded(contest)) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NOT_IN_PROGRESS);
      }
      if (!ctx.helper.isContestLoggedIn(contestId)) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NO_PERMISSION);
      }
      sess = ctx.helper.getContestSession(contestId)!;
      if (contest.type === EContestType.register) {
        const contestUser = await this.contestService.getContestUserDetail(sess.userId);
        if (!contestUser || contestUser.status !== EContestUserStatus.accepted) {
          throw new ReqError(Codes.SOLUTION_CONTEST_NO_PERMISSION);
        }
      }
      if (!(await this.contestService.isProblemInContest(problemId, contestId))) {
        throw new ReqError(Codes.SOLUTION_PROBLEM_NOT_EXIST);
      }
    } else {
      contestId = -1;
    }
    // 没有 OJ 或比赛 Session，无法提交
    if (!sess) {
      throw new ReqError(Codes.GENERAL_NOT_LOGGED_IN);
    }
    if (!problem.display && contestId <= 0) {
      throw new ReqError(Codes.SOLUTION_PROBLEM_NO_PERMISSION);
    }
    const data: IMSolutionServiceCreateOpt = {
      userId: sess.userId,
      username: sess.username,
      problemId,
      contestId,
      result: ESolutionResult.RPD,
      language,
      codeLength: code.length,
      ip: ctx.ip,
      isContestUser: contestId > 0 && contest?.type === EContestType.register,
      code,
    };
    const newId = await this.service.create(data);
    this.service.judge({
      solutionId: newId,
      problemId,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      userId: ctx.session.userId,
      language,
      code,
      spj: problem.spj,
    });
    // const REDIS_QUEUE_NAME = 'judge:queue';
    // const task = {
    //   solution_id: `${newId}`,
    //   problem_id: `${problemId}`,
    //   contest_id: `${contestId}`,
    //   user_id: `${ctx.session.userId}`,
    //   pro_lang: language,
    //   code,
    // };
    // await ctx.helper.redisRpush(REDIS_QUEUE_NAME, [], task);
    return { solutionId: newId };
  }

  @route()
  @authPerm(EPerm.RejudgeSolution)
  async [routesBe.rejudgeSolution.i](ctx: Context) {
    const data = ctx.request.body as IRejudgeSolutionReq;
    const solutionIds = await this.service.findAllSolutionIds(data);
    const pq = new this.PromiseQueue(5, Infinity);
    const queueTasks = solutionIds.map((solutionId) =>
      pq.add(async () => {
        // t-judger
        await this.service.update(solutionId, {
          result: ESolutionResult.RPD,
        });
        await this.service.clearDetailCache(solutionId);
      }),
    );
    await Promise.all(queueTasks);
  }
}
