import { Context, controller, inject, provide } from 'midway';
import { CPostService } from './post.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  respDetail,
  authOrRequireSelf,
  auth,
} from '@/lib/decorators/controller.decorator';
import { CPostMeta } from './post.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { ICreatePostReq, ICreatePostResp, IUpdatePostDetailReq } from '@/common/contracts/post';

@provide()
@controller('/')
export default class PostController {
  @inject('postMeta')
  meta: CPostMeta;

  @inject('postService')
  service: CPostService;

  @inject()
  utils: IUtils;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getPostList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getPostDetail.i](_ctx: Context) {}

  @route()
  @auth('admin')
  async [routesBe.createPost.i](ctx: Context): Promise<ICreatePostResp> {
    const { title, content, display } = ctx.request.body as ICreatePostReq;
    const newId = await this.service.create({
      title,
      content,
      display,
      userId: ctx.session.userId,
    });
    return { postId: newId };
  }

  @route()
  @id()
  @getDetail()
  @authOrRequireSelf('admin')
  async [routesBe.updatePostDetail.i](ctx: Context): Promise<void> {
    const postId = ctx.id!;
    const { title, content, display } = ctx.request.body as IUpdatePostDetailReq;
    await this.service.update(postId, {
      title,
      content,
      display,
    });
    await this.service.clearDetailCache(postId);
  }
}
