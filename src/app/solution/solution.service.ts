import { provide, inject, Context, config, scope } from 'midway';
import { CSolutionMeta } from './solution.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TSolutionModel } from '@/lib/models/solution.model';
import {
  TMSolutionLiteFields,
  TMSolutionDetailFields,
  ISolutionModel,
  IMSolutionDetail,
  IMSolutionServiceGetListOpt,
  IMSolutionListPagination,
  IMSolutionServiceGetListRes,
  IMSolutionLitePlain,
  IMSolutionLite,
  IMSolutionRelativeProblem,
  IMSolutionRelativeUser,
  IMSolutionRelativeContest,
  IMSolutionServiceGetDetailRes,
  IMSolutionDetailPlain,
  IMSolutionDetailPlainFull,
} from './solution.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CProblemService } from '../problem/problem.service';
import { CUserService } from '../user/user.service';
import { CContestService } from '../contest/contest.service';
import { TCompileInfoModel } from '@/lib/models/compileInfo.model';
import { TCodeModel } from '@/lib/models/code.model';

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
}
