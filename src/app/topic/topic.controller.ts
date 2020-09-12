import { Context, controller, inject, provide } from 'midway';
import { CTopicService } from './topic.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  respDetail,
  login,
  authOrRequireSelf,
  requireSelf,
  rateLimitUser,
} from '@/lib/decorators/controller.decorator';
import { CTopicMeta } from './topic.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { ICreateTopicReq, ICreateTopicResp, IUpdateTopicDetailReq } from '@/common/contracts/topic';
import { CProblemService } from '../problem/problem.service';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';

@provide()
@controller('/')
export default class TopicController {
  @inject('topicMeta')
  meta: CTopicMeta;

  @inject('topicService')
  service: CTopicService;

  @inject()
  problemService: CProblemService;

  @inject()
  utils: IUtils;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getTopicList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getTopicDetail.i](_ctx: Context) {}

  @route()
  @login()
  @rateLimitUser(60, 3)
  async [routesBe.createTopic.i](ctx: Context): Promise<ICreateTopicResp> {
    const { title, content, problemId } = ctx.request.body as ICreateTopicReq;
    if (problemId && !(await this.problemService.getDetail(problemId, null))) {
      throw new ReqError(Codes.TOPIC_PROBLEM_NOT_EXIST);
    }
    const newId = await this.service.create({
      title,
      content,
      userId: ctx.session.userId,
      problemId,
    });
    return { topicId: newId };
  }

  @route()
  @id()
  @getDetail()
  @requireSelf()
  async [routesBe.updateTopicDetail.i](ctx: Context): Promise<void> {
    const topicId = ctx.id!;
    const { title, content } = ctx.request.body as IUpdateTopicDetailReq;
    await this.service.update(topicId, {
      title,
      content,
    });
    await this.service.clearDetailCache(topicId);
  }

  @route()
  @id()
  @getDetail()
  @authOrRequireSelf('perm')
  async [routesBe.deleteTopic.i](ctx: Context): Promise<void> {
    const topicId = ctx.id!;
    await this.service.update(topicId, {
      deleted: true,
    });
    await this.service.clearDetailCache(topicId);
  }
}
