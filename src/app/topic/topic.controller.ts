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
} from '@/lib/decorators/controller.decorator';
import { CTopicMeta } from './topic.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';

@provide()
@controller('/')
export default class TopicController {
  @inject('topicMeta')
  meta: CTopicMeta;

  @inject('topicService')
  service: CTopicService;

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
}
