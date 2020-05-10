import { Context, controller, inject, provide, Middleware } from 'midway';
import { CUserService } from './users.service';
import { id, detail, pagination, route, auth, suc } from '@/lib/decorators/controller.decorator';
import { IMUserDetail } from './users.interface';
import { CUserMeta } from './users.meta';
import { routesBe } from '@/common/routes';

const mw: Middleware = async (ctx, next) => {
  ctx.home = '123';
  await next();
};

@provide()
@controller('/')
export default class UserController {
  @inject('userMeta')
  meta: CUserMeta;

  @inject('userService')
  service: CUserService;

  @route()
  async [routesBe.getSession.name](ctx: Context) {
    ctx.body = ctx.helper.rSuc(ctx.helper.isGlobalLoggedIn() ? ctx.session : null);
  }

  @route()
  @suc()
  async [routesBe.logout.name](ctx: Context) {
    // @ts-ignore
    ctx.session = null;
  }

  @route()
  @id()
  @detail()
  async [routesBe.getUserDetail.name](ctx: Context) {
    const id = ctx.id!;
    const detail = ctx.detail! as IMUserDetail;

    // const user = await this.service.getDetail(id);
    // const list = await this.service.getList({
    //   offset: 0,
    //   limit: 10,
    //   nickname: 'jk',
    //   // @ts-ignore
    //   avatar: undefined,
    //   grade: '2015',
    // });
    // const res = await this.service._test();
    // ctx.logger.info('done', res);

    ctx.body = ctx.helper.rSuc(detail);
  }
}
