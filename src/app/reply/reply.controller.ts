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
import { IMReplyDetail } from './reply.interface';

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
  @rateLimitUser(60, 10)
  async [routesBe.createReply.i](ctx: Context): Promise<ICreateReplyResp> {
    throw new ReqError(Codes.GENERAL_FEATURE_NOT_AVAILABLE);
    // const { topicId, content } = ctx.request.body as ICreateReplyReq;
    // if (!(await this.topicService.getDetail(topicId))) {
    //   throw new ReqError(Codes.TOPIC_NOT_EXIST);
    // }
    // const createdAt = new Date();
    // const newId = await this.service.create({
    //   topicId,
    //   content,
    //   userId: ctx.session.userId,
    //   createdAt,
    // });
    // await this.topicService.update(topicId, {
    //   replyCount: await this.service.countTopicReplies(topicId),
    //   lastTime: createdAt,
    //   lastUserId: ctx.session.userId,
    // });
    // await this.topicService.clearDetailCache(topicId);
    // return { replyId: newId };
  }

  @route()
  @id()
  @getDetail()
  @authOrRequireSelf('perm')
  async [routesBe.deleteReply.i](ctx: Context): Promise<void> {
    const replyId = ctx.id!;
    const detail = ctx.detail as IMReplyDetail;
    await this.service.update(replyId, {
      deleted: true,
    });
    const topicId = detail.topic?.topicId;
    if (topicId) {
      // 删除了话题回复，更新 topic 相关字段
      const latestReplyRes = await this.service.getList(
        {
          topicId,
        },
        {
          page: 1,
          limit: 1,
          order: [['replyId', 'DESC']],
        },
      );
      const latestReply = latestReplyRes.rows[0];
      let topicUpdateOpt = {
        replyCount: 0,
        lastTime: new Date(),
        lastUserId: 0,
      };
      if (latestReply) {
        topicUpdateOpt = {
          replyCount: await this.service.countTopicReplies(topicId),
          lastTime: latestReply.createdAt,
          lastUserId: latestReply.user.userId,
        };
      } else {
        const topic = await this.topicService.getDetail(topicId, null);
        if (topic) {
          topicUpdateOpt.lastTime = topic.createdAt;
        }
      }
      await this.topicService.update(topicId, topicUpdateOpt);
      await this.topicService.clearDetailCache(topicId);
    }
  }
}
