import { Context, controller, inject, provide } from 'midway';
import { route, pagination, getList, respList, login } from '@/lib/decorators/controller.decorator';
import { CMessageMeta } from './message.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CMessageService } from './message.service';
import { ILodash } from '@/utils/libs/lodash';
import { IGetMessageListReq } from '@/common/contracts/message';
import { IMMessageServiceGetListRes } from './message.interface';

@provide()
@controller('/')
export default class MessageController {
  @inject('messageMeta')
  meta: CMessageMeta;

  @inject('messageService')
  service: CMessageService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

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
}
