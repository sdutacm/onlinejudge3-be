import { Context, controller, get, inject, provide, Middleware } from 'midway';
import { CUserService } from './users.service';
import { requireDetail } from '@/lib/decorators/controller.decorator';
import { IMUserDetail } from './users.interface';

const mw: Middleware = async (ctx, next) => {
  ctx.home = '123';
  await next();
};

@provide()
@controller('/user')
export class UserController {
  @inject()
  private userService: CUserService;

  @get('/:userId', { middleware: [mw] })
  @requireDetail((ctx) => +ctx.params.userId, 'userService')
  // TODO @id({ userId: 'userId' })
  // @requireSelf('userService')
  // @fLimit(LIMIT.Frequency.detail)
  // @traceReport
  public async getUser(ctx: Context): Promise<void> {
    const id = ctx.id!;
    const detail = ctx.detail! as IMUserDetail;
    console.log('getUser', id, detail);
    // const user = await this.userService.getDetail(id);
    // const list = await this.userService.getList({
    //   offset: 0,
    //   limit: 10,
    //   nickname: 'jk',
    //   // @ts-ignore
    //   avatar: undefined,
    //   grade: '2015',
    // });
    const res = await this.userService._test();

    ctx.body = ctx.helper.rSuc(detail);
  }
}
