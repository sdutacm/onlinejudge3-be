import { provide, inject, Context, config } from 'midway';
import { CMessageMeta } from './message.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TMessageModel } from '@/lib/models/message.model';
import {
  TMMessageLiteFields,
  TMMessageDetailFields,
  IMessageModel,
  IMMessageServiceGetListOpt,
  IMMessageListPagination,
  IMMessageServiceGetListRes,
  IMMessageLitePlain,
  IMMessageRelativeUser,
  IMMessageServiceIsExistsOpt,
  IMMessageServiceCreateOpt,
  IMMessageServiceCreateRes,
  IMMessageServiceUpdateOpt,
  IMMessageServiceUpdateRes,
} from './message.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CUserService } from '../user/user.service';
import { IUserModel } from '../user/user.interface';

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
   * 获取消息列表。
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

  /**
   * 按条件查询消息是否存在。
   * @param options 查询参数
   */
  async isExists(options: IMMessageServiceIsExistsOpt): Promise<boolean> {
    const res = await this.model.findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建消息。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMMessageServiceCreateOpt): Promise<IMMessageServiceCreateRes> {
    const res = await this.model.create(data);
    return res.messageId;
  }

  /**
   * 更新消息（部分更新）。
   * @param messageId messageId
   * @param data 更新数据
   */
  async update(
    messageId: IMessageModel['messageId'],
    data: IMMessageServiceUpdateOpt,
  ): Promise<IMMessageServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        messageId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 发送系统消息
   * @param toUserId 收件人 userId
   * @param title 标题
   * @param content 正文
   */
  async sendSystemMessage(
    toUserId: IUserModel['userId'],
    title: IMessageModel['title'],
    content: IMessageModel['content'],
  ) {
    const res = await this.model.create({
      fromUserId: 0,
      toUserId,
      title,
      content,
    });
    return res.messageId;
  }
}
