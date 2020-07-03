import { provide, inject, Context, config } from 'midway';
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
} from './solution.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CProblemService } from '../problem/problem.service';
import { CUserService } from '../user/user.service';
import { CContestService } from '../contest/contest.service';

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
  ): Promise<IMSolutionDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMSolutionDetail>(this.meta.detailCacheKey, [solutionId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
  }

  /**
   * 设置详情缓存。
   * @param solutionId solutionId
   * @param data 详情数据
   */
  private async _setDetailCache(
    solutionId: ISolutionModel['solutionId'],
    data: IMSolutionDetail | null,
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
    const problemIds = res.rows.map((d) => d.problemId);
    const userIds = res.rows.filter((d) => !d.isContestUser).map((d) => d.userId);
    const contestUserIds = res.rows.filter((d) => d.isContestUser).map((d) => d.userId);
    const contestIds = res.rows.filter((d) => d.contestId > 0).map((d) => d.contestId);
    const relativeProblems = await this.problemService.getRelative(problemIds, null);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    const relativeContestUsers = await this.contestService.getRelativeContestUser(contestUserIds);
    const relativeContests = await this.contestService.getRelative(contestIds, null);
    return {
      ...res,
      rows: res.rows.map((d) => {
        const relativeProblem = relativeProblems[d.problemId];
        const relativeContest = relativeContests[d.contestId];
        let user: IMSolutionLite['user'];
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
        return {
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
      }),
    };
  }
}
