import { provide, inject, Context, config } from 'midway';
import { CTopicMeta } from './topic.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TTopicModel, TTopicModelScopes } from '@/lib/models/topic.model';
import {
  TMTopicLiteFields,
  TMTopicDetailFields,
  ITopicModel,
  IMTopicServiceGetListOpt,
  IMTopicServiceGetListRes,
  IMTopicServiceIsExistsOpt,
  IMTopicServiceCreateOpt,
  IMTopicServiceCreateRes,
  IMTopicServiceUpdateOpt,
  IMTopicServiceUpdateRes,
  IMTopicServiceGetDetailRes,
  IMTopicServiceFindOneOpt,
  IMTopicServiceFindOneRes,
  IMTopicListPagination,
  IMTopicLitePlain,
  IMTopicDetailPlain,
  IMTopicRelativeUser,
  IMTopicRelativeProblem,
} from './topic.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { CProblemService } from '../problem/problem.service';
import { CUserService } from '../user/user.service';
import { ILodash } from '@/utils/libs/lodash';

export type CTopicService = TopicService;

const topicLiteFields: Array<TMTopicLiteFields> = [
  'topicId',
  'userId',
  'problemId',
  'title',
  'replyCount',
  'createdAt',
  // 'lastTime',
  // 'lastUserId',
  'deleted',
];

const topicDetailFields: Array<TMTopicDetailFields> = [
  'topicId',
  'userId',
  'problemId',
  'title',
  'content',
  'replyCount',
  'createdAt',
  // 'lastTime',
  // 'lastUserId',
  'deleted',
];

@provide()
export default class TopicService {
  @inject('topicMeta')
  meta: CTopicMeta;

  @inject('topicModel')
  model: TTopicModel;

  @inject()
  userService: CUserService;

  @inject()
  problemService: CProblemService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  scopeChecker = {
    available(data: Partial<ITopicModel> | null): boolean {
      return !data?.deleted;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param topicId topicId
   */
  private async _getDetailCache(
    topicId: ITopicModel['topicId'],
  ): Promise<IMTopicDetailPlain | null | ''> {
    return this.ctx.helper
      .redisGet<IMTopicDetailPlain>(this.meta.detailCacheKey, [topicId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
  }

  /**
   * 设置详情缓存。
   * @param topicId topicId
   * @param data 详情数据
   */
  private async _setDetailCache(
    topicId: ITopicModel['topicId'],
    data: IMTopicDetailPlain | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [topicId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMTopicServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      topicId: opts.topicId,
      userId: opts.userId,
      problemId: opts.problemId,
    });
    if (opts.title) {
      where.title = {
        [Op.like]: `%${opts.title}%`,
      };
    }
    return {
      where,
    };
  }

  private async _handleRelativeData<T extends IMTopicLitePlain>(
    data: T[],
  ): Promise<
    Array<
      Omit<T, 'userId' | 'problemId'> & {
        user: IMTopicRelativeUser;
      } & {
        problem?: IMTopicRelativeProblem;
      }
    >
  > {
    const userIds = data.map((d) => d.userId);
    const problemIds = data.map((d) => d.problemId).filter((f) => f);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    const relativeProblems = await this.problemService.getRelative(problemIds, null);
    return data.map((d) => {
      const user = relativeUsers[d.userId];
      const problem = relativeProblems[d.problemId];
      return this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['userId', 'problemId']),
        user: user
          ? {
              userId: user.userId,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
              bannerImage: user.bannerImage,
            }
          : undefined,
        problem: problem
          ? {
              problemId: problem.problemId,
              title: problem.title,
            }
          : undefined,
      });
    });
  }

  /**
   * 获取话题列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMTopicServiceGetListOpt,
    pagination: IMTopicListPagination = {},
    scope: TTopicModelScopes | null = 'available',
  ): Promise<IMTopicServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: topicLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMTopicLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
  }

  /**
   * 获取话题详情。
   * @param topicId topicaId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    topicId: ITopicModel['topicId'],
    scope: TTopicModelScopes | null = 'available',
  ): Promise<IMTopicServiceGetDetailRes> {
    let res: IMTopicDetailPlain | null = null;
    const cached = await this._getDetailCache(topicId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope(scope || undefined)
        .findOne({
          attributes: topicDetailFields,
          where: {
            topicId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMTopicDetailPlain));
      await this._setDetailCache(topicId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (res && (scope === null || this.scopeChecker[scope](res))) {
      const [ret] = await this._handleRelativeData([res]);
      return ret;
    }
    return null;
  }

  /**
   * 按条件查询话题详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMTopicServiceFindOneOpt,
    scope: TTopicModelScopes | null = 'available',
  ): Promise<IMTopicServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: topicDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMTopicDetailPlain));
  }

  /**
   * 按条件查询话题是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMTopicServiceIsExistsOpt,
    scope: TTopicModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建话题。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMTopicServiceCreateOpt): Promise<IMTopicServiceCreateRes> {
    const res = await this.model.create(data);
    return res.topicId;
  }

  /**
   * 更新话题（部分更新）。
   * @param topicId topicId
   * @param data 更新数据
   */
  async update(
    topicId: ITopicModel['topicId'],
    data: IMTopicServiceUpdateOpt,
  ): Promise<IMTopicServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        topicId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param topicId topicId
   */
  async clearDetailCache(topicId: ITopicModel['topicId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [topicId]);
  }
}
