import { Context, controller, inject, provide, Middleware, post } from 'midway';
import { CUserService } from './users.service';
import { id, detail, validate } from '@/lib/decorators/controller.decorator';
import { IMUserDetail } from './users.interface';
import { IUserContract } from './users.contract';
import { IUserMeta } from './users.meta';

const mw: Middleware = async (ctx, next) => {
  ctx.home = '123';
  await next();
};

@provide()
@controller('/')
export default class UserController {
  @inject('userMeta')
  private meta: IUserMeta;

  @inject('userService')
  private service: CUserService;

  @post('/getUserDetail', { middleware: [mw] })
  @validate<IUserContract>('getUserDetailReq')
  @id()
  @detail()
  // @requireSelf('service')
  // @fLimit(LIMIT.Frequency.detail)
  // @traceReport
  public async getUserDetail(ctx: Context) {
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
    const res = await this.service._test();
    ctx.logger.info('done', res);

    ctx.body = ctx.helper.rSuc(detail);
  }
}
