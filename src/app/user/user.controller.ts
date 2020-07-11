import { Context, controller, inject, provide, config } from 'midway';
import { CUserService } from './user.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  auth,
  requireSelf,
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
  IUpdateUserDetailReq,
  IUpdateUserPasswordReq,
  IResetUserPasswordReq,
  IUpdateUserEmailReq,
  IResetUserPasswordByAdminReq,
  IGetUserDetailResp,
  IRegisterResp,
  IGetUserSolutionCalendarReq,
  IGetUserSolutionCalendarResp,
} from '@/common/contracts/user';
import { IMUserDetail } from './user.interface';
import { CVerificationService } from '../verification/verification.service';
import { IAppConfig } from '@/config/config.interface';
import path from 'path';
import { ISharp } from '@/utils/libs/sharp';
import { IFs } from '@/utils/libs/fs-extra';
import { ILodash } from '@/utils/libs/lodash';
import { CSolutionService } from '../solution/solution.service';

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
  verificationService: CVerificationService;

  @inject()
  solutionService: CSolutionService;

  @inject()
  utils: IUtils;

  @inject()
  sharp: ISharp;

  @inject()
  fs: IFs;

  @inject()
  lodash: ILodash;

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
  async [routesBe.login.i](ctx: Context): Promise<void> {
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
      contests: {},
    };
  }

  @route()
  async [routesBe.logout.i](ctx: Context): Promise<void> {
    // @ts-ignore
    ctx.session = null;
  }

  @route()
  async [routesBe.register.i](ctx: Context): Promise<IRegisterResp> {
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
    const newId = await this.service.create({
      username,
      nickname,
      email,
      verified: true,
      password: this.utils.misc.hashPassword(password),
    });
    this.verificationService.deleteEmailVerificationCode(email);
    return { userId: newId };
  }

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList: (ctx) => {
      !ctx.isAdmin && delete ctx.request.body.forbidden;
    },
  })
  @respList()
  async [routesBe.getUserList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  async [routesBe.getUserDetail.i](ctx: Context): Promise<IGetUserDetailResp> {
    const detail = ctx.detail as IMUserDetail;
    // @ts-ignore
    const detailResp = detail as TreatDateFieldsAsString<typeof detail>;
    if (!ctx.helper.isSelf(ctx.id!)) {
      return this.lodash.omit(detailResp, [
        'email',
        'defaultLanguage',
        'settings',
        'coin',
        'verified',
        'lastTime',
        'createdAt',
      ]);
    }
    return detailResp;
  }

  @route()
  @requireSelf()
  @id()
  @getDetail()
  async [routesBe.updateUserDetail.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const req = ctx.request.body as IUpdateUserDetailReq;
    await this.service.update(userId, this.lodash.omit(req, ['userId']));
    await this.service.clearDetailCache(userId);
  }

  @route()
  @requireSelf()
  @id()
  @getDetail()
  async [routesBe.updateUserPassword.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const { oldPassword, password } = ctx.request.body as IUpdateUserPasswordReq;
    if (
      !(await this.service.isExists({
        userId,
        password: this.utils.misc.hashPassword(oldPassword),
      }))
    ) {
      throw new ReqError(Codes.USER_INCORRECT_OLD_PASSWORD);
    }
    await this.service.update(userId, {
      password: this.utils.misc.hashPassword(password),
    });
  }

  @route()
  async [routesBe.resetUserPassword.i](ctx: Context): Promise<void> {
    const { email, code, password } = ctx.request.body as IResetUserPasswordReq;
    const user = await this.service.findOne({
      email,
      verified: true,
    });
    if (!user) {
      throw new ReqError(Codes.USER_NOT_EXIST);
    }
    const verificationCode = await this.verificationService.getEmailVerificationCode(email);
    if (verificationCode?.code !== code) {
      throw new ReqError(Codes.USER_INCORRECT_VERIFICATION_CODE);
    }
    await this.service.update(user.userId, {
      password: this.utils.misc.hashPassword(password),
    });
    this.verificationService.deleteEmailVerificationCode(email);
  }

  @route()
  @auth('admin')
  @id()
  @getDetail()
  async [routesBe.resetUserPasswordByAdmin.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const { password } = ctx.request.body as IResetUserPasswordByAdminReq;
    await this.service.update(userId, {
      password: this.utils.misc.hashPassword(password),
    });
  }

  @route()
  @requireSelf()
  @id()
  @getDetail()
  async [routesBe.updateUserEmail.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const { email, code } = ctx.request.body as IUpdateUserEmailReq;
    const verificationCode = await this.verificationService.getEmailVerificationCode(email);
    if (verificationCode?.code !== code) {
      throw new ReqError(Codes.USER_INCORRECT_VERIFICATION_CODE);
    }
    await this.service.update(userId, {
      email,
      verified: true,
    });
    await this.service.clearDetailCache(userId);
    this.verificationService.deleteEmailVerificationCode(email);
  }

  @route()
  @requireSelf()
  @id()
  @getDetail()
  async [routesBe.uploadUserAvatar.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const ALLOWED_TYPE = ['image/jpeg', 'image/png'];
    const image = ctx.request.files?.filter((f) => f.field === 'avatar')[0];
    if (!image) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    if (!ALLOWED_TYPE.includes(image.mime)) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA);
    }
    const stat = this.fs.statSync(image.filepath);
    if (stat.size > this.uploadLimit.avatar) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA_SIZE, {
        maxSize: this.uploadLimit.avatar,
      });
    }
    const ext = image.mime.split('/')[1];
    const saveName = `${userId}_${this.utils.misc.randomString({ length: 16 })}.${ext}`;
    const fullFileName = saveName;
    const sFileName = `s_${saveName}`;
    // 压缩并存储图片
    await Promise.all([
      this.fs.copyFile(image.filepath, path.join(this.staticPath.avatar, fullFileName)),
      await this.sharp(image.filepath)
        .resize(128)
        .toFile(path.join(this.staticPath.avatar, sFileName)),
    ]);
    // 清除旧文件
    const { avatar: oldImage } = ctx.detail as IMUserDetail;
    if (oldImage) {
      await Promise.all([
        this.fs.remove(path.join(this.staticPath.avatar, oldImage)),
        this.fs.remove(path.join(this.staticPath.avatar, `s_${oldImage}`)),
      ]);
    }
    // 更新
    await this.service.update(userId, {
      avatar: saveName,
    });
    await this.service.clearDetailCache(userId);
    ctx.session.avatar = saveName;
  }

  @route()
  @requireSelf()
  @id()
  @getDetail()
  async [routesBe.uploadUserBannerImage.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const ALLOWED_TYPE = ['image/jpeg', 'image/png'];
    const SIZE_WITH_SCALE = 400;
    const image = ctx.request.files?.filter((f) => f.field === 'bannerImage')[0];
    if (!image) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    if (!ALLOWED_TYPE.includes(image.mime)) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA);
    }
    const stat = this.fs.statSync(image.filepath);
    if (stat.size > this.uploadLimit.bannerImage) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA_SIZE, {
        maxSize: this.uploadLimit.bannerImage,
      });
    }
    const ext = image.mime.split('/')[1];
    const saveName = `${userId}_${this.utils.misc.randomString({ length: 16 })}.${ext}`;
    const fullFileName = saveName;
    const sFileName = `s_${saveName}`;
    const minFileName = `min_${saveName}`;
    // 压缩图片
    const sImageInstance = this.sharp(image.filepath).resize(SIZE_WITH_SCALE);
    let minImageInstance = this.sharp(image.filepath);
    const { format, width, height } = await sImageInstance.metadata();
    if (!width || !height) {
      throw new ReqError(Codes.GENERAL_INVALID_MEDIA);
    }
    // 压缩 min image
    const cds = this.utils.misc.cdAll(width, height).reverse();
    for (const cd of cds) {
      const w = width / cd;
      const h = height / cd;
      if (w >= SIZE_WITH_SCALE || h >= SIZE_WITH_SCALE) {
        minImageInstance = minImageInstance.resize(w, h);
        break;
      }
    }
    minImageInstance = minImageInstance.blur(20);
    switch (format) {
      case 'jpeg':
        minImageInstance = minImageInstance.jpeg({ quality: 20 });
        break;
      case 'png':
        minImageInstance = minImageInstance.png({ quality: 20 });
        break;
    }
    // 存储图片
    await Promise.all([
      this.fs.copyFile(image.filepath, path.join(this.staticPath.bannerImage, fullFileName)),
      sImageInstance.toFile(path.join(this.staticPath.bannerImage, sFileName)),
      minImageInstance.toFile(path.join(this.staticPath.bannerImage, minFileName)),
    ]);
    // 清除旧文件
    const { bannerImage: oldImage } = ctx.detail as IMUserDetail;
    if (oldImage) {
      await Promise.all([
        this.fs.remove(path.join(this.staticPath.bannerImage, oldImage)),
        this.fs.remove(path.join(this.staticPath.bannerImage, `s_${oldImage}`)),
        this.fs.remove(path.join(this.staticPath.bannerImage, `min_${oldImage}`)),
      ]);
    }
    // 更新
    await this.service.update(userId, {
      bannerImage: saveName,
    });
    await this.service.clearDetailCache(userId);
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.getUserProblemResultStats.i](ctx: Context) {
    const userId = ctx.id!;
    const { contestId } = ctx.request.body;
    return this.solutionService.getUserProblemResultStats(userId, contestId);
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.getUserSolutionCalendar.i](ctx: Context): Promise<IGetUserSolutionCalendarResp> {
    const userId = ctx.id!;
    const { result } = ctx.request.body as IGetUserSolutionCalendarReq;
    return this.solutionService.getUserSolutionCalendar(userId, result);
  }
}
