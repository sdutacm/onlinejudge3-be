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

export type CSolutionService = SolutionService;

const solutionLiteFields: Array<TMSolutionLiteFields> = [
  'solutionId',
  'problemId',
  'userId',
  'contestId',
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
  'result',
  'time',
  'memory',
  'language',
  'codeLength',
  'shared',
  'isContestUser',
  'createdAt',
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
  problemService: CProblemService;

  @inject()
  userService: CUserService;

  @inject()
  contestService: CContestService;

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
      data ? this.durations.cacheDetailMedium : this.durations.cacheDetailNull,
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

  private _formatListQuery(opts: IMSolutionServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      solutionId: opts.solutionId,
      problemId: opts.problemId,
      userId: opts.userId,
      contestId: opts.contestId,
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
      Omit<T, 'problemId' | 'userId' | 'contestId'> & {
        problem: IMSolutionRelativeProblem;
      } & {
        user: IMSolutionRelativeUser;
      } & {
        contest?: IMSolutionRelativeContest;
      }
    >
  > {
    const problemIds = data.map((d) => d.problemId);
    const userIds = data.filter((d) => !d.isContestUser).map((d) => d.userId);
    const contestUserIds = data.filter((d) => d.isContestUser).map((d) => d.userId);
    const contestIds = data.filter((d) => d.contestId > 0).map((d) => d.contestId);
    const [
      relativeProblems,
      relativeUsers,
      relativeContestUsers,
      relativeContests,
    ] = await Promise.all([
      this.problemService.getRelative(problemIds, null),
      this.userService.getRelative(userIds, null),
      this.contestService.getRelativeContestUser(contestUserIds),
      this.contestService.getRelative(contestIds, null),
    ]);
    return data.map((d) => {
      const relativeProblem = relativeProblems[d.problemId];
      const relativeContest = relativeContests[d.contestId];
      let user: IMSolutionRelativeUser;
      if (d.isContestUser) {
        const relativeUser = relativeContestUsers[d.userId];
        user = {
          userId: relativeUser?.contestUserId,
          username: relativeUser?.username,
          nickname: relativeUser?.nickname,
          avatar: relativeUser?.nickname,
          bannerImage: '',
          rating: 0, // TODO contest user rating
        };
      } else {
        const relativeUser = relativeUsers[d.userId];
        user = {
          userId: relativeUser?.userId,
          username: relativeUser?.username,
          nickname: relativeUser?.nickname,
          avatar: relativeUser?.nickname,
          bannerImage: relativeUser?.bannerImage,
          rating: relativeUser?.rating,
        };
      }
      const ret = {
        ...this.lodash.omit(d, ['problemId', 'userId', 'contestId']),
        problem: {
          problemId: relativeProblem?.problemId,
          title: relativeProblem?.title,
          timeLimit: relativeProblem?.timeLimit,
        },
        user,
        contest: {
          contestId: relativeContest?.contestId,
          title: relativeContest?.title,
          type: relativeContest?.type,
        },
      };
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
    pagination: IMSolutionListPagination = {},
  ): Promise<IMSolutionServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .findAndCountAll({
        attributes: solutionLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMSolutionLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
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
   * @param result 评测结果
   */
  async getUserSubmittedProblemIds(
    userId: ISolutionModel['userId'],
    contestId?: ISolutionModel['contestId'],
    result?: ESolutionResult,
  ): Promise<ISolutionModel['problemId'][]> {
    return this.model
      .findAll({
        attributes: [[sequelizeFn('DISTINCT', sequelizeCol('problem_id')), 'problemId']],
        // @ts-ignore
        where: this.utils.misc.ignoreUndefined({
          userId,
          contestId,
          result: result,
        }),
      })
      .then((r: any) => r.map((d: any) => d.problemId));
  }

  /**
   * 获取用户题目的 已通过/已尝试未通过 提交统计。
   * @param userId userId
   * @param contestId contestId
   */
  async getUserProblemResultStats(
    userId: ISolutionModel['userId'],
    contestId?: ISolutionModel['contestId'],
  ): Promise<IMSolutionUserProblemResultStats> {
    let res: IMSolutionUserProblemResultStats | null = null;
    if (!contestId) {
      const cached = await this._getUserProblemResultStatsCache(userId);
      cached && (res = cached);
    }
    if (!res) {
      const [acceptedProblemIds, submittedProblemIds] = await Promise.all([
        this.getUserSubmittedProblemIds(userId, contestId, ESolutionResult.AC),
        this.getUserSubmittedProblemIds(userId, contestId),
      ]);
      const attemptedProblemIds = this.lodash.difference(submittedProblemIds, acceptedProblemIds);
      res = { acceptedProblemIds, attemptedProblemIds };
      !contestId && (await this._setUserProblemResultStatsCache(userId, res));
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
   * 清除比赛题目提交统计缓存。
   * @param contestId contestId
   */
  async clearContestProblemSolutionStatsCache(
    contestId: ISolutionModel['contestId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.contestProblemResultStats, [contestId]);
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
          `SELECT DATE(sub_time) AS date, COUNT(*) AS count FROM (SELECT sub_time FROM solution WHERE user_id=? AND result=? GROUP BY problem_id) AS r GROUP BY DATE(sub_time)`,
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
   * 清除比赛题目提交统计缓存。
   * @param contestId contestId
   * @param result 提交结果
   */
  async clearUserSolutionCalendarCache(
    userId: ISolutionModel['userId'],
    result: ESolutionResult,
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.userSolutionCalendar, [userId, result]);
  }

  /**
   * 获取所有比赛提交。
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
        ctx.helper.getContestSession(detail.contest.contestId)?.userId === detail.user.userId)
    );
  }
}
