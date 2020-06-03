import { Context, controller, inject, provide, Middleware, config } from 'midway';
import { CUserService } from './user.service';
import {
  id,
  getDetail,
  pagination,
  route,
  auth,
  getList,
  respList,
  respDetail,
  login,
} from '@/lib/decorators/controller.decorator';
import { CUserMeta } from './user.meta';
import { routesBe } from '@/common/routes';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IUtils } from '@/utils';
import {
  ILoginReq,
  IRegisterReq,
  IGetSessionResp,
  IUploadUserAvatarReq,
} from '@/common/contracts/user';
import { IMUserDetail } from './user.interface';
import { CVerificationService } from '../verification/verification.service';
import { IAppConfig } from '@/config/config.interface';
import path from 'path';
import { ISharp } from '@/utils/libs/sharp';
import { IFs } from '@/utils/libs/fs-extra';

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

  @inject('verificationService')
  verificationService: CVerificationService;

  @inject()
  utils: IUtils;

  @inject()
  sharp: ISharp;

  @inject()
  fs: IFs;

  @config()
  staticPath: IAppConfig['staticPath'];

  @config()
  uploadLimit: IAppConfig['uploadLimit'];

  @route()
  async [routesBe.getSession.i](ctx: Context): Promise<IGetSessionResp> {
    return ctx.helper.isGlobalLoggedIn()
      ? {
          userId: ctx.session.userId,
          username: ctx.session.username,
          nickname: ctx.session.nickname,
          permission: ctx.session.permission,
          avatar: ctx.session.avatar,
        }
      : null;
  }

  @route()
  async [routesBe.login.i](ctx: Context) {
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
  async [routesBe.register.i](ctx: Context) {
    const { username, nickname, email, code, password } = ctx.request.body as IRegisterReq;
    if (await this.service.isUsernameExists(username)) {
      throw new ReqError(Codes.USER_USERNAME_EXISTS);
    } else if (await this.service.isNicknameExists(nickname)) {
      throw new ReqError(Codes.USER_NICKNAME_EXISTS);
    } else if (await this.service.isEmailExists(email)) {
      throw new ReqError(Codes.USER_EMAIL_EXISTS);
    }
    const verificationCode = await this.verificationService.getEmailVerificationCode(email);
    if (verificationCode?.code !== code) {
      throw new ReqError(Codes.USER_INCORRECT_VERIFICATION_CODE);
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
  async [routesBe.logout.i](ctx: Context) {
    // @ts-ignore
    ctx.session = null;
  }

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getUserList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getUserDetail.i](_ctx: Context) {}

  @route()
  @login(true)
  @id()
  @getDetail()
  async [routesBe.uploadUserAvatar.i](ctx: Context) {
    const userId = ctx.id!;
    const ALLOWED_TYPE = ['image/jpeg', 'image/png'];
    console.log('f', ctx.request.files);
    const image = ctx.request.files?.filter((f) => f.field === 'avatar')[0];
    if (!image) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    if (!ALLOWED_TYPE.includes(image.mime)) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA);
    }
    const stat = this.fs.statSync(image.filepath);
    if (stat.size > this.uploadLimit.avatar) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA_SIZE);
    }
    const ext = image.mime.split('/')[1];
    const saveName = `${userId}_${this.utils.misc.randomString({ length: 16 })}.${ext}`;
    const fullFileName = saveName;
    const sFileName = `s_${saveName}`;
    // 存储图片
    await this.sharp(image.filepath)
      .resize(128)
      .toFile(path.join(this.staticPath.avatar, sFileName));
    this.fs.copyFileSync(image.filepath, path.join(this.staticPath.avatar, fullFileName));
    const { avatar: oldAvatar } = ctx.detail as IMUserDetail;
    // 清除旧文件
    if (oldAvatar) {
      this.fs.removeSync(path.join(this.staticPath.avatar, oldAvatar));
      this.fs.removeSync(path.join(this.staticPath.avatar, `s_${oldAvatar}`));
    }
    // 更新
    await this.service.update(userId, {
      avatar: saveName,
    });
    await this.service.clearDetailCache(userId);
    ctx.session.avatar = saveName;
  }
}
