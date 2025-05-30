import { provide, inject, Context, config } from 'midway';
import { CSolutionMeta } from './solution.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TSolutionModel } from '@/lib/models/solution.model';
import {
  TMSolutionLiteFields,
  TMSolutionDetailFields,
  ISolutionModel,
  IMSolutionServiceGetListOpt,
  IMSolutionListPagination,
  IMSolutionServiceGetListRes,
  IMSolutionLitePlain,
  IMSolutionRelativeProblem,
  IMSolutionRelativeUser,
  IMSolutionRelativeContest,
  IMSolutionServiceGetDetailRes,
  IMSolutionDetailPlain,
  IMSolutionDetailPlainFull,
  IMSolutionServiceCreateOpt,
  IMSolutionServiceCreateRes,
  IMSolutionServiceUpdateOpt,
  IMSolutionServiceUpdateRes,
  IMSolutionUserProblemResultStats,
  IMSolutionServiceGetContestProblemSolutionStatsRes,
  IMSolutionContestProblemSolutionStats,
  IMSolutionServiceGetUserSolutionCalendarRes,
  IMSolutionCalendar,
  IMSolutionServiceGetAllContestSolutionListRes,
  IMSolutionServiceGetRelativeRes,
  IMSolutionLite,
  IMSolutionDetail,
  IMSolutionServiceFindAllSolutionIdsOpt,
  IMSolutionServiceFindAllSolutionIdsRes,
  IMSolutionServiceFindAllSolutionWithIdsOpt,
  IMSolutionServiceFindAllSolutionWithIdsRes,
  IMSolutionServiceJudgeOpt,
  IMSolutionServiceJudgeRes,
  IMSolutionServiceGetPendingSolutionsRes,
  IMSolutionJudgeStatus,
  IMSolutionServiceCreateJudgeInfoOpt,
  IMSolutionServiceUpdateJudgeInfoOpt,
  IMSolutionJudgeInfo,
  IMSolutionServiceGetRelativeJudgeInfoRes,
  TMJudgeInfoFields,
  IMSolutionJudgeInfoFull,
  IMSolutionServiceGetCompetitionProblemSolutionStatsRes,
  IMSolutionServiceGetAllCompetitionSolutionListRes,
  IMSolutionRelativeCompetition,
  IMSolutionServiceGetAllCompetitionSolutionListByUserIdRes,
  IMSolutionServiceGetLiteSolutionSliceOpt,
  IMSolutionServiceGetLiteSolutionSliceRes,
  IMSolutionServiceLiteSolution,
  IMSolutionJudgeRedundantData,
} from './solution.interface';
import { Op, QueryTypes, fn as sequelizeFn, col as sequelizeCol } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CProblemService } from '../problem/problem.service';
import { CUserService } from '../user/user.service';
import { CContestService } from '../contest/contest.service';
import { TCompileInfoModel } from '@/lib/models/compileInfo.model';
import { TCodeModel } from '@/lib/models/code.model';
import { ESolutionResult } from '@/common/enums';
import DB from '@/lib/models/db';
import { Judger } from '@/lib/services/judger';
import { river } from '@/proto/river';
import * as os from 'os';
import { TJudgeInfoModel } from '@/lib/models/judgeInfo.model';
import Axios from 'axios';
import http from 'http';
import { IJudgerConfig } from '@/config/judger.config';
import { CCompetitionService } from '../competition/competition.service';
import { ICompetitionModel } from '../competition/competition.interface';
import { IUserModel } from '../user/user.interface';
import { IProblemModel } from '../problem/problem.interface';
import microtime from 'microtime';
import { CCompetitionEventService } from '../competition/competitionEvent.service';
import { ECompetitionEvent } from '../competition/competition.enum';
import { IAppConfig } from '@/config/config.interface';
import { CUserAchievementService } from '../user/userAchievement.service';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { standardizeLanguage } from '@/utils/judger';
import dayjs from 'dayjs';
import { CSetService } from '../set/set.service';

const httpAgent = new http.Agent({ keepAlive: true });
const axiosSocketBrideInstance = Axios.create({
  httpAgent,
  timeout: 5000,
});

export type CSolutionService = SolutionService;

const solutionLiteFields: Array<TMSolutionLiteFields> = [
  'solutionId',
  'problemId',
  'userId',
  'contestId',
  'competitionId',
  'judgeInfoId',
  'result',
  'time',
  'memory',
  'language',
  'codeLength',
  'shared',
  'isContestUser',
  'createdAt',
];

const solutionDetailFields: Array<TMSolutionDetailFields> = [
  'solutionId',
  'problemId',
  'userId',
  'contestId',
  'competitionId',
  'judgeInfoId',
  'result',
  'time',
  'memory',
  'language',
  'codeLength',
  'shared',
  'isContestUser',
  'createdAt',
];

const solutionJudgeInfoFields: Array<TMJudgeInfoFields> = [
  'judgeInfoId',
  'solutionId',
  'problemRevision',
  'result',
  'time',
  'memory',
  'lastCase',
  'totalCase',
  'detail',
  'createdAt',
  'finishedAt',
];

@provide()
export default class SolutionService {
  @inject('solutionMeta')
  meta: CSolutionMeta;

  @inject('solutionModel')
  model: TSolutionModel;

  @inject()
  compileInfoModel: TCompileInfoModel;

  @inject()
  codeModel: TCodeModel;

  @inject()
  judgeInfoModel: TJudgeInfoModel;

  @inject()
  problemService: CProblemService;

  @inject()
  userService: CUserService;

  @inject()
  contestService: CContestService;

  @inject()
  competitionService: CCompetitionService;

  @inject()
  competitionEventService: CCompetitionEventService;

  @inject()
  userAchievementService: CUserAchievementService;

  @inject()
  setService: CSetService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;

  @config('judger')
  judgerConfig: IJudgerConfig;

