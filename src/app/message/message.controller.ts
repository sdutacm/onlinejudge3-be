import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  login,
  rateLimitUser,
  auth,
} from '@/lib/decorators/controller.decorator';
import { CMessageMeta } from './message.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CMessageService } from './message.service';
import { ILodash } from '@/utils/libs/lodash';
import {
  IGetMessageListReq,
  ISendMessageReq,
  IBatchSendMessageReq,
  IUpdateMessageReadReq,
} from '@/common/contracts/message';
import { IMMessageServiceGetListRes } from './message.interface';
import { CUserService } from '../user/user.service';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { CPromiseQueue } from '@/utils/libs/promise-queue';

@provide()
@controller('/')
export default class MessageController {
  @inject('messageMeta')
  meta: CMessageMeta;

  @inject('messageService')
  service: CMessageService;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  @route()
  @login()
  @pagination()
  @getList(undefined, {
    beforeGetList(ctx) {
      const { fromUserId, toUserId, read } = ctx.request.body as IGetMessageListReq;
      // 发件人或收件人必须至少有其一是当前登录用户
      if (ctx.session.userId !== fromUserId && ctx.session.userId !== toUserId) {
        return false;
      }
      // 只有指定收件人且是自己时，才能按 read 搜索
      if (read !== undefined && ctx.session.userId !== toUserId) {
        delete ctx.request.body.read;
      }
    },
    afterGetList(ctx) {
      const list = ctx.list as IMMessageServiceGetListRes;
      list.rows.forEach((item) => {
        // 只有收信人有 read 字段
        if (ctx.session.userId !== item.to.userId) {
          delete item.read;
        }
      });
    },
  })
  @respList()
  async [routesBe.getMessageList.i](_ctx: Context) {}

  @route()
  @login()
  @rateLimitUser(60, 5)
  async [routesBe.sendMessage.i](ctx: Context): Promise<void> {
    const { toUserId, title, content, anonymous } = ctx.request.body as ISendMessageReq;
    const toUser = await this.userService.getDetail(toUserId);
    if (!toUser) {
      throw new ReqError(Codes.MESSAGE_RECIPIENT_NOT_EXIST);
    }
    await this.service.create({
      fromUserId: ctx.session.userId,
      toUserId,
      title,
      content,
      anonymous,
    });
  }

  @route()
  @auth('admin')
  async [routesBe.batchSendMessage.i](ctx: Context): Promise<void> {
    const { toUserIds, title, content, anonymous, asSystem } = ctx.request
      .body as IBatchSendMessageReq;
    const toUsers = await this.userService.getRelative(toUserIds);
    const pq = new this.PromiseQueue(8, Infinity);
    const queueTasks = Object.keys(toUsers).map((toUserId) =>
      pq.add(() =>
        this.service.create({
          fromUserId: asSystem ? 0 : ctx.session.userId,
          toUserId: +toUserId,
          title,
          content,
          anonymous,
        }),
      ),
    );
    await Promise.all(queueTasks);
  }

  @route()
  @login()
  async [routesBe.updateMessageRead.i](ctx: Context): Promise<void> {
    const { messageId, read } = ctx.request.body as IUpdateMessageReadReq;
    const isExists = await this.service.isExists({
      messageId,
      toUserId: ctx.session.userId,
    });
    if (!isExists) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    await this.service.update(messageId, {
      read,
    });
  }
}
