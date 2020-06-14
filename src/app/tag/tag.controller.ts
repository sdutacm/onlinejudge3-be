import { Context, controller, inject, provide } from 'midway';
import {
  route,
  id,
  getDetail,
  auth,
  getFullList,
  respFullList,
} from '@/lib/decorators/controller.decorator';
import { CTagMeta } from './tag.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CTagService } from './tag.service';
import { ICreateTagResp, ICreateTagReq, IUpdateTagDetailReq } from '@/common/contracts/tag';
import { ILodash } from '@/utils/libs/lodash';

@provide()
@controller('/')
export default class TagController {
  @inject('tagMeta')
  meta: CTagMeta;

  @inject('tagService')
  service: CTagService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @getFullList()
  @respFullList()
  async [routesBe.getTagFullList.i](_ctx: Context) {}

  @route()
  @auth('admin')
  async [routesBe.createTag.i](ctx: Context): Promise<ICreateTagResp> {
    const data = ctx.request.body as ICreateTagReq;
    const newId = await this.service.create(data);
    return { tagId: newId };
  }

  @route()
  @auth('admin')
  @id()
  @getDetail(null)
  async [routesBe.updateTagDetail.i](ctx: Context): Promise<void> {
    const tagId = ctx.id!;
    const data = this.lodash.omit(ctx.request.body as IUpdateTagDetailReq, ['tagId']);
    await this.service.update(tagId, data);
    await this.service.clearFullListCache();
    // TODO 清除有这个标签的题目的缓存
  }
}
