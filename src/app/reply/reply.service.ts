import { provide, inject, Context, config } from 'midway';
import { CReplyMeta } from './reply.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TReplyModel, TReplyModelScopes } from '@/lib/models/reply.model';
import {
  TMReplyLiteFields,
  TMReplyDetailFields,
  IReplyModel,
  IMReplyServiceGetListOpt,
  IMReplyServiceGetListRes,
  IMReplyServiceIsExistsOpt,
  IMReplyServiceCreateOpt,
  IMReplyServiceCreateRes,
  IMReplyServiceUpdateOpt,
  IMReplyServiceUpdateRes,
  IMReplyServiceGetDetailRes,
  IMReplyServiceFindOneOpt,
  IMReplyServiceFindOneRes,
  IMReplyListPagination,
  IMReplyLitePlain,
  IMReplyDetailPlain,
  IMReplyRelativeUser,
  IMReplyRelativeTopic,
  IMReplyServiceCountTopicRepliesRes,
} from './reply.interface';
import { IUtils } from '@/utils';
import { CTopicService } from '../topic/topic.service';
import { CUserService } from '../user/user.service';
import { ILodash } from '@/utils/libs/lodash';

export type CReplyService = ReplyService;

const replyLiteFields: Array<TMReplyLiteFields> = [
  'replyId',
  'topicId',
  'userId',
  'content',
  'createdAt',
  'deleted',
];

const replyDetailFields: Array<TMReplyDetailFields> = [
  'replyId',
  'topicId',
  'userId',
  'content',
  'createdAt',
  'deleted',
];

@provide()
export default class ReplyService {
  @inject('replyMeta')
  meta: CReplyMeta;

  @inject('replyModel')
  model: TReplyModel;

  @inject()
  topicService: CTopicService;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  scopeChecker = {
    available(data: Partial<IReplyModel> | null): boolean {
      return !data?.deleted;
    },
  };

  private _formatListQuery(opts: IMReplyServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      replyId: opts.replyId,
      topicId: opts.topicId,
      userId: opts.userId,
    });
    return {
      where,
    };
  }

  private async _handleRelativeData<T extends IMReplyLitePlain>(
    data: T[],
  ): Promise<
    Array<
      Omit<T, 'topicId' | 'userId'> & {
        topic?: IMReplyRelativeTopic;
      } & {
        user: IMReplyRelativeUser;
      }
    >
  > {
    const topicIds = data.map((d) => d.topicId);
    const userIds = data.map((d) => d.userId);
    const relativeTopics = await this.topicService.getRelative(topicIds);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    return data.map((d) => {
      const topic = relativeTopics[d.topicId];
      const user = relativeUsers[d.userId];
      return this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['topicId', 'userId']),
        topic: topic
          ? {
              topicId: topic.topicId,
              title: topic.title,
              replyCount: topic.replyCount,
            }
          : undefined,
        user: user
          ? {
              userId: user.userId,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
              bannerImage: user.bannerImage,
            }
          : undefined,
      });
    });
  }

  /**
   * 获取回复列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMReplyServiceGetListOpt,
    pagination: IMReplyListPagination = {},
    scope: TReplyModelScopes | null = 'available',
  ): Promise<IMReplyServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: replyLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMReplyLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
  }

  /**
   * 获取回复详情。
   * @param replyId replyId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    replyId: IReplyModel['replyId'],
    scope: TReplyModelScopes | null = 'available',
  ): Promise<IMReplyServiceGetDetailRes> {
    const res = await this.model
      .scope(scope || undefined)
      .findOne({
        attributes: replyDetailFields,
        where: {
          replyId,
        },
      })
      .then((d) => d && (d.get({ plain: true }) as IMReplyDetailPlain));
    // 使用缓存，业务上自己处理 scope
    if (res && (scope === null || this.scopeChecker[scope](res))) {
      const [ret] = await this._handleRelativeData([res]);
      return ret;
    }
    return null;
  }

  /**
   * 按条件查询回复详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMReplyServiceFindOneOpt,
    scope: TReplyModelScopes | null = 'available',
  ): Promise<IMReplyServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: replyDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMReplyDetailPlain));
  }

  /**
   * 按条件查询回复是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMReplyServiceIsExistsOpt,
    scope: TReplyModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建回复。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMReplyServiceCreateOpt): Promise<IMReplyServiceCreateRes> {
    const res = await this.model.create(data);
    return res.replyId;
  }

  /**
   * 更新回复（部分更新）。
   * @param replyId replyId
   * @param data 更新数据
   */
  async update(
    replyId: IReplyModel['replyId'],
    data: IMReplyServiceUpdateOpt,
  ): Promise<IMReplyServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        replyId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 获取话题回复数量。
   * @param topicId toopicId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async countTopicReplies(
    topicId: IReplyModel['topicId'],
    scope: TReplyModelScopes | null = 'available',
  ): Promise<IMReplyServiceCountTopicRepliesRes> {
    return this.model.scope(scope || undefined).count({
      where: {
        topicId,
      },
    });
  }
}
