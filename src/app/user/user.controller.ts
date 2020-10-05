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
  login,
  authOrRequireSelf,
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
  ILoginResp,
  ICreateUserReq,
  ICreateUserResp,
} from '@/common/contracts/user';
import { IMUserDetail, IMUserServiceGetListRes } from './user.interface';
import { CVerificationService } from '../verification/verification.service';
import { IAppConfig } from '@/config/config.interface';
import path from 'path';
import { ISharp } from '@/utils/libs/sharp';
import { IFs } from '@/utils/libs/fs-extra';
import { ILodash } from '@/utils/libs/lodash';
import { CSolutionService } from '../solution/solution.service';
import { EUserPermission } from '@/common/enums';

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

  /**
   * 获取 Session。
   * @returns 如果已登录，则返回不带 contests 的 session，否则返回 null
   */
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

  /**
   * 登录。
   *
   * 按照 username+password 或 email+password 尝试登录。如果登录成功则设置 session。
   * @returns 不带 contests 的 session
   */
  @route()
  async [routesBe.login.i](ctx: Context): Promise<ILoginResp> {
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
    this.service.updateUserLastStatus(user.userId, { lastIp: ctx.ip }).then(() => {
      this.service.clearDetailCache(user.userId);
    });
    return {
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      permission: user.permission,
      avatar: user.avatar,
    };
  }

  /**
   * 登出。
   */
  @route()
  async [routesBe.logout.i](ctx: Context): Promise<void> {
    // @ts-ignore
    ctx.session = null;
  }

  /**
   * 注册。
   *
   * 校验逻辑：
   * 1. 检查用户名、昵称、邮箱均不被占用
   * 2. 此邮箱的验证码有效
   *
   * 注册成功后逻辑：
   * 1. 设置新用户 session
   * 2. 清除已使用的验证码
   * @returns 用户 ID
   */
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
    ctx.session = {
      userId: newId,
      username: username,
      nickname: nickname,
      permission: EUserPermission.normal,
      avatar: '',
      contests: {},
    };
    this.service.updateUserLastStatus(newId, { lastIp: ctx.ip }).then(() => {
      this.service.clearDetailCache(newId);
    });
    return { userId: newId };
  }

  /**
   * 创建用户。
   *
   * 权限：管理员
   *
   * 校验逻辑：
   * 1. 检查用户名、昵称、邮箱均不被占用
   * @returns 用户 ID
   */
  @route()
  @auth('admin')
  async [routesBe.createUser.i](ctx: Context): Promise<ICreateUserResp> {
    const {
      username,
      nickname,
      email,
      password,
      school,
      college,
      major,
      class: _class,
      grade,
    } = ctx.request.body as ICreateUserReq;
    if (await this.service.isUsernameExists(username)) {
      throw new ReqError(Codes.USER_USERNAME_EXISTS);
    } else if (await this.service.isNicknameExists(nickname)) {
      throw new ReqError(Codes.USER_NICKNAME_EXISTS);
    } else if (email && (await this.service.isEmailExists(email))) {
      throw new ReqError(Codes.USER_EMAIL_EXISTS);
    }
    const newId = await this.service.create({
      username,
      nickname,
      email: email || '',
      verified: !!email,
      password: this.utils.misc.hashPassword(password),
      school,
      college,
      major,
      class: _class,
      grade,
    });
    return { userId: newId };
  }

  /**
   * 获取用户列表。
   *
   * 如果非管理，则以下字段不可用于搜索：
   * - forbidden
   * - permission
   * - verified
   *
   * 如果非管理，则以下字段不会返回：
   * - permission
   * - verified
   * - lastIp
   * - lastTime
   * - createdAt
   * @returns 用户列表
   */
  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList: (ctx) => {
      if (!ctx.isAdmin) {
        delete ctx.request.body.forbidden;
        delete ctx.request.body.permission;
        delete ctx.request.body.verified;
      }
    },
    afterGetList: (ctx) => {
      const list = ctx.list as IMUserServiceGetListRes;
      if (!ctx.isAdmin) {
        list.rows.forEach((d) => {
          delete d.permission;
          delete d.verified;
          delete d.lastIp;
          delete d.lastTime;
          delete d.createdAt;
        });
      }
    },
  })
  @respList()
  async [routesBe.getUserList.i](_ctx: Context) {}

  /**
   * 获取用户详情。
   *
   * 如果查询的用户不是当前登录用户或管理员，则需移除以下字段：
   * - email
   * - defaultLanguage
   * - settings
   * - coin
   * - verified
   * - lastIp
   * - lastTime
   * - createdAt
   * @returns 用户详情
   */
  @route()
  @id()
  @getDetail()
  async [routesBe.getUserDetail.i](ctx: Context): Promise<IGetUserDetailResp> {
    const detail = ctx.detail as IMUserDetail;
    // @ts-ignore
    const detailResp = detail as TreatDateFieldsAsString<typeof detail>;
    if (!ctx.helper.isSelfOrAdmin(ctx.id!)) {
      return this.lodash.omit(detailResp, [
        'email',
        'defaultLanguage',
        'settings',
        'coin',
        'verified',
        'lastIp',
        'lastTime',
        'createdAt',
      ]);
    }
    return detailResp;
  }

  /**
   * 更新用户信息。
   *
   * 权限：当前登录用户或管理员
   *
   * 如果用户不是管理员，则无法更新以下字段：
   * - forbidden
   * - permission
   */
  @route()
  @authOrRequireSelf('admin')
  @id()
  @getDetail(null)
  async [routesBe.updateUserDetail.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const req = ctx.request.body as IUpdateUserDetailReq;
    if (!ctx.isAdmin) {
      delete req.forbidden;
      delete req.permission;
    }
    await this.service.update(userId, this.lodash.omit(req, ['userId']));
    await this.service.clearDetailCache(userId);
  }

  /**
   * 修改密码。
   *
   * 权限：当前登录用户
   *
   * 校验旧密码正确则可以修改密码。
   */
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

  /**
   * 重置密码。
   *
   * 通过邮箱和验证码重置密码，根据邮箱查到对应用户且需验证码有效。
   */
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

  /**
   * 强制重置密码。
   *
   * 权限：管理员。
   */
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

  /**
   * 更改邮箱。
   *
   * 权限：当前登录用户
   *
   * 需要未被使用的新邮箱和有效验证码来更改邮箱。
   */
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
    if (await this.service.isEmailExists(email)) {
      throw new ReqError(Codes.USER_EMAIL_EXISTS);
    }
    await this.service.update(userId, {
      email,
      verified: true,
    });
    await this.service.clearDetailCache(userId);
    this.verificationService.deleteEmailVerificationCode(email);
  }

  /**
   * 上传头像。
   *
   * 权限：登录
   *
   * 图片校验逻辑：
   * 1. 格式限制：jpeg/png
   * 2. 大小限制
   *
   * 上传成功后保留原图和压缩图（s_），且清除旧文件。
   */
  @route()
  @login()
  async [routesBe.uploadUserAvatar.i](ctx: Context): Promise<void> {
    const userId = ctx.session.userId;
    const detail = await this.service.getDetail(userId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
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
    const { avatar: oldImage } = detail;
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

  /**
   * 上传巨幅。
   *
   * 权限：登录
   *
   * 图片校验逻辑：
   * 1. 格式限制：jpeg/png
   * 2. 大小限制
   *
   * 上传成功后保留原图、压缩图（s_）和等比最小缩放的极压缩图（min_），且清除旧文件。
   */
  @route()
  @login()
  async [routesBe.uploadUserBannerImage.i](ctx: Context): Promise<void> {
    const userId = ctx.session.userId;
    const detail = await this.service.getDetail(userId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
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
    const { bannerImage: oldImage } = detail;
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

  /**
   * 获取用户的题目提交结果统计。
   *
   * 如传了 contestId，则查找范围限定在指定比赛。
   * @returns 用户提交结果统计
   */
  @route()
  @id()
  async [routesBe.getUserProblemResultStats.i](ctx: Context) {
    const userId = ctx.id!;
    const { contestId } = ctx.request.body;
    return this.solutionService.getUserProblemResultStats(userId, contestId);
  }

  /**
   * 获取用户的提交日历图统计。
   * @returns 用户提交日历图统计
   */
  @route()
  @id()
  @getDetail()
  async [routesBe.getUserSolutionCalendar.i](ctx: Context): Promise<IGetUserSolutionCalendarResp> {
    const userId = ctx.id!;
    const { result } = ctx.request.body as IGetUserSolutionCalendarReq;
    return this.solutionService.getUserSolutionCalendar(userId, result);
  }
}
