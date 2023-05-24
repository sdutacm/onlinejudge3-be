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
  IMSolutionDetail,
  IMSolutionServiceFindAllSolutionIdsOpt,
  IMSolutionServiceFindAllSolutionIdsRes,
  IMSolutionServiceFindAllSolutionWithIdsOpt,
  IMSolutionServiceFindAllSolutionWithIdsRes,
  IMSolutionServiceJudgeOpt,
  IMSolutionServiceJudgeRes,
  IMSolutionServiceGetPendingSolutionsRes,
  IMSolutionJudgeStatus,
  IMSolutionServiceUpdateJudgeInfoOpt,
  IMSolutionJudgeInfo,
  IMSolutionServiceGetRelativeJudgeInfoRes,
  TMJudgeInfoFields,
  IMSolutionJudgeInfoFull,
  IMSolutionServiceGetCompetitionProblemSolutionStatsRes,
  IMSolutionServiceGetAllCompetitionSolutionListRes,
  IMSolutionRelativeCompetition,
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
  'solutionId',
  'lastCase',
  'totalCase',
  'detail',
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
   */
  private async _getContestProblemSolutionStatsCache(
    contestId: ISolutionModel['contestId'],
  ): Promise<IMSolutionContestProblemSolutionStats | null> {
    return this.ctx.helper.redisGet<IMSolutionContestProblemSolutionStats>(
      this.redisKey.contestProblemResultStats,
      [contestId],
    );
  }

  /**
   * 设置比赛题目提交统计缓存。
   * @param contestId contestId
   * @param data 数据
   */
  private async _setContestProblemSolutionStatsCache(
    contestId: ISolutionModel['contestId'],
    data: IMSolutionContestProblemSolutionStats,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.contestProblemResultStats,
      [contestId],
      data,
      this.durations.cacheDetailMedium,
    );
  }

  /**
   * 获取比赛题目提交统计缓存。
   * 如果未找到缓存，则返回 `null`
   * @param competitionId competitionId
   */
  private async _getCompetitionProblemSolutionStatsCache(
    competitionId: ISolutionModel['competitionId'],
  ): Promise<IMSolutionContestProblemSolutionStats | null> {
    return this.ctx.helper.redisGet<IMSolutionContestProblemSolutionStats>(
      this.redisKey.competitionProblemResultStats,
      [competitionId],
    );
  }

  /**
   * 设置比赛题目提交统计缓存。
   * @param competitionId competitionId
   * @param data 数据
   */
  private async _setCompetitionProblemSolutionStatsCache(
    competitionId: ISolutionModel['competitionId'],
    data: IMSolutionContestProblemSolutionStats,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionProblemResultStats,
      [competitionId],
      data,
      this.durations.cacheDetailMedium,
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
   * @param solutionId solutionId
   */
  private async _getSolutionJudgeInfoCache(
    solutionId: ISolutionModel['solutionId'],
  ): Promise<IMSolutionJudgeInfo | null> {
    return this.ctx.helper.redisGet<IMSolutionJudgeInfo>(this.redisKey.solutionJudgeInfo, [
      solutionId,
    ]);
  }

  /**
   * 设置评测信息缓存。
   * @param solutionId solutionId
   * @param data 数据
   */
  private async _setSolutionJudgeInfoCache(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionJudgeInfo | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.solutionJudgeInfo,
      [solutionId],
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
      Omit<T, 'problemId' | 'userId' | 'contestId' | 'competitionId'> & {
        problem: IMSolutionRelativeProblem;
      } & {
        user: IMSolutionRelativeUser;
      } & {
        contest?: IMSolutionRelativeContest;
      } & {
        competition?: IMSolutionRelativeCompetition;
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
    const solutionIds = data.map((d) => d.solutionId);
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
      this.getRelativeJudgeInfo(solutionIds),
    ]);
    return data.map((d) => {
      const relativeProblem = relativeProblems[d.problemId];
      const relativeContest = relativeContests[d.contestId];
      const relativeCompetition = d.competitionId
        ? relativeCompetitions[d.competitionId]
        : undefined;
      const relativeJudgeInfo = relativeJudgeInfos[d.solutionId];
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
        const relativeCompetitionUser = relativeCompetitionUsers[`${d.competitionId}_${d.userId}`];
        user = {
          userId: d.userId,
          username: '',
          nickname: relativeCompetitionUser?.info?.nickname || '',
          avatar: '',
          bannerImage: '',
          rating: 0,
        };
      } else {
        const relativeUser = relativeUsers[d.userId];
        user = {
          userId: relativeUser?.userId,
          username: relativeUser?.username,
          nickname: relativeUser?.nickname,
          avatar: relativeUser?.avatar,
          bannerImage: relativeUser?.bannerImage,
          rating: relativeUser?.rating,
        };
      }

      const ret = this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['problemId', 'userId', 'contestId', 'competitionId']),
        problem: {
          problemId: relativeProblem?.problemId,
          title: relativeProblem?.title,
          timeLimit: relativeProblem?.timeLimit,
          memoryLimit: relativeProblem?.memoryLimit,
          spj: relativeProblem?.spj,
        },
        user,
        contest: relativeContest
          ? {
              contestId: relativeContest.contestId,
              title: relativeContest.title,
              type: relativeContest.type,
              startAt: relativeContest.startAt,
              endAt: relativeContest.endAt,
            }
          : undefined,
        competition: relativeCompetition
          ? {
              competitionId: relativeCompetition.competitionId,
              title: relativeCompetition.title,
              isTeam: relativeCompetition.isTeam,
              ended: relativeCompetition.ended,
              startAt: relativeCompetition.startAt,
              endAt: relativeCompetition.endAt,
              settings: relativeCompetition.settings,
            }
          : undefined,
        judgeInfo: relativeJudgeInfo,
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
   * 按 solutionId 关联查询评测信息。
   * 如果部分查询的 solutionId 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 solutionId 列表
   */
  async getRelativeJudgeInfo(
    keys: ISolutionModel['solutionId'][],
  ): Promise<IMSolutionServiceGetRelativeJudgeInfoRes> {
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
            solutionId: {
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
        const { solutionId } = d;
        delete d.solutionId;
        res[solutionId] = d;
        await this._setSolutionJudgeInfoCache(solutionId, d);
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
    }
    return res[0] > 0;
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
   */
  async getContestProblemSolutionStats(
    contestId: ISolutionModel['contestId'],
    problemIds: ISolutionModel['problemId'][],
  ): Promise<IMSolutionServiceGetContestProblemSolutionStatsRes> {
    let res: IMSolutionContestProblemSolutionStats | null = null;
    const cached = await this._getContestProblemSolutionStatsCache(contestId);
    cached && (res = cached);
    if (!res) {
      res = {};
      for (const problemId of problemIds) {
        const accepted = await this.model.count({
          where: {
            contestId,
            problemId,
            result: ESolutionResult.AC,
          },
          distinct: true,
          col: 'userId',
        });
        const unaccepted = await this.model.count({
          where: {
            contestId,
            problemId,
            result: {
              [Op.and]: [
                { [Op.ne]: ESolutionResult.AC },
                { [Op.ne]: ESolutionResult.WT },
                { [Op.ne]: ESolutionResult.JG },
                { [Op.ne]: ESolutionResult.CE },
                { [Op.ne]: ESolutionResult.SE },
              ],
            },
          },
        });
        res[problemId] = {
          accepted,
          submitted: accepted + unaccepted,
        };
      }
      await this._setContestProblemSolutionStatsCache(contestId, res);
    }
    return res;
  }

  /**
   * 获取比赛内的题目提交统计（accepted/submitted）。
   * @param competitionId competitionId
   * @param problemIds 比赛 problemId 列表
   */
  async getCompetitionProblemSolutionStats(
    competitionId: ISolutionModel['competitionId'],
    problemIds: ISolutionModel['problemId'][],
  ): Promise<IMSolutionServiceGetCompetitionProblemSolutionStatsRes> {
    let res: IMSolutionContestProblemSolutionStats | null = null;
    const cached = await this._getCompetitionProblemSolutionStatsCache(competitionId);
    cached && (res = cached);
    if (!res) {
      res = {};
      for (const problemId of problemIds) {
        const accepted = await this.model.count({
          where: {
            competitionId,
            problemId,
            result: ESolutionResult.AC,
          },
          distinct: true,
          col: 'userId',
        });
        const unaccepted = await this.model.count({
          where: {
            competitionId,
            problemId,
            result: {
              [Op.and]: [
                { [Op.ne]: ESolutionResult.AC },
                { [Op.ne]: ESolutionResult.WT },
                { [Op.ne]: ESolutionResult.JG },
                { [Op.ne]: ESolutionResult.CE },
                { [Op.ne]: ESolutionResult.SE },
              ],
            },
          },
        });
        res[problemId] = {
          accepted,
          submitted: accepted + unaccepted,
        };
      }
      await this._setCompetitionProblemSolutionStatsCache(competitionId, res);
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
    return this.ctx.helper.redisDel(this.redisKey.contestProblemResultStats, [contestId]);
  }

  /**
   * 清除比赛题目提交统计缓存。
   * @param competitionId competitionId
   */
  async clearCompetitionProblemSolutionStatsCache(
    competitionId: ISolutionModel['competitionId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.competitionProblemResultStats, [competitionId]);
  }

  /**
   * 获取用户提交日历图统计
   * @param userId userId
   * @param result 指定 result
   */
  async getUserSolutionCalendar(
    userId: ISolutionModel['userId'],
    result: ESolutionResult = ESolutionResult.AC,
  ): Promise<IMSolutionServiceGetUserSolutionCalendarRes> {
    let res: IMSolutionCalendar | null = null;
    const cached = await this._getUserSolutionCalendarCache(userId, result);
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
   * 获取比赛的所有提交。
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
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMSolutionLitePlain));
    return res;
  }

  /**
   * 获取比赛的所有提交。
   * @param competitionId competitionId
   */
  async getAllCompetitionSolutionList(
    competitionId: ISolutionModel['competitionId'],
  ): Promise<IMSolutionServiceGetAllCompetitionSolutionListRes> {
    const res = await this.model
      .findAll({
        attributes: solutionLiteFields,
        where: {
          competitionId,
        },
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMSolutionLitePlain));
    return res;
  }

  /**
   * 判断提交所有者是否是自己。
   * @param ctx ctx
   * @param detail 提交详情
   */
  isSolutionSelf(ctx: Context, detail: IMSolutionDetail): boolean {
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

  /**
   * 根据条件获取所有提交的 ID。
   * @param options 查询条件
   */
  async findAllSolutionIds(
    options: IMSolutionServiceFindAllSolutionIdsOpt,
  ): Promise<IMSolutionServiceFindAllSolutionIdsRes> {
    if (Object.keys(options).length === 0) {
      return [];
    }
    const res = await this.model
      .findAll({
        attributes: ['solutionId'],
        where: options as any,
      })
      .then((r) => r.map((d) => d.solutionId));
    return res;
  }

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
        attributes: ['solutionId', 'problemId', 'userId', 'contestId', 'competitionId'],
        where: options as any,
      })
      .then((r) =>
        r.map((d) => ({
          solutionId: d.solutionId,
          problemId: d.problemId,
          userId: d.userId,
          contestId: d.contestId,
          competitionId: d.competitionId,
        })),
      );
    return res;
  }

  /**
   * 获取评测状态。
   * 如果未找到，则返回 `null`
   * @param solutionId solutionId
   */
  async getSolutionJudgeStatus(
    solutionId: ISolutionModel['solutionId'],
  ): Promise<IMSolutionJudgeStatus | null> {
    return this.ctx.helper.redisGet<IMSolutionJudgeStatus>(this.redisKey.solutionJudgeStatus, [
      solutionId,
    ]);
  }

  /**
   * 设置评测状态。
   * @param solutionId solutionId
   * @param data 数据
   */
  async setSolutionJudgeStatus(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionJudgeStatus,
  ): Promise<void> {
    return this.ctx.helper.redisSet(this.redisKey.solutionJudgeStatus, [solutionId], data);
  }

  /**
   * 删除评测状态。
   * @param solutionId solutionId
   */
  async delSolutionJudgeStatus(solutionId: ISolutionModel['solutionId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.solutionJudgeStatus, [solutionId]);
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
      url: `${this.judgerConfig.socketBridgeBaseUrl}/pushJudgeStatus`,
      method: 'POST',
      data: statusFormArray,
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
   * 更新 judge info 数据。
   * @param solutionId
   * @param data
   */
  async updateJudgerInfo(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionServiceUpdateJudgeInfoOpt,
  ) {
    await this.judgeInfoModel.findOrCreate({
      where: {
        solutionId,
      },
      defaults: {
        lastCase: 0,
        totalCase: 0,
        detail: null,
        finishedAt: new Date(),
      },
    });
    await this.judgeInfoModel.update(data, {
      where: {
        solutionId,
      },
    });
  }

  /**
   * 清除评测信息缓存。
   * @param solutionId solutionId
   */
  async clearSolutionJudgeInfoCache(solutionId: ISolutionModel['solutionId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.solutionJudgeInfo, [solutionId]);
  }

  /**
   * 提交评测。
   * @param options
   */
  async judge(options: IMSolutionServiceJudgeOpt): Promise<IMSolutionServiceJudgeRes> {
    const language = this.utils.judger.convertOJLanguageToRiver(options.language);
    if (!language) {
      throw new Error(`Invalid Language ${options.language}`);
    }
    if (!options.code) {
      throw new Error(`No Code`);
    }
    if (!options.problemId) {
      throw new Error(`No Problem Specified`);
    }
    const { solutionId, problemId, userId } = options;
    const logger = this.ctx.getLogger('judgerLogger');
    logger.info(`[${solutionId}/${problemId}/${userId}] begin`);
    await this.setSolutionJudgeStatus(solutionId, {
      hostname: os.hostname(),
      pid: process.pid,
      status: 'pending',
    });
    // @ts-ignore
    const judger = this.ctx.app.judger as Judger;
    const judgeType = options.spj ? river.JudgeType.Special : river.JudgeType.Standard;
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
        this.pushJudgeStatus(solutionId, [solutionId, judgeType, ESolutionResult.JG]);
      },
      onJudgeCaseStart: (current, total) => {
        console.log(`${current}/${total} Running`);
        logger.info(`[${solutionId}/${problemId}/${userId}] onJudgeCaseStart ${current}/${total}`);
        this.setSolutionJudgeStatus(solutionId, {
          hostname: os.hostname(),
          pid: process.pid,
          status: 'running',
          current,
          total,
        });
        this.pushJudgeStatus(solutionId, [
          solutionId,
          judgeType,
          ESolutionResult.JG,
          current,
          total,
        ]);
      },
      onJudgeCaseDone: (current, total, res) => {
        console.log(`${current}/${total} Done:`, res);
        logger.info(`[${solutionId}/${problemId}/${userId}] onJudgeCaseDone ${current}/${total}`);
        return res.result === river.JudgeResultEnum.Accepted;
      },
    });
    try {
      const jResult = await call.run();
      console.log('call res', jResult);
      logger.info(`[${solutionId}/${problemId}/${userId}] done`, JSON.stringify(jResult));
      await this.delSolutionJudgeStatus(solutionId);
      switch (jResult.type) {
        case 'CompileError': {
          const result = ESolutionResult.CE;
          const compileInfo = jResult.res;
          await this.update(solutionId, {
            result,
            compileInfo,
          });
          await this.clearDetailCache(solutionId);
          this.pushJudgeStatus(solutionId, [solutionId, judgeType, result]);
          break;
        }
        case 'SystemError': {
          logger.warn(`[${solutionId}/${problemId}/${userId}] SystemError`, jResult.res);
          const result = ESolutionResult.SE;
          await this.update(solutionId, {
            result,
          });
          await this.clearDetailCache(solutionId);
          this.pushJudgeStatus(solutionId, [solutionId, judgeType, result]);
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
          });
          await this.clearDetailCache(solutionId);
          // 更新评测信息
          await this.updateJudgerInfo(solutionId, {
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
          await this.clearSolutionJudgeInfoCache(solutionId);
          // 推送完成状态
          this.pushJudgeStatus(solutionId, [
            solutionId,
            judgeType,
            result,
            jResult.last,
            jResult.total,
          ]);
          // 需要更新计数，让异步定时任务去处理
          await Promise.all([
            this.ctx.helper.redisSadd(
              this.redisKey.asyncSolutionProblemStatsTasks,
              [],
              `${problemId}`,
            ),
            this.ctx.helper.redisSadd(this.redisKey.asyncSolutionUserStatsTasks, [], `${userId}`),
          ]);
          console.log('judge all ok', solutionId);
          // break;
        }
      }
    } catch (e) {
      this.delSolutionJudgeStatus(solutionId);
      console.error('Judger error', e);
      logger.error(`[${solutionId}/${problemId}/${userId}] error`, e);
    }
  }
}
