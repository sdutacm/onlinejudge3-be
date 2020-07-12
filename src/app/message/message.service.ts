import { provide, inject, Context, config } from 'midway';
import { CMessageMeta } from './message.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TMessageModel } from '@/lib/models/message.model';
import {
  TMMessageLiteFields,
  TMMessageDetailFields,
  IMMessageDetail,
  IMMessageLite,
  IMessageModel,
  IMMessageServiceGetListOpt,
  IMMessageListPagination,
  IMMessageServiceGetListRes,
  IMMessageLitePlain,
  IMMessageRelativeUser,
} from './message.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CUserService } from '../user/user.service';

export type CMessageService = MessageService;

const messageLiteFields: Array<TMMessageLiteFields> = [
  'messageId',
  'fromUserId',
  'toUserId',
  'title',
  'content',
  'read',
  'anonymous',
  'createdAt',
];
const messageDetailFields: Array<TMMessageDetailFields> = [
  'messageId',
  'fromUserId',
  'toUserId',
  'title',
  'content',
  'read',
  'anonymous',
  'createdAt',
];

@provide()
export default class MessageService {
  @inject('messageMeta')
  meta: CMessageMeta;

  @inject('messageModel')
  model: TMessageModel;

  @inject()
  userService: CUserService;

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

  private _formatListQuery(opts: IMMessageServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      fromUserId: opts.fromUserId,
      toUserId: opts.toUserId,
      read: opts.read,
    });
    return {
      where,
    };
  }

  private async _handleRelativeData<T extends IMMessageLitePlain>(
    data: T[],
  ): Promise<
    Array<
      Omit<T, 'fromUserId' | 'toUserId'> & {
        from: IMMessageRelativeUser;
      } & {
        to: IMMessageRelativeUser;
      }
    >
  > {
    const userIds = [...data.map((d) => d.fromUserId), ...data.map((d) => d.toUserId)];
    const relativeUsers = await this.userService.getRelative(userIds, null);
    return data.map((d) => {
      const fromUser = relativeUsers[d.fromUserId];
      const toUser = relativeUsers[d.toUserId];
      return this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['fromUserId', 'toUserId']),
        from: fromUser
          ? {
              userId: fromUser.userId,
              username: fromUser.username,
              nickname: fromUser.nickname,
              avatar: fromUser.avatar,
              bannerImage: fromUser.bannerImage,
            }
          : undefined,
        to: {
          userId: toUser?.userId,
          username: toUser?.username,
          nickname: toUser?.nickname,
          avatar: toUser?.avatar,
          bannerImage: toUser?.bannerImage,
        },
      });
    });
  }

  /**
   * 获取提交列表。
   * @param options 查询参数
   * @param pagination 分页参数
   */
  async getList(
    options: IMMessageServiceGetListOpt,
    pagination: IMMessageListPagination = {},
  ): Promise<IMMessageServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .findAndCountAll({
        attributes: messageLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMMessageLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
  }
}