  @config('socketBridge')
  socketBridgeConfig: IAppConfig['socketBridge'];

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param solutionId solutionId
   */
  private async _getDetailCache(
    solutionId: ISolutionModel['solutionId'],
  ): Promise<IMSolutionDetailPlainFull | null | ''> {
    return this.ctx.helper
      .redisGet<IMSolutionDetailPlainFull>(this.meta.detailCacheKey, [solutionId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
  }

  /**
   * 设置详情缓存。
   * @param solutionId solutionId
   * @param data 详情数据
   */
  private async _setDetailCache(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionDetailPlainFull | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [solutionId],
      data,
      data
        ? data.result === ESolutionResult.WT || data.result === ESolutionResult.JG
          ? 1
          : this.durations.cacheDetailMedium
        : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取用户题目提交统计缓存。
   * 如果未找到缓存，则返回 `null`
   * @param userId userId
   */
  private async _getUserProblemResultStatsCache(
    userId: ISolutionModel['userId'],
  ): Promise<IMSolutionUserProblemResultStats | null> {
    return this.ctx.helper.redisGet<IMSolutionUserProblemResultStats>(
      this.redisKey.userProblemResultStats,
      [userId],
    );
  }

  /**
   * 设置用户题目提交统计缓存。
   * @param userId userId
   * @param data 数据
   */
  private async _setUserProblemResultStatsCache(
    userId: ISolutionModel['userId'],
    data: IMSolutionUserProblemResultStats,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.userProblemResultStats,
      [userId],
      data,
      data ? this.durations.cacheDetailMedium : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取比赛题目提交统计缓存。
   * 如果未找到缓存，则返回 `null`
   * @param contestId contestId
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  private async _getContestProblemSolutionStatsCache(
    contestId: ISolutionModel['contestId'],
    withFrozen = false,
  ): Promise<IMSolutionContestProblemSolutionStats | null> {
    return this.ctx.helper.redisGet<IMSolutionContestProblemSolutionStats>(
      withFrozen
        ? this.redisKey.contestProblemResultStatsWithFrozen
        : this.redisKey.contestProblemResultStats,
      [contestId],
    );
  }

  /**
   * 设置比赛题目提交统计缓存。
   * @param contestId contestId
   * @param data 数据
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  private async _setContestProblemSolutionStatsCache(
    contestId: ISolutionModel['contestId'],
    data: IMSolutionContestProblemSolutionStats,
    withFrozen = false,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      withFrozen
        ? this.redisKey.contestProblemResultStatsWithFrozen
        : this.redisKey.contestProblemResultStats,
      [contestId],
      data,
      this.durations.cacheDetailMedium,
    );
  }

  /**
   * 获取比赛题目提交统计缓存。
   * 如果未找到缓存，则返回 `null`
   * @param competitionId competitionId
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  private async _getCompetitionProblemSolutionStatsCache(
    competitionId: ISolutionModel['competitionId'],
    withFrozen = false,
  ): Promise<IMSolutionContestProblemSolutionStats | null> {
    return this.ctx.helper.redisGet<IMSolutionContestProblemSolutionStats>(
      withFrozen
        ? this.redisKey.competitionProblemResultStatsWithFrozen
        : this.redisKey.competitionProblemResultStats,
      [competitionId],
    );
  }

  /**
   * 设置比赛题目提交统计缓存。
   * @param competitionId competitionId
   * @param data 数据
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  private async _setCompetitionProblemSolutionStatsCache(
    competitionId: ISolutionModel['competitionId'],
    data: IMSolutionContestProblemSolutionStats,
    withFrozen = false,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      withFrozen
        ? this.redisKey.competitionProblemResultStatsWithFrozen
        : this.redisKey.competitionProblemResultStats,
      [competitionId],
      data,
      this.durations.cacheDetailShort,
    );
  }

  /**
   * 获取用户提交日历图统计缓存。
   * 如果未找到缓存，则返回 `null`
   * @param userId userId
   * @param result 提交结果
   */
  private async _getUserSolutionCalendarCache(
    userId: ISolutionModel['userId'],
    result: ESolutionResult,
  ): Promise<IMSolutionCalendar | null> {
    return this.ctx.helper.redisGet<IMSolutionCalendar>(this.redisKey.userSolutionCalendar, [
      userId,
      result,
    ]);
  }

  /**
   * 设置用户提交日历图统计缓存。
   * @param userId userId
   * @param result 提交结果
   * @param data 数据
   */
  private async _setUserSolutionCalendarCache(
    userId: ISolutionModel['userId'],
    result: ESolutionResult,
    data: IMSolutionCalendar,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.userSolutionCalendar,
      [userId, result],
      data,
      this.durations.cacheDetail,
    );
  }

  /**
   * 获取评测信息缓存。
   * 如果未找到缓存，则返回 `null`
   * @param judgeInfoId judgeInfoId
   */
  private async _getSolutionJudgeInfoCache(
    judgeInfoId: number,
  ): Promise<IMSolutionJudgeInfo | null> {
    return this.ctx.helper.redisGet<IMSolutionJudgeInfo>(this.redisKey.solutionJudgeInfo, [
      judgeInfoId,
    ]);
  }

  /**
   * 设置评测信息缓存。
   * @param judgeInfoId judgeInfoId
   * @param data 数据
   */
  private async _setSolutionJudgeInfoCache(
    judgeInfoId: number,
    data: IMSolutionJudgeInfo | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.solutionJudgeInfo,
      [judgeInfoId],
      data,
      data ? this.durations.cacheDetailMedium : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMSolutionServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      solutionId: opts.solutionId,
      problemId: opts.problemId,
      userId: opts.userId,
      contestId: opts.contestId,
      competitionId: opts.competitionId,
      result: opts.result,
      language: opts.language,
    });
    if (opts.solutionIds) {
      where.solutionId = {
        [Op.in]: opts.solutionIds,
      };
    }
    return {
      where,
    };
  }

  private async _handleRelativeData<T extends IMSolutionLitePlain>(
    data: T[],
  ): Promise<
    Array<
      Omit<T, 'problemId' | 'userId' | 'contestId' | 'competitionId' | 'judgeInfoId'> & {
        problem: IMSolutionRelativeProblem;
      } & {
        user: IMSolutionRelativeUser;
      } & {
        contest?: IMSolutionRelativeContest;
      } & {
        competition?: IMSolutionRelativeCompetition;
      } & {
        judgeInfo?: IMSolutionJudgeInfo;
      }
    >
  > {
    const problemIds = data.map((d) => d.problemId);
    const userIds = data.filter((d) => !d.isContestUser).map((d) => d.userId);
    const contestUserIds = data.filter((d) => d.isContestUser).map((d) => d.userId);
    const contestIds = data.filter((d) => d.contestId > 0).map((d) => d.contestId);
    const competitionUserKeys = data
      .filter((d) => d.competitionId)
      .map((d) => `${d.competitionId}_${d.userId}`);
    const competitionIds = data
      .filter((d) => d.competitionId)
      .map((d) => d.competitionId) as number[];
    const judgeInfoIds = data.filter((d) => d.judgeInfoId).map((d) => d.judgeInfoId) as number[];

    const [
      relativeProblems,
      relativeUsers,
      relativeContestUsers,
      relativeContests,
      relativeCompetitionUsers,
      relativeCompetitions,
      relativeJudgeInfos,
    ] = await Promise.all([
      this.problemService.getRelative(problemIds, null),
      this.userService.getRelative(userIds, null),
      this.contestService.getRelativeContestUser(contestUserIds),
      this.contestService.getRelative(contestIds, null),
      this.competitionService.getRelativeCompetitionUser(competitionUserKeys),
      this.competitionService.getRelative(competitionIds, null),
      this.getRelativeJudgeInfo(judgeInfoIds),
    ]);

    return data.map((d) => {
      const relativeProblem = relativeProblems[d.problemId];
      const relativeContest = relativeContests[d.contestId];
      const relativeCompetition = relativeCompetitions[d.competitionId!];
      const relativeJudgeInfo = relativeJudgeInfos[d.judgeInfoId!];
      let user: IMSolutionRelativeUser;
      if (d.isContestUser) {
        const relativeUser = relativeContestUsers[d.userId];
        user = {
          userId: relativeUser?.contestUserId,
          username: relativeUser?.username,
          nickname: relativeUser?.nickname,
          avatar: relativeUser?.avatar || '',
          bannerImage: '',
          rating: relativeUser?.rating || 0,
        };
      } else if (d.competitionId) {
        const relativeUser = relativeUsers[d.userId];
        const relativeCompetitionUser = relativeCompetitionUsers[`${d.competitionId}_${d.userId}`];
        user = {
          userId: d.userId,
          username: relativeUser?.username || '',
          nickname: relativeCompetitionUser?.info?.nickname || relativeUser?.nickname || '',
          avatar: relativeUser?.avatar || '',
          bannerImage: relativeUser?.bannerImage || '',
          rating: relativeUser?.rating || 0,
          type: relativeUser?.type,
        };
      } else {
        const relativeUser = relativeUsers[d.userId];
        user = {
          userId: relativeUser?.userId,
          username: relativeUser?.username || '',
          nickname: relativeUser?.nickname || '',
          avatar: relativeUser?.avatar || '',
          bannerImage: relativeUser?.bannerImage || '',
          rating: relativeUser?.rating || 0,
          type: relativeUser?.type,
        };
      }

      const ret = this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, [
          'problemId',
          'userId',
          'contestId',
          'competitionId',
          'judgeInfoId',
        ]),
        problem: {
          problemId: relativeProblem?.problemId,
          title: relativeProblem?.title,
          timeLimit: relativeProblem?.timeLimit,
          memoryLimit: relativeProblem?.memoryLimit,
          spj: relativeProblem?.spj,
          spConfig: relativeProblem?.spConfig,
          revision: relativeProblem?.revision,
        },
        user,
        contest: relativeContest
          ? {
              contestId: relativeContest.contestId,
              title: relativeContest.title,
              type: relativeContest.type,
              startAt: relativeContest.startAt,
              endAt: relativeContest.endAt,
              ended: relativeContest.ended,
              frozenLength: relativeContest.frozenLength,
            }
          : undefined,
        competition: relativeCompetition
          ? {
              competitionId: relativeCompetition.competitionId,
              title: relativeCompetition.title,
              rule: relativeCompetition.rule,
              isTeam: relativeCompetition.isTeam,
              isRating: relativeCompetition.isRating,
              ended: relativeCompetition.ended,
              startAt: relativeCompetition.startAt,
              endAt: relativeCompetition.endAt,
              settings: relativeCompetition.settings,
            }
          : undefined,
        judgeInfo: relativeJudgeInfo ?? undefined,
      });
      if (!relativeContest) {
        delete ret.contest;
      }
      return ret;
    });
  }

  /**
   * 获取提交列表。
   * @param options 查询参数
   * @param pagination 分页参数
   */
  async getList(
    options: IMSolutionServiceGetListOpt,
    pagination: IMSolutionListPagination,
  ): Promise<IMSolutionServiceGetListRes> {
    const query = this._formatListQuery(options);
    const pkOrderDirection = pagination.gt !== undefined ? 'ASC' : 'DESC';
    let pkWhere: any;
    if (pagination.lt) {
      pkWhere = {
        [Op.lt]: pagination.lt,
      };
    } else if (pagination.gt) {
      pkWhere = {
        [Op.gt]: pagination.gt,
      };
    }
    let needReverse = false;
    let order = [...pagination.order];
    const solutionOrderIndex = order.findIndex((o) => o[0] === 'solutionId');
    if (solutionOrderIndex === -1) {
      order.unshift(['solutionId', pkOrderDirection]);
    } else {
      if (pkOrderDirection !== order[solutionOrderIndex][1]) {
        needReverse = true;
      }
      order[solutionOrderIndex] = ['solutionId', pkOrderDirection];
    }
    const res = await this.model
      .findAll({
        attributes: solutionLiteFields,
        where:
          query.where.solutionId || !pkWhere
            ? query.where
            : {
                ...query.where,
                solutionId: pkWhere,
              },
        limit: pagination.limit,
        order,
      })
      .then((r) => {
        const rows = r.map((d) => d.get({ plain: true }) as IMSolutionLitePlain);
        return needReverse ? rows.reverse() : rows;
      });
    return this._handleRelativeData(res);
  }

  /**
   * 获取提交详情。
   * @param solutionId solutionId
   */
  async getDetail(
    solutionId: ISolutionModel['solutionId'],
  ): Promise<IMSolutionServiceGetDetailRes> {
    let res: IMSolutionDetailPlainFull | null = null;
    const cached = await this._getDetailCache(solutionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      const dbRes = await this.model
        .findOne({
          attributes: solutionDetailFields,
          where: {
            solutionId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMSolutionDetailPlain));
      const compileInfo =
        (
          await this.compileInfoModel.findOne({
            attributes: ['compileInfo'],
            where: {
              solutionId,
            },
          })
        )?.compileInfo || '';
      const code =
        (
          await this.codeModel.findOne({
            attributes: ['code'],
            where: {
              solutionId,
            },
          })
        )?.code || '';
      res = dbRes
        ? {
            ...dbRes,
            compileInfo,
            code,
          }
        : null;
      await this._setDetailCache(solutionId, res);
    }
    if (!res) {
      return res;
    }
    const [ret] = await this._handleRelativeData([res]);
    return ret;
  }

  /**
   * 获取指定提交的创建时间。
   * @param solutionId solutionId
   * @returns 创建时间
   */
  async getSolutionCreateTime(solutionId: ISolutionModel['solutionId']): Promise<Date | undefined> {
    const dbRes = await this.model.findOne({
      attributes: ['createdAt'],
      where: {
        solutionId,
      },
    });
    return dbRes?.createdAt;
  }

  /**
   * 按 pk 关联查询提交详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   */
  async getRelative(
    keys: ISolutionModel['solutionId'][],
  ): Promise<IMSolutionServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: Record<ISolutionModel['solutionId'], IMSolutionDetailPlainFull> = {};
    let uncached: typeof keys = [];
    for (const k of ks) {
      const cached = await this._getDetailCache(k);
      if (cached) {
        res[k] = cached;
      } else if (cached === null) {
        uncached.push(k);
      }
    }
    if (uncached.length) {
      const dbRes = await this.model
        .findAll({
          attributes: solutionDetailFields,
          where: {
            solutionId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMSolutionDetailPlain));
      for (const d of dbRes) {
        const { solutionId } = d;
        const compileInfo =
          (
            await this.compileInfoModel.findOne({
              attributes: ['compileInfo'],
              where: {
                solutionId,
              },
            })
          )?.compileInfo || '';
        const code =
          (
            await this.codeModel.findOne({
              attributes: ['code'],
              where: {
                solutionId,
              },
            })
          )?.code || '';
        const fd = d
          ? {
              ...d,
              compileInfo,
              code,
            }
          : null;
        fd && (res[solutionId] = fd);
        await this._setDetailCache(solutionId, fd);
      }
      // 查不到的也要缓存
      for (const k of ks) {
        !res[k] && (await this._setDetailCache(k, null));
      }
    }
    // @ts-ignore
    const ids = Object.keys(res) as number[];
    const resArr = ids.map((k: number) => res[k]);
    const handledResArr = await this._handleRelativeData(resArr);
    const handledRes: IMSolutionServiceGetRelativeRes = {};
    ids.forEach((k, index) => {
      handledRes[k] = handledResArr[index];
    });
    return handledRes;
  }

  /**
   * 按 judgeInfoId 关联查询评测信息。
   * 如果部分查询的 judgeInfoId 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 judgeInfoId 列表
   */
  async getRelativeJudgeInfo(keys: number[]): Promise<IMSolutionServiceGetRelativeJudgeInfoRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMSolutionServiceGetRelativeJudgeInfoRes = {};
    let uncached: typeof keys = [];
    for (const k of ks) {
      const cached = await this._getSolutionJudgeInfoCache(k);
      if (cached) {
        res[k] = cached;
      } else if (cached === null) {
        uncached.push(k);
      }
    }
    if (uncached.length) {
      const dbRes = await this.judgeInfoModel
        // .scope(scope || undefined)
        .findAll({
          attributes: solutionJudgeInfoFields,
          where: {
            judgeInfoId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) =>
          r.map((d) => {
            const plain = d.get({ plain: true }) as IMSolutionJudgeInfoFull;
            return plain;
          }),
        );
      for (const d of dbRes) {
        const { judgeInfoId } = d;
        delete d.judgeInfoId;
        delete d.solutionId;
        res[judgeInfoId] = d;
        await this._setSolutionJudgeInfoCache(judgeInfoId, d);
      }
      for (const k of ks) {
        !res[k] && (await this._setSolutionJudgeInfoCache(k, null));
      }
    }
    return res;
  }

  /**
   * 创建提交。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMSolutionServiceCreateOpt): Promise<IMSolutionServiceCreateRes> {
    const { code } = data;
    const res = await this.model.create(this.lodash.omit(data, ['code']));
    await this.codeModel.create({ solutionId: res.solutionId, code });
    return res.solutionId;
  }

  /**
   * 更新提交（部分更新）。
   * @param solutionId solutionId
   * @param data 更新数据
   */
  async update(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionServiceUpdateOpt,
  ): Promise<IMSolutionServiceUpdateRes> {
    const { compileInfo } = data;
    const res = await this.model.update(this.lodash.omit(data, ['compileInfo']), {
      where: {
        solutionId,
      },
    });
    if (compileInfo) {
      await this.compileInfoModel.findOrCreate({
        where: {
          solutionId,
        },
        defaults: {
          compileInfo: '',
        },
      });
      await this.compileInfoModel.update(
        { compileInfo },
        {
          where: {
            solutionId,
          },
        },
      );
    } else if (compileInfo === null) {
      await this.compileInfoModel.destroy({
        where: {
          solutionId,
        },
      });
    }
    return res[0] > 0;
  }

  /**
   * 批量根据 ID 更新提交（部分更新）。
   * @param solutionIds solutionIds
   * @param data 更新数据（不包含 compileInfo）
   */
  async batchUpdateBySolutionIds(
    solutionIds: ISolutionModel['solutionId'][],
    data: IMSolutionServiceUpdateOpt,
  ): Promise<number> {
    const res = await this.model.update(this.lodash.omit(data, ['compileInfo']), {
      where: {
        solutionId: {
          [Op.in]: solutionIds,
        },
      },
    });
    return res[0];
  }

  /**
   * 清除详情缓存。
   * @param solutionId solutionId
   */
  async clearDetailCache(solutionId: ISolutionModel['solutionId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [solutionId]);
  }

  /**
   * 获取指定用户提交过的 problemId 列表（去重）。
   * @param userId userId
   * @param contestId contestId
   * @param competitionId competitionId
   * @param result 评测结果
   */
  async getUserSubmittedProblemIds(
    userId: ISolutionModel['userId'],
    contestId?: ISolutionModel['contestId'],
    competitionId?: ISolutionModel['competitionId'],
    result?: ESolutionResult,
  ): Promise<ISolutionModel['problemId'][]> {
    return this.model
      .findAll({
        attributes: [[sequelizeFn('DISTINCT', sequelizeCol('problem_id')), 'problemId']],
        // @ts-ignore
        where: this.utils.misc.ignoreUndefined({
          userId,
          contestId,
          competitionId,
          result,
        }),
      })
      .then((r: any) => r.map((d: any) => d.problemId));
  }

  /**
   * 获取用户题目的 已通过/已尝试未通过 提交统计。
   * @param userId userId
   * @param contestId contestId
   * @param competitionId competitionId
   */
  async getUserProblemResultStats(
    userId: ISolutionModel['userId'],
    contestId?: ISolutionModel['contestId'],
    competitionId?: ISolutionModel['competitionId'],
  ): Promise<IMSolutionUserProblemResultStats> {
    let res: IMSolutionUserProblemResultStats | null = null;
    if (!contestId && !competitionId) {
      const cached = await this._getUserProblemResultStatsCache(userId);
      cached && (res = cached);
    }
    if (!res) {
      const [acceptedProblemIds, submittedProblemIds] = await Promise.all([
        this.getUserSubmittedProblemIds(userId, contestId, competitionId, ESolutionResult.AC),
        this.getUserSubmittedProblemIds(userId, contestId, competitionId),
      ]);
      const attemptedProblemIds = this.lodash.difference(submittedProblemIds, acceptedProblemIds);
      res = { acceptedProblemIds, attemptedProblemIds };
      !contestId && !competitionId && (await this._setUserProblemResultStatsCache(userId, res));
    }
    return res;
  }

  /**
   * 获取比赛内的题目提交统计（accepted/submitted）。
   * @param contestId contestId
   * @param problemIds 比赛 problemId 列表
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  async getContestProblemSolutionStats(
    contestId: ISolutionModel['contestId'],
    problemIds: ISolutionModel['problemId'][],
    withFrozen: boolean,
  ): Promise<IMSolutionServiceGetContestProblemSolutionStatsRes> {
    let res: IMSolutionContestProblemSolutionStats | null = null;
    const cached = await this._getContestProblemSolutionStatsCache(contestId, withFrozen);
    cached && (res = cached);
    if (!res) {
      res = {};
      let frozenStart: Date | null = null;
      if (withFrozen) {
        const contest = await this.contestService.getDetail(contestId, null);
        frozenStart = new Date(contest!.endAt.getTime() - (contest!.frozenLength || 0) * 1000);
      }
      for (const problemId of problemIds) {
        const acWhere: any = {
          contestId,
          problemId,
          result: ESolutionResult.AC,
        };
        const accepted = await this.model.count({
          where: acWhere,
          distinct: true,
          col: 'userId',
        });
        let acceptedWithFrozen = 0;
        if (withFrozen) {
          acceptedWithFrozen = await this.model.count({
            where: {
              ...acWhere,
              createdAt: {
                [Op.lt]: frozenStart,
              },
            },
            distinct: true,
            col: 'userId',
          });
        }
        const unaccepted = await this.model.count({
          where: {
            contestId,
            problemId,
            result: {
              [Op.and]: [
                { [Op.ne]: ESolutionResult.AC },
                { [Op.ne]: ESolutionResult.RPD },
                { [Op.ne]: ESolutionResult.WT },
                { [Op.ne]: ESolutionResult.JG },
                { [Op.ne]: ESolutionResult.CE },
                { [Op.ne]: ESolutionResult.SE },
                { [Op.ne]: ESolutionResult.NLF },
              ],
            },
          },
        });
        res[problemId] = {
          accepted: withFrozen ? acceptedWithFrozen : accepted,
          submitted: accepted + unaccepted,
        };
      }
      await this._setContestProblemSolutionStatsCache(contestId, res, withFrozen);
    }
    return res;
  }

  /**
   * 获取比赛内的题目提交统计（accepted/submitted）。
   * @param competitionId competitionId
   * @param problemIds 比赛 problemId 列表
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  async getCompetitionProblemSolutionStats(
    competitionId: number,
    problemIds: ISolutionModel['problemId'][],
    withFrozen: boolean,
  ): Promise<IMSolutionServiceGetCompetitionProblemSolutionStatsRes> {
    let res: IMSolutionContestProblemSolutionStats | null = null;
    const cached = await this._getCompetitionProblemSolutionStatsCache(competitionId, withFrozen);
    cached && (res = cached);
    if (!res) {
      res = {};
      let frozenStart: Date | null = null;
      if (withFrozen) {
        const competition = await this.competitionService.getDetail(competitionId, null);
        const setting = await this.competitionService.getCompetitionSettingDetail(competitionId);
        frozenStart = new Date(competition!.endAt.getTime() - (setting?.frozenLength || 0) * 1000);
      }
      for (const problemId of problemIds) {
        const acWhere: any = {
          competitionId,
          problemId,
          result: ESolutionResult.AC,
        };
        const accepted = await this.model.count({
          where: acWhere,
          distinct: true,
          col: 'userId',
        });
        let acceptedWithFrozen = 0;
        if (withFrozen) {
          acceptedWithFrozen = await this.model.count({
            where: {
              ...acWhere,
              createdAt: {
                [Op.lt]: frozenStart,
              },
            },
            distinct: true,
            col: 'userId',
          });
        }
        const unaccepted = await this.model.count({
          where: {
            competitionId,
            problemId,
            result: {
              [Op.and]: [
                { [Op.ne]: ESolutionResult.AC },
                { [Op.ne]: ESolutionResult.RPD },
                { [Op.ne]: ESolutionResult.WT },
                { [Op.ne]: ESolutionResult.JG },
                { [Op.ne]: ESolutionResult.CE },
                { [Op.ne]: ESolutionResult.SE },
                { [Op.ne]: ESolutionResult.NLF },
              ],
            },
          },
        });
        res[problemId] = {
          accepted: withFrozen ? acceptedWithFrozen : accepted,
          submitted: accepted + unaccepted,
        };
      }
      await this._setCompetitionProblemSolutionStatsCache(competitionId, res, withFrozen);
    }
    return res;
  }

  /**
   * 清除比赛题目提交统计缓存。
   * @param contestId contestId
   */
  async clearContestProblemSolutionStatsCache(
    contestId: ISolutionModel['contestId'],
  ): Promise<void> {
    await Promise.all([
      this.ctx.helper.redisDel(this.redisKey.contestProblemResultStats, [contestId]),
      this.ctx.helper.redisDel(this.redisKey.contestProblemResultStatsWithFrozen, [contestId]),
    ]);
  }

  /**
   * 清除比赛题目提交统计缓存。
   * @param competitionId competitionId
   * @param withFrozen 是否是封榜视角数据（封榜后的 AC 并入 submitted）
   */
  async clearCompetitionProblemSolutionStatsCache(
    competitionId: ISolutionModel['competitionId'],
    withFrozen = false,
  ): Promise<void> {
    return this.ctx.helper.redisDel(
      withFrozen
        ? this.redisKey.competitionProblemResultStatsWithFrozen
        : this.redisKey.competitionProblemResultStats,
      [competitionId],
    );
  }

  /**
   * 获取用户提交日历图统计
   * @param userId userId
   * @param result 指定 result
   */
  async getUserSolutionCalendar(
    userId: ISolutionModel['userId'],
    result: ESolutionResult = ESolutionResult.AC,
    ignoreCache = false,
  ): Promise<IMSolutionServiceGetUserSolutionCalendarRes> {
    let res: IMSolutionCalendar | null = null;
    const cached = ignoreCache ? null : await this._getUserSolutionCalendarCache(userId, result);
    cached && (res = cached);
    if (!res) {
      // Author: MeiK
      if (result !== ESolutionResult.AC) {
        res = await DB.sequelize.query(
          `SELECT DATE(sub_time) as date, COUNT(*) AS count FROM solution WHERE user_id=? AND result=? GROUP BY DATE(sub_time)`,
          {
            replacements: [userId, result],
            type: QueryTypes.SELECT,
          },
        );
      } else {
        // 如果获取 AC 状态，则每个题目只计算第一次 AC
        res = await DB.sequelize.query(
          `SELECT DATE(sub_time) AS date, COUNT(*) AS count FROM (SELECT MIN(sub_time) AS sub_time FROM solution WHERE user_id=? AND result=? GROUP BY problem_id) AS r GROUP BY DATE(sub_time)`,
          {
            replacements: [userId, result],
            type: QueryTypes.SELECT,
          },
        );
      }
      await this._setUserSolutionCalendarCache(userId, result, res);
    }
    return res;
  }

  /**
   * 清除用户提交日历统计缓存。
   * @param userId userId
   * @param result 提交结果
   */
  async clearUserSolutionCalendarCache(
    userId: ISolutionModel['userId'],
    result: ESolutionResult,
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.userSolutionCalendar, [userId, result]);
  }

  /**
   * 获取比赛的所有提交。按 solutionId 递增。
   * @param contestId contestId
   */
  async getAllContestSolutionList(
    contestId: ISolutionModel['contestId'],
  ): Promise<IMSolutionServiceGetAllContestSolutionListRes> {
    const res = await this.model
      .findAll({
        attributes: solutionLiteFields,
        where: {
          contestId,
        },
        order: [[this.meta.pk, 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMSolutionLitePlain));
    return res;
  }

  /**
   * 获取比赛的所有提交。按 solutionId 递增。
   * @param competitionId competitionId
   */
  async getAllCompetitionSolutionList(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMSolutionServiceGetAllCompetitionSolutionListRes> {
    const res = await this.model
      .findAll({
        attributes: solutionLiteFields,
        where: {
          competitionId,
        },
        order: [[this.meta.pk, 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMSolutionLitePlain));
    return res;
  }

  /**
   * 获取指定用户在指定比赛的所有提交。
   * @param competitionId competitionId
   * @param userId userId
   */
  async getAllCompetitionSolutionListByUserId(
    competitionId: ICompetitionModel['competitionId'],
    userId: IUserModel['userId'],
  ): Promise<IMSolutionServiceGetAllCompetitionSolutionListByUserIdRes> {
    const res = await this.model
      .findAll({
        attributes: solutionLiteFields,
        where: {
          competitionId,
          userId,
        },
        order: [[this.meta.pk, 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMSolutionLitePlain));
    return res;
  }

  /**
   * 判断提交所有者是否是自己。
   * @param ctx ctx
   * @param detail 提交详情
   */
  isSolutionSelf(ctx: Context, detail: IMSolutionLite | IMSolutionDetail): boolean {
    return !!(
      (ctx.loggedIn && ctx.session.userId === detail.user.userId) ||
      (detail.contest?.contestId &&
        detail.isContestUser &&
        detail.user.userId &&
        ctx.helper.getContestSession(detail.contest.contestId)?.userId === detail.user.userId) ||
      (detail.competition &&
        detail.user.userId &&
        ctx.helper.getCompetitionSession(detail.competition.competitionId)?.userId ===
          detail.user.userId)
    );
  }

  // /**
  //  * 根据条件获取所有提交的 ID。
  //  * @param options 查询条件
  //  */
  // async findAllSolutionIds(
  //   options: IMSolutionServiceFindAllSolutionIdsOpt,
  // ): Promise<IMSolutionServiceFindAllSolutionIdsRes> {
  //   if (Object.keys(options).length === 0) {
  //     return [];
  //   }
  //   const res = await this.model
  //     .findAll({
  //       attributes: ['solutionId'],
  //       where: options as any,
  //     })
  //     .then((r) => r.map((d) => d.solutionId));
  //   return res;
  // }

  /**
   * 根据条件获取所有提交的各项 ID。
   * @param options 查询条件
   */
  async findAllSolutionWithIds(
    options: IMSolutionServiceFindAllSolutionWithIdsOpt,
  ): Promise<IMSolutionServiceFindAllSolutionWithIdsRes> {
    if (Object.keys(options).length === 0) {
      return [];
    }
    const res = await this.model
      .findAll({
        attributes: [
          'solutionId',
          'problemId',
          'userId',
          'contestId',
          'competitionId',
          'judgeInfoId',
          'language',
        ],
        where: options as any,
        order: [[this.meta.pk, 'ASC']],
      })
      .then((r) =>
        r.map((d) => ({
          solutionId: d.solutionId,
          problemId: d.problemId,
          userId: d.userId,
          contestId: d.contestId,
          competitionId: d.competitionId,
          judgeInfoId: d.judgeInfoId,
          language: d.language,
        })),
      );
    return res;
  }

  /**
   * 获取评测状态。
   * 如果未找到，则返回 `null`
   * @param judgeInfoId judgeInfoId
   */
  async getSolutionJudgeStatus(judgeInfoId: number): Promise<IMSolutionJudgeStatus | null> {
    return this.ctx.helper.redisGet<IMSolutionJudgeStatus>(this.redisKey.judgeStatus, [
      judgeInfoId,
    ]);
  }

  /**
   * 设置评测状态。
   * @param judgeInfoId judgeInfoId
   * @param data 数据
   */
  async setSolutionJudgeStatus(judgeInfoId: number, data: IMSolutionJudgeStatus): Promise<void> {
    return this.ctx.helper.redisSet(this.redisKey.judgeStatus, [judgeInfoId], data);
  }

  /**
   * 删除评测状态。
   * @param judgeInfoId judgeInfoId
   */
  async delSolutionJudgeStatus(judgeInfoId: number): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.judgeStatus, [judgeInfoId]);
  }

  /**
   * 获取 Pending 的提交列表。
   * @param limit 拉取数量
   */
  async getPendingSolutions(limit: number): Promise<IMSolutionServiceGetPendingSolutionsRes> {
    const res = await this.model.findAll({
      attributes: ['solutionId', 'problemId', 'userId'],
      where: {
        result: ESolutionResult.RPD,
      },
      order: [[this.meta.pk, 'ASC']],
      limit,
    });
    // @ts-ignore
    return res.map((d) => d.get({ plain: true }));
  }

  /**
   * 推送评测状态到所有订阅的客户端。
   * @param solutionId
   * @param statusFormArray
   */
  pushJudgeStatus(solutionId: ISolutionModel['solutionId'], statusFormArray: any[]) {
    // // @ts-ignore
    // this.ctx.app.io.of('/judger').to(`s:${solutionId}`).emit('s', status);
    const start = Date.now();
    axiosSocketBrideInstance({
      url: `${this.socketBridgeConfig.baseUrl}/pushJudgeStatus`,
      method: 'POST',
      data: statusFormArray,
      headers: {
        'x-emit-auth': this.socketBridgeConfig.emitAuthKey,
      },
    })
      .then((res) => {
        this.ctx.logger.info(
          `pushJudgeStatus(${Date.now() - start}ms) succ, solutionId: ${solutionId}`,
        );
      })
      .catch((e) => {
        this.ctx.logger.error(`pushJudgeStatus err, solutionId: ${solutionId}, err:`, e.message);
      });
  }

  /**
   * 创建 judge info 数据。
   * @param solutionId
   * @param data
   * @returns judgeInfoId
   */
  async createJudgeInfo(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionServiceCreateJudgeInfoOpt,
  ): Promise<number> {
    const res = await this.judgeInfoModel.create({
      solutionId,
      result: ESolutionResult.RPD,
      time: 0,
      memory: 0,
      lastCase: 0,
      totalCase: 0,
      detail: null,
      createdAt: new Date(),
      finishedAt: null,
      ...data,
    });
    return res.judgeInfoId;
  }

  /**
   * 更新 judge info 数据。
   * @param judgeInfoId
   * @param data
   */
  async updateJudgeInfo(judgeInfoId: number, data: IMSolutionServiceUpdateJudgeInfoOpt) {
    await this.judgeInfoModel.update(data, {
      where: {
        judgeInfoId,
      },
    });
  }

  /**
   * 清除评测信息缓存。
   * @param judgeInfoId judgeInfoId
   */
  async clearSolutionJudgeInfoCache(judgeInfoId: number): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.solutionJudgeInfo, [judgeInfoId]);
  }

  /**
   * 提交评测。
   * @param options
   */
  async judge(options: IMSolutionServiceJudgeOpt): Promise<IMSolutionServiceJudgeRes> {
    const { judgeInfoId, solutionId, problemId, userId } = options;
    const judgeType = options.spj ? river.JudgeType.Special : river.JudgeType.Standard;
    const logger = this.ctx.getLogger('judgerLogger');

    if (!options.code) {
      throw new Error(`No Code`);
    }

    try {
      const language = this.utils.judger.convertOJLanguageToRiver(options.language);
      if (!language) {
        throw new Error(`Invalid Language ${options.language}`);
      }
      if (!options.problemId) {
        throw new Error(`No Problem Specified`);
      }

      const eventTimestampUs = microtime.now();
      logger.info(`[${solutionId}/${problemId}/${userId}] begin`);
      await this.setSolutionJudgeStatus(judgeInfoId, {
        solutionId,
        judgerId: `${os.hostname()}-${process.pid}`,
        status: 'ready',
        eventTimestampUs,
      });

      // @ts-ignore
      const judger = this.ctx.app.judger as Judger;
      const spjFile = options.spj ? 'spj' : undefined;
      logger.info(
        `[${solutionId}/${problemId}/${userId}] getJudgeCall`,
        JSON.stringify({
          problemId,
          language,
          code: `string(${options.code.length})`,
          timeLimit: options.timeLimit,
          memoryLimit: options.memoryLimit,
          judgeType,
          spjFile,
        }),
      );

      const call = judger.getJudgeCall({
        problemId,
        language,
        code: options.code,
        timeLimit: options.timeLimit,
        memoryLimit: options.memoryLimit,
        judgeType,
        spjFile,
        onStart: () => {
          console.log(process.pid, 'start judge', solutionId);
          logger.info(`[${solutionId}/${problemId}/${userId}] onStart`);
          this.pushJudgeStatus(solutionId, [solutionId, 0, ESolutionResult.JG]);
        },
        onJudgeCaseStart: (current, total) => {
          console.log(`${current}/${total} Running`);
          logger.info(
            `[${solutionId}/${problemId}/${userId}] onJudgeCaseStart ${current}/${total}`,
          );

          this.setSolutionJudgeStatus(solutionId, {
            solutionId,
            judgerId: `${os.hostname()}-${process.pid}`,
            status: 'running',
            eventTimestampUs: microtime.now(),
            current,
            total,
          });
          this.pushJudgeStatus(solutionId, [solutionId, 0, ESolutionResult.JG, current, total]);
        },
        onJudgeCaseDone: (current, total, res) => {
          console.log(`${current}/${total} Done:`, res);
          logger.info(`[${solutionId}/${problemId}/${userId}] onJudgeCaseDone ${current}/${total}`);
          return res.result === river.JudgeResultEnum.Accepted;
        },
      });

      const jResult = await call.run();
      console.log('call res', jResult);
      logger.info(`[${solutionId}/${problemId}/${userId}] done`, JSON.stringify(jResult));
      switch (jResult.type) {
        case 'CompileError': {
          const result = ESolutionResult.CE;
          const compileInfo = jResult.res;
          await this.update(solutionId, {
            result,
            compileInfo,
          });
          await this.clearDetailCache(solutionId);
          this.pushJudgeStatus(solutionId, [solutionId, 1, result]);
          break;
        }
        case 'SystemError': {
          logger.warn(`[${solutionId}/${problemId}/${userId}] SystemError`, jResult.res);
          const result = ESolutionResult.SE;
          await this.update(solutionId, {
            result,
            compileInfo: null,
          });
          await this.clearDetailCache(solutionId);
          this.pushJudgeStatus(solutionId, [solutionId, 1, result]);
          break;
        }
        case 'Done': {
          const result: ESolutionResult = this.utils.judger.convertRiverResultToOJ(
            jResult.res[jResult.res.length - 1].result!,
          );
          let maxTimeUsed = 0;
          let maxMemoryUsed = 0;
          jResult.res.forEach((r) => {
            // @ts-ignore
            maxTimeUsed = Math.max(maxTimeUsed, r.timeUsed);
            // @ts-ignore
            maxMemoryUsed = Math.max(maxMemoryUsed, r.memoryUsed);
          });
          await this.update(solutionId, {
            result,
            time: maxTimeUsed,
            memory: maxMemoryUsed,
            compileInfo: null,
          });
          await this.clearDetailCache(solutionId);
          // 更新评测信息
          await this.updateJudgeInfo(judgeInfoId, {
            result,
            time: maxTimeUsed,
            memory: maxMemoryUsed,
            lastCase: jResult.last,
            totalCase: jResult.total,
            detail: {
              cases: jResult.res.map((r) => ({
                result: this.utils.judger.convertRiverResultToOJ(r.result!),
                // @ts-ignore
                time: r.timeUsed as number,
                // @ts-ignore
                memory: r.memoryUsed as number,
                errMsg: (r.errmsg || undefined) as string | undefined,
                outMsg: (r.outmsg || undefined) as string | undefined,
              })),
            },
            finishedAt: new Date(),
          });
          await this.clearSolutionJudgeInfoCache(judgeInfoId);
          // 推送完成状态
          this.pushJudgeStatus(solutionId, [solutionId, 1, result, jResult.last, jResult.total]);
          // 需要更新计数，异步后处理
          this.updateSolutionProblemStats(problemId);
          this.updateSolutionUserStats(userId);
          console.log('judge all ok', solutionId);
          // break;
        }
      }
    } catch (e) {
      console.error('Failed to judge', e);
      logger.error(`[${solutionId}/${problemId}/${userId}] Caught error`, e);
      const result = ESolutionResult.SE;
      await this.update(solutionId, {
        result,
      });
      await this.clearDetailCache(solutionId);
      this.pushJudgeStatus(solutionId, [solutionId, 1, result]);
    } finally {
      await this.delSolutionJudgeStatus(solutionId);
    }
  }

  async checkIsJudgeStale(judgeInfoId: number, solutionId: number) {
    const res = await this.model.count({
      where: {
        solutionId,
        judgeInfoId,
      },
    });
    return res === 0;
  }

  async updateStaleJudgeInfoAsCancelled(judgeInfoId: number) {
    if (!judgeInfoId) {
      return false;
    }
    const res = await this.judgeInfoModel.update(
      {
        result: ESolutionResult.CNL,
      },
      {
        where: {
          judgeInfoId,
          result: {
            [Op.in]: [ESolutionResult.RPD, ESolutionResult.JG],
          },
        },
      },
    );
    return res[0] > 0;
  }

  async updateJudgeStart(
    judgeInfoId: number,
    solutionId: number,
    judgerId: string,
    eventTimestampUs: number,
    redundant: IMSolutionJudgeRedundantData,
  ): Promise<void> {
    if (await this.checkIsJudgeStale(judgeInfoId, solutionId)) {
      this.ctx.logger.info(
        `[updateJudgeStart] stale judge (solutionId=${solutionId}, judgeInfoId=${judgeInfoId}), skip`,
      );
      await Promise.all([
        this.updateStaleJudgeInfoAsCancelled(judgeInfoId),
        this.delSolutionJudgeStatus(judgeInfoId),
      ]);
      return;
    }

    await this.model.update(
      {
        result: ESolutionResult.RPD,
      },
      {
        where: {
          solutionId,
          judgeInfoId,
        },
      },
    );
    const currentJudgeStatus = await this.getSolutionJudgeStatus(judgeInfoId);
    if (currentJudgeStatus && currentJudgeStatus.eventTimestampUs > eventTimestampUs) {
      return;
    }
    await this.setSolutionJudgeStatus(judgeInfoId, {
      solutionId,
      judgerId,
      status: 'ready',
      eventTimestampUs,
    });
    this.pushJudgeStatus(solutionId, [solutionId, 0, ESolutionResult.JG]);
    if (redundant.competitionId) {
      this.competitionEventService.event(redundant.competitionId, ECompetitionEvent.JudgeStart, {
        detail: {
          judgerId,
          ts: eventTimestampUs,
        },
        solutionId,
        judgeInfoId,
        userId: redundant.userId,
        problemId: redundant.problemId,
      });
    }
  }

  async updateJudgeProgress(
    judgeInfoId: number,
    solutionId: number,
    judgerId: string,
    eventTimestampUs: number,
    redundant: IMSolutionJudgeRedundantData,
    current: number,
    total: number,
  ): Promise<void> {
    if (await this.checkIsJudgeStale(judgeInfoId, solutionId)) {
      this.ctx.logger.info(
        `[updateJudgeProgress] stale judge (solutionId=${solutionId}, judgeInfoId=${judgeInfoId}), skip`,
      );
      await Promise.all([
        this.updateStaleJudgeInfoAsCancelled(judgeInfoId),
        this.delSolutionJudgeStatus(judgeInfoId),
      ]);
      return;
    }

    const currentJudgeStatus = await this.getSolutionJudgeStatus(judgeInfoId);
    if (currentJudgeStatus && currentJudgeStatus.eventTimestampUs > eventTimestampUs) {
      return;
    }
    await this.setSolutionJudgeStatus(judgeInfoId, {
      solutionId,
      judgerId,
      status: 'running',
      eventTimestampUs,
      current,
      total,
    });
    this.pushJudgeStatus(solutionId, [solutionId, 0, ESolutionResult.JG, current, total]);
    if (redundant.competitionId) {
      this.competitionEventService.event(redundant.competitionId, ECompetitionEvent.JudgeProgress, {
        detail: {
          current,
          total,
          judgerId,
          ts: eventTimestampUs,
        },
        solutionId,
        judgeInfoId,
        userId: redundant.userId,
        problemId: redundant.problemId,
      });
    }
  }

  async updateJudgeFinish(
    judgeInfoId: number,
    solutionId: number,
    judgerId: string,
    eventTimestampUs: number,
    redundant: IMSolutionJudgeRedundantData,
    resultType: 'CompileError' | 'SystemError' | 'Done',
    detail: any,
  ): Promise<void> {
    if (await this.checkIsJudgeStale(judgeInfoId, solutionId)) {
      this.ctx.logger.info(
        `[updateJudgeFinish] stale judge (solutionId=${solutionId}, judgeInfoId=${judgeInfoId}), skip`,
      );
      await Promise.all([
        this.updateStaleJudgeInfoAsCancelled(judgeInfoId),
        this.delSolutionJudgeStatus(judgeInfoId),
      ]);
      return;
    }

    let result: ESolutionResult = ESolutionResult.SE;
    switch (resultType) {
      case 'CompileError': {
        result = ESolutionResult.CE;
        const { compileInfo } = detail;
        await Promise.all([
          this.updateJudgeInfo(judgeInfoId, {
            result,
            finishedAt: new Date(),
          }),
          this.update(solutionId, {
            result,
            compileInfo,
          }),
        ]);
        await Promise.all([
          this.clearSolutionJudgeInfoCache(judgeInfoId),
          this.clearDetailCache(solutionId),
        ]);
        this.pushJudgeStatus(solutionId, [solutionId, 1, result]);
        // 推送比赛事件
        if (redundant.competitionId) {
          this.competitionEventService.event(
            redundant.competitionId,
            ECompetitionEvent.JudgeFinish,
            {
              detail: {
                resultType,
                result,
                judgerId,
                ts: eventTimestampUs,
              },
              solutionId,
              judgeInfoId,
              userId: redundant.userId,
              problemId: redundant.problemId,
            },
          );
        }
        redundant.userId &&
          this.userAchievementService.addUserAchievementAndPush(
            redundant.userId,
            EAchievementKey.SolutionGetCE,
          );
        break;
      }
      case 'SystemError': {
        this.ctx.logger.error('[updateJudgeFinish] SystemError:', detail);
        result = ESolutionResult.SE;
        await Promise.all([
          this.updateJudgeInfo(judgeInfoId, {
            result,
            finishedAt: new Date(),
          }),
          this.update(solutionId, {
            result,
            compileInfo: null,
          }),
        ]);
        await Promise.all([
          this.clearSolutionJudgeInfoCache(judgeInfoId),
          this.clearDetailCache(solutionId),
        ]);
        this.pushJudgeStatus(solutionId, [solutionId, 1, result]);
        // 推送比赛事件
        if (redundant.competitionId) {
          this.competitionEventService.event(
            redundant.competitionId,
            ECompetitionEvent.JudgeFinish,
            {
              detail: {
                resultType,
                result,
                judgerId,
                ts: eventTimestampUs,
              },
              solutionId,
              judgeInfoId,
              userId: redundant.userId,
              problemId: redundant.problemId,
            },
          );
        }
        break;
      }
      case 'Done': {
        const { maxTimeUsed, maxMemoryUsed, lastCaseNumber, totalCaseNumber, cases } = detail;
        result = detail.result;
        // 更新评测信息
        await Promise.all([
          await this.updateJudgeInfo(judgeInfoId, {
            result,
            time: maxTimeUsed,
            memory: maxMemoryUsed,
            lastCase: lastCaseNumber,
            totalCase: totalCaseNumber,
            detail: {
              cases: cases.map((r: any) => ({
                result: r.result,
                time: r.time,
                memory: r.memory,
                errMsg: r.errMsg,
                outMsg: r.outMsg,
              })),
            },
            finishedAt: new Date(),
          }),
          await this.update(solutionId, {
            result,
            time: maxTimeUsed,
            memory: maxMemoryUsed,
            compileInfo: null,
          }),
        ]);
        await Promise.all([
          this.clearSolutionJudgeInfoCache(judgeInfoId),
          this.clearDetailCache(solutionId),
        ]);
        // 推送完成状态
        this.pushJudgeStatus(solutionId, [solutionId, 1, result, lastCaseNumber, totalCaseNumber]);
        // 推送比赛事件
        if (redundant.competitionId) {
          this.competitionEventService.event(
            redundant.competitionId,
            ECompetitionEvent.JudgeFinish,
            {
              detail: {
                resultType,
                result,
                maxTimeUsed,
                maxMemoryUsed,
                lastCaseNumber,
                totalCaseNumber,
                cases,
                judgerId,
                ts: eventTimestampUs,
              },
              solutionId,
              judgeInfoId,
              userId: redundant.userId,
              problemId: redundant.problemId,
            },
          );
        }
        if (redundant.userId && redundant.problemId) {
          // 更新用户成就
          switch (result) {
            case ESolutionResult.AC: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetAC,
              );
              this.checkOnACAchievements(solutionId);
              break;
            }
            case ESolutionResult.WA: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetWA,
              );
              break;
            }
            case ESolutionResult.PE: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetPE,
              );
              break;
            }
            case ESolutionResult.OLE: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetOLE,
              );
              break;
            }
            case ESolutionResult.TLE: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetTLE,
              );
              break;
            }
            case ESolutionResult.MLE: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetMLE,
              );
              break;
            }
            case ESolutionResult.RTE: {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionGetRTE,
              );
              break;
            }
          }

          if (maxTimeUsed >= 60 * 1000) {
            this.userAchievementService.addUserAchievementAndPush(
              redundant.userId,
              EAchievementKey.SolutionRunsWithLongTime,
            );
          }
          if (maxMemoryUsed > 1 * 1024 * 1024) {
            this.userAchievementService.addUserAchievementAndPush(
              redundant.userId,
              EAchievementKey.SolutionRunsWithLargeMemory,
            );
          }

          if (![ESolutionResult.AC, ESolutionResult.CE].includes(result)) {
            if (totalCaseNumber > 1 && lastCaseNumber === 1) {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionFailedOnFirstTest,
              );
            }
            if (totalCaseNumber > 1 && lastCaseNumber === totalCaseNumber) {
              this.userAchievementService.addUserAchievementAndPush(
                redundant.userId,
                EAchievementKey.SolutionFailedOnLastTest,
              );
            }
          }

          // 不同提交结果数量
          const uniqResultsRes = await this.model.findAll({
            attributes: [[sequelizeFn('DISTINCT', sequelizeCol('result')), 'result']],
            where: {
              userId: redundant.userId,
              problemId: redundant.problemId,
            },
          });
          const uniqResults = uniqResultsRes
            .map((d: any) => d.result)
            .filter(
              (r) =>
                ![
                  ESolutionResult.WT,
                  ESolutionResult.JG,
                  ESolutionResult.RPD,
                  ESolutionResult.CNL,
                  ESolutionResult.SE,
                  ESolutionResult.NLF,
                ].includes(r),
            );
          if (uniqResults.length >= 5) {
            this.userAchievementService.addUserAchievementAndPush(
              redundant.userId,
              EAchievementKey.SolveWithMultiResults,
            );
          }

          // 更新题目和用户的 AC/Submitted 计数
          this.updateSolutionProblemStats(redundant.problemId);
          this.updateSolutionUserStats(redundant.userId);
        } else {
          this.ctx.logger.warn(
            `[updateJudgeFinish] redundant data incomplete. judgeInfoId: ${judgeInfoId}, solutionId: ${solutionId}, judgerId: ${judgerId}`,
          );
        }
        break;
      }
    }

    if (redundant.competitionId) {
      const lastJudgeInfo = await this.judgeInfoModel.findOne({
        where: {
          solutionId,
          judgeInfoId: {
            [Op.lt]: judgeInfoId,
          },
          result: {
            [Op.ne]: ESolutionResult.CNL,
          },
        },
        order: [['judgeInfoId', 'DESC']],
      });
      if (!lastJudgeInfo) {
        this.competitionEventService.event(
          redundant.competitionId,
          ECompetitionEvent.SolutionResultSettle,
          {
            solutionId,
            judgeInfoId,
            detail: {
              result,
            },
            userId: redundant.userId,
            problemId: redundant.problemId,
          },
        );
      } else if (lastJudgeInfo.result !== result) {
        this.competitionEventService.event(
          redundant.competitionId,
          ECompetitionEvent.SolutionResultChange,
          {
            solutionId,
            judgeInfoId,
            detail: {
              previousResult: lastJudgeInfo.result,
              result,
            },
            userId: redundant.userId,
            problemId: redundant.problemId,
          },
        );
      }
    }
    await this.delSolutionJudgeStatus(judgeInfoId);
  }

  async checkOnACAchievements(solutionId: number) {
    const _start = Date.now();
    const detail = await this.getDetail(solutionId);
    if (!detail) {
      return;
    }
    const {
      problem: { problemId },
      user: { userId },
    } = detail;
    this.ctx.logger.info(`[checkOnACAchievements ${solutionId}/${userId}] start`);

    try {
      const hasAchievedKeyCache = new Set<string>();
      // 通过题目数相关
      const userAcceptedProblemIds = await this.getUserSubmittedProblemIds(
        userId,
        undefined,
        undefined,
        ESolutionResult.AC,
      );
      const userAcceptedProblemIdSet = new Set(userAcceptedProblemIds);
      const userAcceptedProblemCount = userAcceptedProblemIds.length;
      if (userAcceptedProblemCount >= 500) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.SolveProblemsLv4,
        );
      } else if (userAcceptedProblemCount >= 200) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.SolveProblemsLv3,
        );
      } else if (userAcceptedProblemCount >= 100) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.SolveProblemsLv2,
        );
      } else if (userAcceptedProblemCount >= 50) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.SolveProblemsLv1,
        );
      }

      // 提交语言相关
      const languages: string[] = await this.model
        .findAll({
          attributes: [[sequelizeFn('DISTINCT', sequelizeCol('pro_lang')), 'language']],
          where: {
            userId,
            result: ESolutionResult.AC,
          },
        })
        .then((r: any) => r.map((d: any) => d.language));
      const languagesSet = new Set(languages.map(standardizeLanguage).filter(Boolean));
      if (languagesSet.size >= 12) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.LanguageUsageLv3,
        );
      } else if (languagesSet.size >= 6) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.LanguageUsageLv2,
        );
      } else if (languagesSet.size >= 3) {
        this.userAchievementService.addUserAchievementAndPush(
          userId,
          EAchievementKey.LanguageUsageLv1,
        );
      }

      // 日期相关
      const acCal = await this.getUserSolutionCalendar(userId, ESolutionResult.AC, true);
      let continuousDays = 0;
      let lastDate: dayjs.Dayjs | null = null;
      for (const acDay of acCal) {
        const { date, count } = acDay;
        if (count <= 0) {
          continue;
        }
        if (!hasAchievedKeyCache.has(EAchievementKey.SolveInOneDay) && count >= 10) {
          this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.SolveInOneDay,
          );
          hasAchievedKeyCache.add(EAchievementKey.SolveInOneDay);
        }
        if (!lastDate) {
          continuousDays = 1;
          lastDate = dayjs(date);
          continue;
        }
        const currentDate = dayjs(date);
        if (currentDate.diff(lastDate, 'day') === 1) {
          continuousDays++;
        } else {
          continuousDays = 1;
        }
        lastDate = currentDate;
        if (
          !hasAchievedKeyCache.has(EAchievementKey.SolveInContinuouslyDayLv2) &&
          continuousDays >= 10
        ) {
          this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.SolveInContinuouslyDayLv2,
          );
          hasAchievedKeyCache.add(EAchievementKey.SolveInContinuouslyDayLv2);
        } else if (
          !hasAchievedKeyCache.has(EAchievementKey.SolveInContinuouslyDayLv1) &&
          continuousDays >= 3
        ) {
          this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.SolveInContinuouslyDayLv1,
          );
          hasAchievedKeyCache.add(EAchievementKey.SolveInContinuouslyDayLv1);
        }
      }

      // 时间段相关
      const nightSolution = await DB.sequelize.query(
        `SELECT solution_id FROM solution WHERE user_id=? AND result=? AND TIME(sub_time) BETWEEN '00:00:00' AND '06:00:00' LIMIT 1`,
        {
          replacements: [userId, ESolutionResult.AC],
          type: QueryTypes.SELECT,
        },
      );
      if (nightSolution.length > 0) {
        this.userAchievementService.addUserAchievementAndPush(userId, EAchievementKey.NightSolver);
      }

      // 当前题目结果相关
      const allSolutionsOfProblem = (
        await this.model.findAll({
          attributes: ['result'],
          where: {
            problemId,
            userId,
          },
          order: [['solutionId', 'ASC']],
        })
      ).filter(
        (s) =>
          ![
            ESolutionResult.WT,
            ESolutionResult.JG,
            ESolutionResult.RPD,
            ESolutionResult.CNL,
            ESolutionResult.SE,
            ESolutionResult.NLF,
          ].includes(s.result),
      );
      let solutionCountBeforeAC = 0;
      for (const { result } of allSolutionsOfProblem) {
        if (result === ESolutionResult.AC) {
          if (solutionCountBeforeAC >= 20) {
            this.userAchievementService.addUserAchievementAndPush(
              userId,
              EAchievementKey.SolveWithAttemptedLv2,
            );
          } else if (solutionCountBeforeAC >= 5) {
            this.userAchievementService.addUserAchievementAndPush(
              userId,
              EAchievementKey.SolveWithAttemptedLv1,
            );
          }
          break;
        }
        solutionCountBeforeAC++;
      }

      // 题目集相关
      const setList = await this.setService.getAll();
      for (const set of setList) {
        const {
          props: { sections },
        } = set;
        let setCompleted = true;
        for (const section of sections) {
          const { problems } = section;
          const sectionProblemIds = problems.map((p) => p.problemId);
          const sectionCompleted = sectionProblemIds.every((p) => userAcceptedProblemIdSet.has(p));
          if (!sectionCompleted) {
            setCompleted = false;
            continue;
          } else if (!hasAchievedKeyCache.has(EAchievementKey.CompleteSetPartially)) {
            this.userAchievementService.addUserAchievementAndPush(
              userId,
              EAchievementKey.CompleteSetPartially,
            );
            hasAchievedKeyCache.add(EAchievementKey.CompleteSetPartially);
          }
        }
        if (setCompleted && !hasAchievedKeyCache.has(EAchievementKey.CompleteSetAll)) {
          this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.CompleteSetAll,
          );
          hasAchievedKeyCache.add(EAchievementKey.CompleteSetAll);
          break;
        }
      }

      this.ctx.logger.info(
        `[checkOnACAchievements ${solutionId}/${userId}] finished in ${Date.now() - _start}ms`,
      );
    } catch (e) {
      this.ctx.logger.error(`[checkOnACAchievements ${solutionId}/${userId}] failed:`, e);
    }
  }

  async sendToJudgeQueue(options: {
    judgeInfoId: number;
    solutionId: ISolutionModel['solutionId'];
    problem: Required<
      Pick<IProblemModel, 'problemId' | 'revision' | 'timeLimit' | 'memoryLimit' | 'spj'>
    >;
    user: Required<Pick<IUserModel, 'userId'>>;
    competition?: Required<Pick<ICompetitionModel, 'competitionId'>>;
    language: string;
    code: string;
  }) {
    if (!this.ctx.app.judgerMqProducer) {
      this.ctx.logger.error('No judger MQ producer');
      return;
    }
    const encoded = await this.utils.judger.encodeJudgeQueueMessage(options);
    const messageId = await this.ctx.app.judgerMqProducer?.send({
      data: Buffer.from(encoded),
    });
    return messageId;
  }

  /**
   * 获取精简提交列表分片。
   * @param options 查询参数
   * @param afterSolutionId 从哪个 Solution ID 开始（大于此 ID）
   * @param limit 拉取数量
   */
  async getLiteSolutionSlice(
    options: IMSolutionServiceGetLiteSolutionSliceOpt,
    afterSolutionId = 1,
    limit: number,
  ): Promise<IMSolutionServiceGetLiteSolutionSliceRes> {
    const res = await this.model.findAll({
      attributes: [
        'solutionId',
        'problemId',
        'userId',
        'contestId',
        'competitionId',
        'result',
        'language',
        'createdAt',
      ],
      // @ts-ignore
      where: {
        solutionId: {
          [Op.gt]: afterSolutionId,
        },
        ...options,
      },
      order: [[this.meta.pk, 'ASC']],
      limit,
    });
    // @ts-ignore
    return res.map((d) => d.get({ plain: true }) as IMSolutionServiceLiteSolution);
  }

  async batchGetSolutionCodeBySolutionIds(solutionIds: ISolutionModel['solutionId'][]) {
    const res = await this.codeModel.findAll({
      attributes: ['solutionId', 'code'],
      where: {
        solutionId: {
          [Op.in]: solutionIds,
        },
      },
    });
    const codeMap: Record<number, string> = {};
    res.forEach((d) => {
      codeMap[d.solutionId] = d.code;
    });
    return codeMap;
  }

  async updateSolutionProblemStats(problemId: ISolutionModel['problemId']) {
    this.ctx.logger.info('[solutionProblemStats] processing', problemId);
    if (!(problemId > 0)) {
      this.ctx.logger.info('[solutionProblemStats] skipped cuz invalid problemId', problemId);
      return;
    }

    let _us: number;
    let res: any;

    _us = Date.now();
    res = await DB.sequelize.query(
      'SELECT COUNT(DISTINCT(solution_id)) AS accept FROM solution WHERE problem_id=? AND result=?',
      {
        replacements: [problemId, ESolutionResult.AC],
        type: QueryTypes.SELECT,
      },
    );
    const _sql1Cost = Date.now() - _us;

    const problemAccepted: number = res[0].accept;
    _us = Date.now();
    res = await DB.sequelize.query(
      'SELECT COUNT(solution_id) AS submit FROM solution WHERE problem_id=? AND result NOT IN (?)',
      {
        replacements: [
          problemId,
          [
            ESolutionResult.CE,
            ESolutionResult.SE,
            ESolutionResult.NLF,
            ESolutionResult.WT,
            ESolutionResult.JG,
            ESolutionResult.RPD,
          ],
        ],
        type: QueryTypes.SELECT,
      },
    );
    const _sql2Cost = Date.now() - _us;
    const problemSubmitted: number = res[0].submit;

    _us = Date.now();
    await DB.sequelize.query('UPDATE problem SET accept=?, submit=? WHERE problem_id=?', {
      replacements: [problemAccepted, problemSubmitted, problemId],
      type: QueryTypes.UPDATE,
    });
    const _sql3Cost = Date.now() - _us;
    // await this.problemService.clearDetailCache(problemId);

    this.ctx.logger.info('[solutionProblemStats] completed', problemId, 'time cost:', [
      _sql1Cost,
      _sql2Cost,
      _sql3Cost,
    ]);
  }

  async updateSolutionUserStats(userId: ISolutionModel['userId']) {
    this.ctx.logger.info('[solutionUserStats] processing', userId);
    if (!(userId > 0)) {
      this.ctx.logger.info('[solutionUserStats] skipped cuz invalid userId', userId);
      return;
    }

    let _us: number;
    let res: any;

    _us = Date.now();
    res = await DB.sequelize.query(
      'SELECT COUNT(DISTINCT(problem_id)) AS accept FROM solution WHERE user_id=? AND result=?',
      {
        replacements: [userId, ESolutionResult.AC],
        type: QueryTypes.SELECT,
      },
    );
    const _sql1Cost = Date.now() - _us;
    const userAccepted = res[0].accept;

    _us = Date.now();
    res = await DB.sequelize.query(
      'SELECT COUNT(solution_id) AS submit FROM solution WHERE user_id=? AND result NOT IN (?)',
      {
        replacements: [
          userId,
          [
            ESolutionResult.CE,
            ESolutionResult.SE,
            ESolutionResult.NLF,
            ESolutionResult.WT,
            ESolutionResult.JG,
            ESolutionResult.RPD,
          ],
        ],
        type: QueryTypes.SELECT,
      },
    );
    const _sql2Cost = Date.now() - _us;
    const userSubmitted = res[0].submit;

    _us = Date.now();
    await DB.sequelize.query('UPDATE user SET accept=?, submit=? WHERE user_id=?', {
      replacements: [userAccepted, userSubmitted, userId],
      type: QueryTypes.UPDATE,
    });
    const _sql3Cost = Date.now() - _us;
    await this.userService.clearDetailCache(userId);

    this.ctx.logger.info('[solutionUserStats] completed', userId, 'time cost:', [
      _sql1Cost,
      _sql2Cost,
      _sql3Cost,
    ]);
  }
}
