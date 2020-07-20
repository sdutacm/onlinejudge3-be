import { Context, controller, inject, provide } from 'midway';
import { CReplyService } from './reply.service';
import { pagination, route, getList, respList } from '@/lib/decorators/controller.decorator';
import { CReplyMeta } from './reply.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CProblemService } from '../problem/problem.service';

@provide()
@controller('/')
export default class ReplyController {
  @inject('replyMeta')
  meta: CReplyMeta;

  @inject('replyService')
  service: CReplyService;

  @inject()
  problemService: CProblemService;

  @inject()
  utils: IUtils;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getReplyList.i](_ctx: Context) {}
}
