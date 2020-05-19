import { Context, controller, inject, provide, Middleware } from 'midway';
import { CUserService } from './users.service';
import { id, getDetail, pagination, route, auth } from '@/lib/decorators/controller.decorator';
import { IMUserDetail } from './users.interface';
import { CUserMeta } from './users.meta';
import { routesBe } from '@/common/routes';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IUtils } from '@/utils';
import { ILoginReq, IRegisterReq } from '@/common/contracts/user.req';

// const mw: Middleware = async (ctx, next) => {
//   ctx.home = '123';
//   await next();
// };

@provide()
@controller('/')
export default class UserController {
  @inject('userMeta')
  meta: CUserMeta;

  @inject('userService')
  service: CUserService;

  @inject()
  utils: IUtils;

  @route()
  async [routesBe.getSession.name](ctx: Context) {
    return ctx.helper.isGlobalLoggedIn() ? ctx.session : null;
  }

  @route()
  async [routesBe.login.name](ctx: Context) {
    const { loginName, password } = ctx.request.body as ILoginReq;
    const pass = this.utils.misc.hashPassword(password);
    const user =
      (await this.service.findOne({
        username: loginName,
        password: pass,
      })) ||
      (await this.service.findOne({
        email: loginName,
        password: pass,
      }));
    if (!user) {
      throw new ReqError(Codes.USER_INCORRECT_LOGIN_INFO);
    }
    ctx.session = {
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      permission: user.permission,
      avatar: user.avatar,
    };
  }

  @route()
  async [routesBe.register.name](ctx: Context) {
    const { username, nickname, email, code, password } = ctx.request.body as IRegisterReq;
    // TODO 校验验证码
    if (await this.service.isUsernameExists(username)) {
      throw new ReqError(Codes.USER_USERNAME_EXISTS);
    } else if (await this.service.isNicknameExists(nickname)) {
      throw new ReqError(Codes.USER_NICKNAME_EXISTS);
    } else if (await this.service.isEmailExists(email)) {
      throw new ReqError(Codes.USER_EMAIL_EXISTS);
    }
    const pass = this.utils.misc.hashPassword(password);
    const newUserId = await this.service.create({
      username,
      nickname,
      email,
      verified: true,
      password: pass,
    });
    return { userId: newUserId };
  }

  @route()
  async [routesBe.logout.name](ctx: Context) {
    // @ts-ignore
    ctx.session = null;
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.getUserDetail.name](ctx: Context) {
    return ctx.detail as IMUserDetail;
  }
}
