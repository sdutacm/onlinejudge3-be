import { Context, controller, inject, provide } from 'midway';
import {
  route,
  getDetail,
  id,
  rateLimitUser,
  authPerm,
  authSystemRequest,
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
  IRejudgeSolutionResp,
  ICallbackJudgeReq,
} from '@/common/contracts/solution';
import { IMSolutionDetail, IMSolutionServiceCreateOpt, ISolutionModel } from './solution.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import {
  EContestType,
  EContestUserStatus,
  ESolutionResult,
  ECompetitionUserRole,
  ECompetitionUserStatus,
} from '@/common/enums';
import { CPromiseQueue } from '@/utils/libs/promise-queue';
import { CJudgerService } from '../judger/judger.service';
import { EPerm } from '@/common/configs/perm.config';
import { CCompetitionService } from '../competition/competition.service';
import { isCompetitionSolutionInFrozen } from '@/utils/competition';
import { CCompetitionLogService } from '../competition/competitionLog.service';
import { ECompetitionLogAction, ECompetitionEvent } from '../competition/competition.enum';
import { isContestSolutionInFrozen } from '@/utils/contest';
import { CCompetitionEventService } from '../competition/competitionEvent.service';

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
  competitionService: CCompetitionService;

  @inject()
  judgerService: CJudgerService;

  @inject()
  competitionLogService: CCompetitionLogService;

  @inject()
  competitionEventService: CCompetitionEventService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  @route()
  async [routesBe.getSolutionList.i](ctx: Context) {
    const _s = Date.now();
    const req = { ...ctx.request.body } as IGetSolutionListReq;
    const { contestId } = req;
    if (contestId && !ctx.helper.isContestLoggedIn(contestId)) {
      delete req.contestId;
    }
    const { lt = null, gt, limit, order = [] } = req;
    const _authCost = Date.now() - _s;
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
    const _dbListCost = Date.now() - _s - _authCost;
    for (const d of list) {
      const isSelf = this.service.isSolutionSelf(ctx, d);
      let hasPermission = ctx.helper.checkPerms(EPerm.ReadSolution);
      if (d.contest) {
        hasPermission = hasPermission || ctx.helper.checkPerms(EPerm.ReadContest);
      }
      if (d.competition) {
        hasPermission = ctx.helper.checkCompetitionRole(d.competition.competitionId, [
          ECompetitionUserRole.admin,
          ECompetitionUserRole.principal,
          ECompetitionUserRole.judge,
        ]);
      }
      if (
        (d.contest &&
          !ctx.helper.isContestEnded(d.contest) &&
          !ctx.helper.isContestLoggedIn(d.contest.contestId) &&
          !ctx.helper.checkPerms(EPerm.ContestAccess)) ||
        (d.competition &&
          !ctx.helper.isContestEnded(d.competition) &&
          !ctx.helper.isCompetitionLoggedIn(d.competition.competitionId))
      ) {
        delete d.time;
        delete d.memory;
        delete d.codeLength;
      }
      const canViewProblem =
        hasPermission ||
        isSelf ||
        (d.contest && ctx.helper.isContestLoggedIn(d.contest.contestId)) ||
        (d.competition && ctx.helper.isCompetitionLoggedIn(d.competition.competitionId));
      if (!canViewProblem && d.problem) {
        delete d.problem.title;
      }
      // 如果是封榜且无权限查看，则修改 result
      if (
        !isSelf &&
        ((d.contest &&
          !d.contest.ended &&
          isContestSolutionInFrozen(d, d.contest, d.contest.frozenLength) &&
          !ctx.helper.checkPerms(EPerm.ContestAccess)) ||
          (d.competition &&
            !d.competition.ended &&
            isCompetitionSolutionInFrozen(d, d.competition, d.competition.settings?.frozenLength) &&
            !ctx.helper.checkCompetitionRole(d.competition.competitionId, [
              ECompetitionUserRole.admin,
              ECompetitionUserRole.principal,
              ECompetitionUserRole.judge,
            ])))
      ) {
        if (req.result === d.result) {
          // 临时策略，对于筛选了 result 但其实封榜的提交过滤掉
          // @ts-ignore
          d.result = null;
        } else {
          d.result = ESolutionResult.V_Frozen;
          delete d.judgeInfo;
        }
      }
    }
    const _postprocessCost = Date.now() - _s - _authCost - _dbListCost;
    ctx.logger.info('getSolutionList time cost:', req, {
      _authCost,
      _dbListCost,
      _postprocessCost,
      total: Date.now() - _s,
    });
    return {
      lt,
      gt,
      limit,
      rows: list.filter((d) => d.result !== null),
    };
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.getSolutionDetail.i](ctx: Context) {
    const detail = ctx.detail as IMSolutionDetail;
    const isSelf = this.service.isSolutionSelf(ctx, detail);
    let hasPermission = ctx.helper.checkPerms(EPerm.ReadSolution);
    let canSharedView = ctx.loggedIn && detail.shared;
    if (detail.contest) {
      canSharedView = canSharedView && ctx.helper.isContestEnded(detail.contest);
      hasPermission = hasPermission || ctx.helper.checkPerms(EPerm.ReadContest);
    }
    if (detail.competition) {
      canSharedView = canSharedView && ctx.helper.isContestEnded(detail.competition);
      hasPermission = ctx.helper.checkCompetitionRole(detail.competition.competitionId, [
        ECompetitionUserRole.admin,
        ECompetitionUserRole.principal,
        ECompetitionUserRole.judge,
      ]);
    }
    if (!(hasPermission || canSharedView || isSelf)) {
      if (
        (detail.contest &&
          !ctx.helper.isContestEnded(detail.contest) &&
          !ctx.helper.isContestLoggedIn(detail.contest.contestId)) ||
        (detail.competition &&
          !ctx.helper.isContestEnded(detail.competition) &&
          !ctx.helper.isCompetitionLoggedIn(detail.competition.competitionId))
      ) {
        delete detail.time;
        delete detail.memory;
        delete detail.codeLength;
        detail.problem && delete detail.problem.title;
      }
      delete detail.code;
      delete detail.compileInfo;
    }
    const canViewProblem =
      hasPermission ||
      isSelf ||
      (detail.contest && ctx.helper.isContestLoggedIn(detail.contest.contestId)) ||
      (detail.competition && ctx.helper.isCompetitionLoggedIn(detail.competition.competitionId));
    if (!canViewProblem && detail.problem) {
      delete detail.problem.title;
    }
    // 如果是封榜且无权限查看，则修改 result
    if (
      !isSelf &&
      ((detail.contest &&
        !detail.contest.ended &&
        isContestSolutionInFrozen(detail, detail.contest, detail.contest.frozenLength) &&
        !ctx.helper.checkPerms(EPerm.ContestAccess)) ||
        (detail.competition &&
          !detail.competition.ended &&
          isCompetitionSolutionInFrozen(
            detail,
            detail.competition,
            detail.competition.settings?.frozenLength,
          ) &&
          !ctx.helper.checkCompetitionRole(detail.competition.competitionId, [
            ECompetitionUserRole.admin,
            ECompetitionUserRole.principal,
            ECompetitionUserRole.judge,
          ])))
    ) {
      detail.result = ESolutionResult.V_Frozen;
      delete detail.judgeInfo;
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
        let hasPermission = ctx.helper.checkPerms(EPerm.ReadSolution);
        let canSharedView = ctx.loggedIn && detail.shared;
        if (detail.contest) {
          hasPermission = hasPermission || ctx.helper.checkPerms(EPerm.ReadContest);
          canSharedView = canSharedView && ctx.helper.isContestEnded(detail.contest);
        }
        if (detail.competition) {
          canSharedView = canSharedView && ctx.helper.isContestEnded(detail.competition);
          hasPermission =
            hasPermission ||
            ctx.helper.checkCompetitionRole(detail.competition.competitionId, [
              ECompetitionUserRole.admin,
              ECompetitionUserRole.principal,
              ECompetitionUserRole.judge,
            ]);
        }
        if (!(hasPermission || canSharedView || isSelf)) {
          if (
            (detail.contest &&
              !ctx.helper.isContestEnded(detail.contest) &&
              !ctx.helper.isContestLoggedIn(detail.contest.contestId)) ||
            (detail.competition &&
              !ctx.helper.isContestEnded(detail.competition) &&
              !ctx.helper.isCompetitionLoggedIn(detail.competition.competitionId))
          ) {
            delete detail.time;
            delete detail.memory;
            delete detail.codeLength;
          }
          delete detail.code;
          delete detail.compileInfo;
        }
        const canViewProblem =
          hasPermission ||
          isSelf ||
          (detail.contest && ctx.helper.isContestLoggedIn(detail.contest.contestId)) ||
          (detail.competition &&
            ctx.helper.isCompetitionLoggedIn(detail.competition.competitionId));
        if (!canViewProblem && detail.problem) {
          delete detail.problem.title;
        }
        // 如果是封榜且无权限查看，则修改 result
        if (
          !isSelf &&
          ((detail.contest &&
            !detail.contest.ended &&
            isContestSolutionInFrozen(detail, detail.contest, detail.contest.frozenLength) &&
            !ctx.helper.checkPerms(EPerm.ContestAccess)) ||
            (detail.competition &&
              !detail.competition.ended &&
              isCompetitionSolutionInFrozen(
                detail,
                detail.competition,
                detail.competition.settings?.frozenLength,
              ) &&
              !ctx.helper.checkCompetitionRole(detail.competition.competitionId, [
                ECompetitionUserRole.admin,
                ECompetitionUserRole.principal,
                ECompetitionUserRole.judge,
              ])))
        ) {
          detail.result = ESolutionResult.V_Frozen;
          delete detail.judgeInfo;
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
    const { problemId, language, codeFormat = 'raw', competitionId } = ctx.request
      .body as ISubmitSolutionReq;
    let { code } = ctx.request.body as ISubmitSolutionReq;
    if (codeFormat === 'base64') {
      try {
        code = Buffer.from(code, 'base64').toString();
      } catch (e) {
        ctx.logger.error('cannot decode code from base64 format:', ctx.request.body.code);
        throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
      }
    }
    const MAX_CODE_LENGTH = 1 * 1024 * 1024; // 1 MiB
    if (code.length > MAX_CODE_LENGTH) {
      throw new ReqError(Codes.SOLUTION_CODE_TOO_LONG);
    }
    const judgerLanguage = this.utils.judger.convertOJLanguageToRiver(language);
    const languageConfig = await this.judgerService.getLanguageConfig();
    if (!languageConfig.find((l) => l.language === judgerLanguage)) {
      throw new ReqError(Codes.SOLUTION_INVALID_LANGUAGE);
    }
    let { contestId } = ctx.request.body as ISubmitSolutionReq;
    if (!contestId && !competitionId) {
      if (!ctx.loggedIn) {
        throw new ReqError(Codes.GENERAL_NOT_LOGGED_IN);
      }
    } else if (contestId) {
      if (!ctx.helper.isContestLoggedIn(contestId)) {
        throw new ReqError(Codes.CONTEST_NOT_LOGGED_IN);
      }
    } else if (competitionId) {
      if (!ctx.helper.isCompetitionLoggedIn(competitionId)) {
        throw new ReqError(Codes.COMPETITION_NOT_LOGGED_IN);
      }
    }
    const problem = await this.problemService.getDetail(problemId, null);
    const contest = contestId ? await this.contestService.getDetail(contestId, null) : null;
    const competition = competitionId
      ? await this.competitionService.getDetail(competitionId, null)
      : null;
    let sess:
      | {
          userId: number;
          username: string;
          nickname: string;
          permission: number;
          avatar: string | null;
        }
      | /** competition session */ {
          userId: number;
          nickname: string;
          subname: string;
          role: ECompetitionUserRole;
        }
      | null = ctx.helper.getGlobalSession();
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
    // 新比赛提交
    if (competitionId) {
      if (!competition) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NOT_EXIST);
      }
      if (ctx.helper.isContestPending(competition) || ctx.helper.isContestEnded(competition)) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NOT_IN_PROGRESS);
      }
      if (!ctx.helper.isCompetitionLoggedIn(competitionId)) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NO_PERMISSION);
      }
      sess = ctx.helper.getCompetitionSession(competitionId)!;
      const competitionUser = await this.competitionService.getCompetitionUserDetail(
        competitionId,
        sess.userId,
      );
      if (!competitionUser || competitionUser.role !== ECompetitionUserRole.participant) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NO_PERMISSION);
      }
      if (competitionUser.banned) {
        throw new ReqError(Codes.COMPETITION_USER_BANNED);
      }
      if (competitionUser.status === ECompetitionUserStatus.quitted) {
        throw new ReqError(Codes.COMPETITION_USER_QUITTED);
      }
      if (
        ![ECompetitionUserStatus.available, ECompetitionUserStatus.entered].includes(
          competitionUser.status,
        )
      ) {
        throw new ReqError(Codes.SOLUTION_CONTEST_NO_PERMISSION);
      }
      if (!(await this.competitionService.isProblemInCompetition(problemId, competitionId))) {
        throw new ReqError(Codes.SOLUTION_PROBLEM_NOT_EXIST);
      }
    }

    // 没有 OJ 或比赛 Session，无法提交
    if (!sess) {
      throw new ReqError(Codes.GENERAL_NOT_LOGGED_IN);
    }
    if (!problem.display && contestId <= 0 && !competitionId) {
      throw new ReqError(Codes.SOLUTION_PROBLEM_NO_PERMISSION);
    }
    const data: IMSolutionServiceCreateOpt = {
      userId: sess.userId,
      // @ts-ignore
      username: sess.username || '',
      problemId,
      contestId,
      competitionId,
      result: ESolutionResult.RPD,
      language,
      codeLength: code.length,
      ip: ctx.ip,
      isContestUser: contestId > 0 && contest?.type === EContestType.register,
      code,
    };
    const newId = await this.service.create(data);
    const judgeInfoId = await this.service.createJudgeInfo(newId, {
      problemRevision: problem.revision,
      result: ESolutionResult.RPD,
    });
    await this.service.update(newId, { judgeInfoId });
    try {
      if (competitionId) {
        const newSolutionCreateTime = await this.service.getSolutionCreateTime(newId);
        await Promise.all([
          this.competitionLogService.log(competitionId, ECompetitionLogAction.SubmitSolution, {
            solutionId: newId,
            problemId,
            userId: sess.userId,
          }),
          this.competitionEventService.event(competitionId, ECompetitionEvent.SubmitSolution, {
            solutionId: newId,
            problemId,
            userId: sess.userId,
            judgeInfoId,
            detail: {
              time: newSolutionCreateTime,
            },
          }),
        ]);
      }
    } catch (e) {
      ctx.logger.error('[submitSolution] append competition log or event error:', e);
    }
    this.service.sendToJudgeQueue({
      judgeInfoId,
      solutionId: newId,
      problem: {
        problemId,
        revision: problem.revision,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        spj: problem.spj,
      },
      user: {
        userId: sess.userId,
      },
      competition: competitionId ? { competitionId } : undefined,
      language,
      code,
    });
    // this.service.judge({
    //   judgeInfoId,
    //   solutionId: newId,
    //   problemId,
    //   timeLimit: problem.timeLimit,
    //   memoryLimit: problem.memoryLimit,
    //   userId: ctx.session.userId,
    //   language,
    //   code,
    //   spj: problem.spj,
    // });

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
  async [routesBe.rejudgeSolution.i](ctx: Context): Promise<IRejudgeSolutionResp> {
    const data = ctx.request.body as IRejudgeSolutionReq;
    const hasPermission = ctx.helper.checkPerms(EPerm.RejudgeSolution);
    const solutionWithIds = await this.service.findAllSolutionWithIds(data);
    let solutions = solutionWithIds.filter((sln) => {
      if (hasPermission) {
        return true;
      } else if (
        sln.competitionId &&
        ctx.helper.checkCompetitionRole(sln.competitionId, [
          ECompetitionUserRole.admin,
          ECompetitionUserRole.participant,
          ECompetitionUserRole.judge,
        ])
      ) {
        this.competitionLogService.log(sln.competitionId, ECompetitionLogAction.RejudgeSolution, {
          solutionId: sln.solutionId,
          problemId: sln.problemId,
          userId: sln.userId,
        });
        return true;
      }
      return false;
    });

    const problemIds = this.lodash.uniq(solutions.map((s) => s.problemId));
    const relativeProblems = await this.problemService.getRelative(problemIds, null);
    solutions = solutions.filter((s) => {
      return !!relativeProblems[s.problemId];
    });

    if (solutions.length === 0) {
      throw new ReqError(Codes.SOLUTION_NO_SOLUTION_REJUDGED);
    }

    ctx.logger.info('[rejudgeSolution] to rejudge num:', solutions.length);
    const judgeInfoIdMap = new Map<number, number>();
    const rejudgeTask = async (s: typeof solutions[0]) => {
      const newJudgeInfoId = await this.service.createJudgeInfo(s.solutionId, {
        problemRevision: relativeProblems[s.problemId]!.revision,
        result: ESolutionResult.RPD,
      });
      await this.service.update(s.solutionId, {
        judgeInfoId: newJudgeInfoId,
      });
      judgeInfoIdMap.set(s.solutionId, newJudgeInfoId);
    };
    const codeMap = new Map<number, string>();
    const chunks = this.lodash.chunk(solutions, 100);
    for (const chunk of chunks) {
      await Promise.all(chunk.map((s) => rejudgeTask(s)));
      const batchCodeRes = await this.service.batchGetSolutionCodeBySolutionIds(
        chunk.map((s) => s.solutionId),
      );
      Object.keys(batchCodeRes).forEach((k) => {
        // @ts-ignore
        codeMap.set(+k, batchCodeRes[k]);
      });
      // await this.service.batchUpdateBySolutionIds(chunk, {
      //   result: ESolutionResult.RPD,
      // });
      // const clearCacheChunks = this.lodash.chunk(chunk, 20);
      // for (const clearCacheChunk of clearCacheChunks) {
      //   await Promise.all(
      //     clearCacheChunk.map((solutionId) => this.service.clearDetailCache(solutionId)),
      //   );
      // }
    }
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((s) => {
          if (s.competitionId) {
            return this.competitionEventService
              .event(s.competitionId, ECompetitionEvent.RejudgeSolution, {
                solutionId: s.solutionId,
                problemId: s.problemId,
                userId: s.userId,
                judgeInfoId: judgeInfoIdMap.get(s.solutionId),
              })
              .then(() => {});
          }
          return Promise.resolve();
        }),
      );

      await Promise.all(
        chunk.map((s) =>
          this.service.sendToJudgeQueue({
            judgeInfoId: judgeInfoIdMap.get(s.solutionId)!,
            solutionId: s.solutionId,
            problem: {
              problemId: s.problemId,
              revision: relativeProblems[s.problemId]!.revision,
              timeLimit: relativeProblems[s.problemId]!.timeLimit,
              memoryLimit: relativeProblems[s.problemId]!.memoryLimit,
              spj: relativeProblems[s.problemId]!.spj,
            },
            user: {
              userId: s.userId,
            },
            competition: s.competitionId ? { competitionId: s.competitionId } : undefined,
            language: this.utils.judger.convertOJLanguageToRiver(s.language) || '',
            code: codeMap.get(s.solutionId) || '',
          }),
        ),
      );
    }

    return {
      rejudgedCount: solutions.length,
    };
  }

  @route()
  @authSystemRequest()
  async [routesBe.callbackJudge.i](ctx: Context): Promise<void> {
    const req = ctx.request.body as ICallbackJudgeReq;
    const { judgeInfoId, solutionId, judgerId, batchData } = req;
    const redundant = this.lodash.pick(req, ['userId', 'problemId', 'contestId', 'competitionId']);
    const batchDataList = batchData || [
      { data: req.data!, eventTimestampUs: req.eventTimestampUs! },
    ];
    for (const item of batchDataList) {
      const { data, eventTimestampUs } = item;
      switch (data.type) {
        case 'start': {
          await this.service.updateJudgeStart(
            judgeInfoId,
            solutionId,
            judgerId,
            eventTimestampUs,
            redundant,
          );
          break;
        }
        case 'progress': {
          await this.service.updateJudgeProgress(
            judgeInfoId,
            solutionId,
            judgerId,
            eventTimestampUs,
            redundant,
            data.current,
            data.total,
          );
          break;
        }
        case 'finish': {
          await this.service.updateJudgeFinish(
            judgeInfoId,
            solutionId,
            judgerId,
            eventTimestampUs,
            redundant,
            data.resultType,
            data.detail,
          );
          break;
        }
        default:
          throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
      }
    }
  }
}
