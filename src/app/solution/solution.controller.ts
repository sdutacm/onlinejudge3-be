import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  getDetail,
  id,
  login,
  rateLimitUser,
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
} from '@/common/contracts/solution';
import {
  IMSolutionServiceGetListRes,
  IMSolutionDetail,
  IMSolutionServiceCreateOpt,
} from './solution.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { EContestType, EContestUserStatus, ESolutionResult } from '@/common/enums';

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
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList(ctx) {
      const { contestId } = ctx.request.body as IGetSolutionListReq;
      if (contestId && !ctx.helper.isContestLoggedIn(contestId)) {
        delete ctx.request.body.contestId;
      }
    },
    afterGetList(ctx) {
      const { contestId } = ctx.request.body as IGetSolutionListReq;
      if (contestId && !ctx.helper.isContestLoggedIn(contestId) && !ctx.isPerm) {
        (ctx.list as IMSolutionServiceGetListRes).rows.forEach((d) => {
          delete d.time;
          delete d.memory;
          delete d.codeLength;
        });
      }
    },
  })
  @respList()
  async [routesBe.getSolutionList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  async [routesBe.getSolutionDetail.i](ctx: Context) {
    const detail = ctx.detail as IMSolutionDetail;
    const isSelf = this.service.isSolutionSelf(ctx, detail);
    if (!(ctx.isPerm || (ctx.loggedIn && detail.shared) || isSelf)) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    return detail;
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
  @login()
  @rateLimitUser(60, 6)
  async [routesBe.submitSolution.i](ctx: Context): Promise<ISubmitSolutionResp> {
    const { problemId, language, code } = ctx.request.body as ISubmitSolutionReq;
    let { contestId } = ctx.request.body as ISubmitSolutionReq;
    const problem = await this.problemService.getDetail(problemId, null);
    const contest = contestId ? await this.contestService.getDetail(contestId, null) : null;
    let sess = ctx.helper.getGlobalSession();
    if (!problem) {
      throw new ReqError(Codes.SOLUTION_PROBLEM_NOT_EXIST);
    }
    // 暂不支持 SPJ
    if (problem.spj) {
      throw new ReqError(Codes.GENERAL_UNKNOWN_ERROR);
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
    if (!problem.display && !ctx.isPerm && contestId <= 0) {
      throw new ReqError(Codes.SOLUTION_PROBLEM_NO_PERMISSION);
    }
    const data: IMSolutionServiceCreateOpt = {
      userId: sess.userId,
      username: sess.username,
      problemId,
      contestId,
      result: ESolutionResult.WT,
      language,
      codeLength: code.length,
      ip: ctx.ip,
      isContestUser: contestId > 0 && contest?.type === EContestType.register,
      code,
    };
    const newId = await this.service.create(data);
    const REDIS_QUEUE_NAME = 'judge:queue';
    const task = {
      solution_id: `${newId}`,
      problem_id: `${problemId}`,
      contest_id: `${contestId}`,
      user_id: `${ctx.session.userId}`,
      pro_lang: language,
      code,
    };
    await ctx.helper.redisRpush(REDIS_QUEUE_NAME, [], task);
    return { solutionId: newId };
  }
}
