import { Context, controller, inject, provide } from 'midway';
import { CReplyService } from './reply.service';
import {
  pagination,
  route,
  getList,
  respList,
  login,
  rateLimitUser,
  id,
  getDetail,
  authOrRequireSelf,
} from '@/lib/decorators/controller.decorator';
import { CReplyMeta } from './reply.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { ICreateReplyResp, ICreateReplyReq } from '@/common/contracts/reply';
import { CTopicService } from '../topic/topic.service';

@provide()
@controller('/')
export default class ReplyController {
  @inject('replyMeta')
  meta: CReplyMeta;

  @inject('replyService')
  service: CReplyService;

  @inject()
  topicService: CTopicService;

  @inject()
  utils: IUtils;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getReplyList.i](_ctx: Context) {}

  @route()
  @login()
  @rateLimitUser(60, 3)
  async [routesBe.createReply.i](ctx: Context): Promise<ICreateReplyResp> {
    const { topicId, content } = ctx.request.body as ICreateReplyReq;
    if (!(await this.topicService.getDetail(topicId))) {
      throw new ReqError(Codes.TOPIC_NOT_EXIST);
    }
    const newId = await this.service.create({
      topicId,
      content,
      userId: ctx.session.userId,
    });
    return { replyId: newId };
  }

  @route()
  @id()
  @getDetail()
  @authOrRequireSelf('perm')
  async [routesBe.deleteReply.i](ctx: Context): Promise<void> {
    const replyId = ctx.id!;
    await this.service.update(replyId, {
      deleted: true,
    });
  }
}
