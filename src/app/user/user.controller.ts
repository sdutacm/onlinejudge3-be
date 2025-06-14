import { Context, controller, inject, provide, config } from 'midway';
import { CUserService } from './user.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  requireSelf,
  login,
  authPerm,
  authPermOrRequireSelf,
} from '@/lib/decorators/controller.decorator';
import { CUserMeta } from './user.meta';
import { routesBe } from '@/common/routes';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { IUtils } from '@/utils';
import WeakPasswordChecker from '@/common/utils/weakpwd-check';
import {
  ILoginReq,
  IRegisterReq,
  IGetSessionResp,
  IUpdateUserDetailReq,
  IUpdateUserPasswordReq,
  IResetUserPasswordReq,
  IResetUserPasswordAndEmailReq,
  IUpdateUserEmailReq,
  IResetUserPasswordByAdminReq,
  IGetUserDetailResp,
  IRegisterResp,
  IGetUserSolutionCalendarReq,
  IGetUserSolutionCalendarResp,
  ILoginResp,
  ICreateUserReq,
  ICreateUserResp,
  IBatchCreateUsersReq,
  IGetSessionListResp,
  IClearSessionReq,
  IGetActiveUserCountResp,
  IGetAllUserPermissionsMapResp,
  ISetUserPermissionsReq,
  IGetSelfAchievedAchievementsResp,
  IConfirmAchievementDeliveriedReq,
  IReceiveAchievementReq,
  IGetSelfOfficialMembersResp,
  IGetUserMembersResp,
  IAddUserMemberReq,
  IRemoveUserMemberReq,
  IConfirmJoinTeamReq,
  IGetSelfJoinedTeamsResp,
  IGetSelfStaticObjectReq,
  IGetSelfStaticObjectResp,
} from '@/common/contracts/user';
import { IMUserDetail, IMUserServiceGetListRes } from './user.interface';
import { CVerificationService } from '../verification/verification.service';
import { IAppConfig } from '@/config/config.interface';
import path from 'path';
import { ISharp } from '@/utils/libs/sharp';
import { IFs } from '@/utils/libs/fs-extra';
import { ILodash } from '@/utils/libs/lodash';
import { CSolutionService } from '../solution/solution.service';
import { EUserPermission, EUserMemberStatus, EUserStatus, EUserType } from '@/common/enums';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import util from 'util';
import { CPromiseQueue } from '@/utils/libs/promise-queue';
// import { CContentChecker } from '@/utils/content-check';
import { CAuthService } from '../auth/auth.service';
import { EPerm } from '@/common/configs/perm.config';
import { CCosHelper } from '@/utils/cos';
import { CUserAchievementService } from './userAchievement.service';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { CMiscService } from '../misc/misc.service';

const isProd = process.env.NODE_ENV === 'production';

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
  authService: CAuthService;

  @inject()
  verificationService: CVerificationService;

  @inject()
  solutionService: CSolutionService;

  @inject()
  userAchievementService: CUserAchievementService;

  @inject()
  miscService: CMiscService;

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

  @config()
  redisKey: IRedisKeyConfig;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  @inject()
  cosHelper: CCosHelper;

  // @inject()
  // contentChecker: CContentChecker;

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
          permissions: await this.authService.getPermissions(ctx.session.userId),
          avatar: ctx.session.avatar,
          type: ctx.session.type,
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
    // 检查密码强度
    const weak = isProd ? WeakPasswordChecker.isWeak(password) : false;
    if (weak) {
      throw new ReqError(Codes.USER_PASSWORD_STRENGTH_TOO_WEAK);
    }
    ctx.userId = user.userId;
    // @ts-ignore
    await ctx.session._sessCtx.initFromExternal();
    const loginAt = new Date();
    ctx.session = {
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      permission: user.permission,
      avatar: user.avatar,
      type: user.type,
      loginUa: ctx.request.headers['user-agent'] as string,
      loginIp: ctx.ip,
      loginAt: loginAt.toISOString(),
      lastAccessIp: ctx.ip,
      lastAccessAt: loginAt.toISOString(),
      contests: {},
      competitions: {},
    };
    this.service.updateUserLastStatus(user.userId, { lastIp: ctx.ip }).then(() => {
      this.service.clearDetailCache(user.userId);
    });
    return {
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      permission: user.permission,
      permissions: await this.authService.getPermissions(ctx.session.userId),
      avatar: user.avatar,
      type: user.type,
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
    const { username, nickname, email, code, password, type } = ctx.request.body as IRegisterReq;
    if (await this.service.isUsernameExists(username)) {
      throw new ReqError(Codes.USER_USERNAME_EXISTS);
    } else if (await this.service.isNicknameExists(nickname)) {
      throw new ReqError(Codes.USER_NICKNAME_EXISTS);
    } else if (await this.service.isEmailExists(email)) {
      throw new ReqError(Codes.USER_EMAIL_EXISTS);
    }
    const weak = WeakPasswordChecker.isWeak(password);
    if (weak) {
      throw new ReqError(Codes.USER_PASSWORD_STRENGTH_TOO_WEAK);
    }
    const verificationCode = await this.verificationService.getEmailVerificationCode(email);
    if (verificationCode?.code !== code) {
      throw new ReqError(Codes.USER_INCORRECT_VERIFICATION_CODE);
    }
    // if (!(await this.contentChecker.simpleCheck(nickname, 'nickname'))) {
    //   throw new ReqError(Codes.USER_NICKNAME_CONTAINS_ILLEGAL_CONTENT);
    // }
    const newId = await this.service.create({
      username,
      nickname,
      email,
      verified: true,
      password: this.utils.misc.hashPassword(password),
      type,
    });
    this.verificationService.deleteEmailVerificationCode(email);
    ctx.userId = newId;
    // @ts-ignore
    await ctx.session._sessCtx.initFromExternal();
    const loginAt = new Date();
    ctx.session = {
      userId: newId,
      username: username,
      nickname: nickname,
      permission: EUserPermission.normal,
      avatar: '',
      type,
      loginUa: ctx.request.headers['user-agent'] as string,
      loginIp: ctx.ip,
      loginAt: loginAt.toISOString(),
      lastAccessIp: ctx.ip,
      lastAccessAt: loginAt.toISOString(),
      contests: {},
      competitions: {},
    };
    this.service.updateUserLastStatus(newId, { lastIp: ctx.ip }).then(() => {
      this.service.clearDetailCache(newId);
    });
    return { userId: newId };
  }

  /**
   * 创建用户。
   *
   * 校验逻辑：
   * 1. 检查用户名、昵称、邮箱均不被占用
   * 2. 检查昵称是否可以通过文本内容检查
   * @returns 用户 ID
   */
  @route()
  @authPerm(EPerm.WriteUser)
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
      type,
    } = ctx.request.body as ICreateUserReq;
    if (await this.service.isUsernameExists(username)) {
      throw new ReqError(Codes.USER_USERNAME_EXISTS);
    } else if (await this.service.isNicknameExists(nickname)) {
      throw new ReqError(Codes.USER_NICKNAME_EXISTS);
    } else if (email && (await this.service.isEmailExists(email))) {
      throw new ReqError(Codes.USER_EMAIL_EXISTS);
    }
    // else if (!(await this.contentChecker.simpleCheck(nickname, 'nickname'))) {
    //   throw new ReqError(Codes.USER_NICKNAME_CONTAINS_ILLEGAL_CONTENT);
    // }
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
      type,
    });
    return { userId: newId };
  }

  /**
   * 批量创建用户。
   *
   * 校验逻辑：
   * 1. 检查用户名、昵称、邮箱均不被占用
   * 2. 如果有用户名被占用，且 conflict 为 upsert，则除 password 外字段覆盖更新
   */
  @route()
  @authPerm(EPerm.WriteUser)
  async [routesBe.batchCreateUsers.i](ctx: Context): Promise<void> {
    const { users, conflict } = ctx.request.body as IBatchCreateUsersReq;
    for (const user of users) {
      const {
        username,
        nickname,
        password,
        school,
        college,
        major,
        class: _class,
        grade,
        type,
      } = user;
      // if (!(await this.contentChecker.simpleCheck(nickname, 'nickname'))) {
      //   throw new ReqError(Codes.USER_NICKNAME_CONTAINS_ILLEGAL_CONTENT, {
      //     nickname,
      //   });
      // }
      if (await this.service.isUsernameExists(username)) {
        if (conflict === 'upsert') {
          // 覆盖更新
          const userInfo = await this.service.findOne(
            {
              username,
            },
            null,
          );
          if (userInfo) {
            if (userInfo.nickname !== nickname && (await this.service.isNicknameExists(nickname))) {
              continue;
            }
            await this.service.update(userInfo.userId, {
              nickname,
              school,
              college,
              major,
              class: _class,
              grade,
            });
            await this.service.clearDetailCache(userInfo.userId);
          }
        }
        continue;
      } else if (await this.service.isNicknameExists(nickname)) {
        continue;
      }
      // 创建用户
      await this.service.create({
        username,
        nickname,
        email: '',
        verified: false,
        password: this.utils.misc.hashPassword(password),
        school,
        college,
        major,
        class: _class,
        grade,
        type,
      });
    }
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
   * - username（当搜索条件中的 username 未完全与结果匹配时）
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
      if (!ctx.helper.checkPerms(EPerm.ReadUser)) {
        delete ctx.request.body.forbidden;
        delete ctx.request.body.permission;
        delete ctx.request.body.verified;
      }
    },
    afterGetList: (ctx) => {
      const list = ctx.list as IMUserServiceGetListRes;
      if (!ctx.helper.checkPerms(EPerm.ReadUser)) {
        list.rows.forEach((d) => {
          if (ctx.request.body.username !== d.username) {
            delete d.username;
          }
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
    const userId = ctx.id!;
    const detail = ctx.detail as IMUserDetail;
    const acceptedAndSubmittedCount = await this.service.getUserAcceptedAndSubmittedCount(userId);
    // @ts-ignore
    const detailResp = {
      ...detail,
      ...acceptedAndSubmittedCount,
    } as TreatDateFieldsAsString<typeof detail>;
    if (!ctx.helper.isSelf(userId) && !ctx.helper.checkPerms(EPerm.ReadUser)) {
      return this.lodash.omit(detailResp, [
        'username',
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
   * 权限：当前登录用户或相应权限
   *
   * 如果用户不是管理员，则无法更新以下字段：
   * - nickname
   * - forbidden
   * - permission
   */
  @route()
  @authPermOrRequireSelf(undefined, EPerm.WriteUser)
  @id()
  @getDetail(null)
  async [routesBe.updateUserDetail.i](ctx: Context): Promise<void> {
    const userId = ctx.id!;
    const req = ctx.request.body as IUpdateUserDetailReq;
    if (!ctx.helper.checkPerms(EPerm.WriteUser)) {
      delete req.nickname;
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
    const weak = WeakPasswordChecker.isWeak(password);
    if (weak) {
      throw new ReqError(Codes.USER_PASSWORD_STRENGTH_TOO_WEAK);
    }
    const verificationCode = await this.verificationService.getEmailVerificationCode(email);
    if (verificationCode?.code !== code) {
      throw new ReqError(Codes.USER_INCORRECT_VERIFICATION_CODE);
    }
    await this.service.update(user.userId, {
      password: this.utils.misc.hashPassword(password),
    });
    this.verificationService.deleteEmailVerificationCode(email);
    this.service.clearAllSessions(user.userId);
  }

  /**
   * 重置弱密码。
   *
   * 通过账号密码重置密码. 根据账号密码验证用户身份, 强要求绑定邮箱, 需要验证码有效.
   */
  @route()
  async [routesBe.resetUserPasswordAndEmail.i](ctx: Context): Promise<void> {
    const { username, oldPassword, email, code, password } = ctx.request
      .body as IResetUserPasswordAndEmailReq;
    const oldPass = this.utils.misc.hashPassword(oldPassword);
    const pass = this.utils.misc.hashPassword(password);
    const user = await this.service.findOne({
      username,
      password: oldPass,
    });
    if (!user) {
      throw new ReqError(Codes.USER_NOT_EXIST);
    }
    const verificationCode = await this.verificationService.getEmailVerificationCode(email);
    if (verificationCode?.code !== code) {
      throw new ReqError(Codes.USER_INCORRECT_VERIFICATION_CODE);
    }
    await this.service.update(user.userId, {
      password: pass,
      email,
      verified: true,
    });
    this.verificationService.deleteEmailVerificationCode(email);
    this.service.clearAllSessions(user.userId);
  }

  /**
   * 强制重置密码。
   */
  @route()
  @authPerm(EPerm.ResetUserPassword)
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
    const sImageInstance = this.sharp(image.filepath).resize(128);
    switch (this.staticPath.useCloud) {
      case 'cos': {
        await Promise.all([
          this.cosHelper.uploadFile(
            this.fs.createReadStream(image.filepath),
            path.join(this.staticPath.avatar, fullFileName),
          ),
          this.cosHelper.uploadFile(
            await sImageInstance.toBuffer(),
            path.join(this.staticPath.avatar, sFileName),
          ),
        ]);
        break;
      }
      default: {
        // 压缩并存储图片到本地
        await Promise.all([
          this.fs.copyFile(image.filepath, path.join(this.staticPath.avatar, fullFileName)),
          await sImageInstance.toFile(path.join(this.staticPath.avatar, sFileName)),
        ]);
        // 清除旧文件
        const { avatar: oldImage } = detail;
        if (oldImage) {
          await Promise.all([
            this.fs.remove(path.join(this.staticPath.avatar, oldImage)),
            this.fs.remove(path.join(this.staticPath.avatar, `s_${oldImage}`)),
          ]);
        }
      }
    }

    // 更新
    await this.service.update(userId, {
      avatar: saveName,
    });
    await this.service.clearDetailCache(userId);
    ctx.session.avatar = saveName;
    this.userAchievementService.addUserAchievementAndPush(userId, EAchievementKey.SetAvatar);
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

    switch (this.staticPath.useCloud) {
      case 'cos': {
        await Promise.all([
          this.cosHelper.uploadFile(
            this.fs.createReadStream(image.filepath),
            path.join(this.staticPath.bannerImage, fullFileName),
          ),
          this.cosHelper.uploadFile(
            await sImageInstance.toBuffer(),
            path.join(this.staticPath.bannerImage, sFileName),
          ),
          this.cosHelper.uploadFile(
            await minImageInstance.toBuffer(),
            path.join(this.staticPath.bannerImage, minFileName),
          ),
        ]);
        break;
      }
      default: {
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
      }
    }

    // 更新
    await this.service.update(userId, {
      bannerImage: saveName,
    });
    await this.service.clearDetailCache(userId);
    this.userAchievementService.addUserAchievementAndPush(userId, EAchievementKey.SetBannerImage);
  }

  /**
   * 获取用户的题目提交结果统计。
   *
   * 如传了 contestId/competitionId，则查找范围限定在指定比赛。
   * @returns 用户提交结果统计
   */
  @route()
  @id()
  async [routesBe.getUserProblemResultStats.i](ctx: Context) {
    const userId = ctx.id!;
    const { contestId, competitionId } = ctx.request.body;
    return this.solutionService.getUserProblemResultStats(userId, contestId, competitionId);
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

  /**
   * 获取当前 Session 列表。
   * @returns Session 列表。
   */
  @route()
  async [routesBe.getSessionList.i](ctx: Context): Promise<IGetSessionListResp> {
    if (!ctx.helper.isGlobalLoggedIn()) {
      return ctx.helper.formatFullList(0, []);
    }
    // @ts-ignore
    const currentSessionKey: string = ctx.session._sessCtx.externalKey;
    const sessionKeys = await ctx.helper.redisKeys(this.redisKey.session, [
      ctx.session.userId,
      '*',
    ]);
    const sessionList = (
      await Promise.all(
        sessionKeys.map((k) =>
          ctx.helper.redisGet(k).then((r) => ({
            ...r,
            sessionId: k.replace(/^session:\d+:/, ''),
            isCurrent: k === currentSessionKey,
          })),
        ),
      )
    ).filter((f) => f);
    sessionList.sort((a, b) => {
      return new Date(a.loginAt).getTime() - new Date(b.loginAt).getTime();
    });

    return ctx.helper.formatFullList(
      sessionList.length,
      sessionList.map((item) => ({
        sessionId: item.sessionId,
        isCurrent: item.isCurrent,
        loginUa: item.loginUa,
        loginIp: item.loginIp,
        loginAt: item.loginAt,
        lastAccessIp: item.lastAccessIp,
        lastAccessAt: item.lastAccessAt,
      })),
    );
  }

  /**
   * 清除指定 session。
   */
  @route()
  @login()
  async [routesBe.clearSession.i](ctx: Context): Promise<void> {
    const { sessionId } = ctx.request.body as IClearSessionReq;
    const userId = ctx.session.userId;
    const sessionKey = util.format(this.redisKey.session, userId, sessionId);
    // @ts-ignore
    const currentSessionKey: string = ctx.session._sessCtx.externalKey;
    if (sessionKey === currentSessionKey) {
      throw new ReqError(Codes.USER_CANNOT_CLEAR_CURRENT_SESSION);
    }
    const session = await ctx.helper.redisGet(sessionKey);
    if (session) {
      await ctx.helper.redisDel(sessionKey);
    }
  }

  /**
   * 获取在线活跃用户数。
   */
  @route()
  async [routesBe.getActiveUserCount.i](ctx: Context): Promise<IGetActiveUserCountResp> {
    const cached = await ctx.helper.redisGet(this.redisKey.activeUserCountStats);
    if (cached) {
      return cached;
    }
    const ACTIVE_TIME = 12 * 3600 * 1000;
    const sessionKeys = await ctx.helper.redisScan('session:*', [], 10000);
    const activeUserIdSet = new Set<number>();
    const pq = new this.PromiseQueue(100, Infinity);
    const queueTasks = sessionKeys.map((k) =>
      pq.add(async () => {
        const session = await ctx.helper.redisGet(k);
        if (
          session?.lastAccessAt &&
          Date.now() - new Date(session.lastAccessAt).getTime() <= ACTIVE_TIME
        ) {
          activeUserIdSet.add(session.userId);
        }
      }),
    );
    await Promise.all(queueTasks);
    await ctx.helper.redisSet(
      this.redisKey.activeUserCountStats,
      [],
      { count: activeUserIdSet.size },
      300,
    );
    return { count: activeUserIdSet.size };
  }

  /**
   * 获取全部有权限的用户及其权限列表。
   */
  @route()
  @authPerm(EPerm.ReadUserPermission)
  async [routesBe.getAllUserPermissionsMap.i](
    _ctx: Context,
  ): Promise<IGetAllUserPermissionsMapResp> {
    const map = await this.authService.getAllUserPermissionsMap();
    const userIds = Object.keys(map).map((userId) => +userId);
    const relativeUsers = await this.service.getRelative(userIds, null);
    return {
      count: userIds.length,
      rows: userIds.map((userId) => ({
        userId,
        username: relativeUsers[userId].username,
        nickname: relativeUsers[userId].nickname,
        avatar: relativeUsers[userId].avatar,
        permissions: map[userId],
      })),
    };
  }

  /**
   * 获取全部有权限的用户及其权限列表。
   */
  @route()
  @authPerm(EPerm.WriteUserPermission)
  async [routesBe.setUserPermissions.i](ctx: Context): Promise<void> {
    const { userId, permissions } = ctx.request.body as ISetUserPermissionsReq;
    await this.authService.setUserPermissions(userId, permissions as EPerm[]);
  }

  /**
   * 获取当前登录用户已达成成就列表。
   */
  @route()
  @login()
  async [routesBe.getSelfAchievedAchievements.i](
    ctx: Context,
  ): Promise<IGetSelfAchievedAchievementsResp> {
    const res = await this.userAchievementService.getUserAchievements(ctx.session.userId);
    return {
      count: res.length,
      // @ts-ignore
      rows: res.map((r) => this.lodash.omit(r, ['userAchievementId'])),
    };
  }

  /**
   * 确认成就已推送。
   */
  @route()
  @login()
  async [routesBe.confirmAchievementDeliveried.i](ctx: Context): Promise<void> {
    const { achievementKey } = ctx.request.body as IConfirmAchievementDeliveriedReq;
    const achieved = await this.userAchievementService.isAchievementAchieved(
      ctx.session.userId,
      achievementKey as EAchievementKey,
    );
    if (!achieved) {
      throw new ReqError(Codes.USER_ACHIEVEMENT_NOT_ACHIEVED);
    }
    await this.userAchievementService.confirmAchievementDeliveried(
      ctx.session.userId,
      achievementKey as EAchievementKey,
    );
  }

  /**
   * 确认领取成就。
   */
  @route()
  @login()
  async [routesBe.receiveAchievement.i](ctx: Context): Promise<void> {
    const { achievementKey } = ctx.request.body as IReceiveAchievementReq;
    const achieved = await this.userAchievementService.isAchievementAchieved(
      ctx.session.userId,
      achievementKey as EAchievementKey,
    );
    if (!achieved) {
      throw new ReqError(Codes.USER_ACHIEVEMENT_NOT_ACHIEVED);
    }
    await this.userAchievementService.receiveAchievement(
      ctx.session.userId,
      achievementKey as EAchievementKey,
    );
  }

  /**
   * 获取当前登录账号正式团队成员。
   */
  @route()
  @login()
  async [routesBe.getSelfOfficialMembers.i](ctx: Context): Promise<IGetSelfOfficialMembersResp> {
    const userId = ctx.session.userId;
    const detail = (await this.service.getDetail(userId, null))!;
    if (detail.type !== EUserType.team || detail.status !== EUserStatus.settled) {
      return {
        count: 0,
        rows: [],
      };
    }
    const members = await this.service.getMembers(userId);
    return {
      count: members.length,
      rows: (members as unknown) as TreatDateFieldsAsString<typeof members[0]>[],
    };
  }

  /**
   * 获取团队成员。
   */
  @route()
  @id()
  @getDetail()
  async [routesBe.getUserMembers.i](ctx: Context): Promise<IGetUserMembersResp> {
    const userId = ctx.id!;
    const detail = ctx.detail as IMUserDetail;
    const members = await this.service.getMembers(userId);
    const hasPermission =
      userId === ctx.session.userId ||
      ctx.helper.checkPerms(EPerm.ReadUser) ||
      members.some((m) => m.userId === ctx.session.userId);
    if (!hasPermission && detail.status !== EUserStatus.settled) {
      return {
        count: 0,
        rows: [],
      };
    }

    return {
      count: members.length,
      rows: (members as unknown) as TreatDateFieldsAsString<typeof members[0]>[],
    };
  }

  /**
   * 添加团队成员。
   */
  @route()
  @login()
  async [routesBe.addUserMember.i](ctx: Context): Promise<void> {
    const { memberUserId } = ctx.request.body as IAddUserMemberReq;
    const teamUserId = ctx.session.userId;
    const detail = (await this.service.getDetail(teamUserId, null))!;
    if (detail.type !== EUserType.team) {
      throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    }
    if (detail.status === EUserStatus.settled) {
      throw new ReqError(Codes.USER_TEAM_HAS_SETTLED);
    }
    const memberUserDetail = await this.service.getDetail(memberUserId, null);
    if (!memberUserDetail) {
      throw new ReqError(Codes.USER_NOT_EXIST);
    }
    if (memberUserDetail.type !== EUserType.personal) {
      throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    }
    const isExists = await this.service.isUserInTeam(teamUserId, memberUserId);
    if (isExists) {
      throw new ReqError(Codes.USER_EXISTS);
    }
    await this.service.addMember(teamUserId, memberUserId);
  }

  /**
   * 移除团队成员。
   */
  @route()
  @login()
  async [routesBe.removeUserMember.i](ctx: Context): Promise<void> {
    const { memberUserId } = ctx.request.body as IRemoveUserMemberReq;
    const teamUserId = ctx.session.userId;
    const detail = (await this.service.getDetail(teamUserId, null))!;
    if (detail.type !== EUserType.team) {
      throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    }
    if (detail.status === EUserStatus.settled) {
      throw new ReqError(Codes.USER_TEAM_HAS_SETTLED);
    }
    const memberUserDetail = await this.service.getDetail(memberUserId, null);
    if (!memberUserDetail) {
      throw new ReqError(Codes.USER_NOT_EXIST);
    }
    if (memberUserDetail.type !== EUserType.personal) {
      throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    }
    const isExists = await this.service.isUserInTeam(teamUserId, memberUserId);
    if (!isExists) {
      throw new ReqError(Codes.USER_NOT_EXIST);
    }
    await this.service.removeMember(teamUserId, memberUserId);
  }

  /**
   * 获取自己已加入团队列表。
   */
  @route()
  @login()
  async [routesBe.getSelfJoinedTeams.i](ctx: Context): Promise<IGetSelfJoinedTeamsResp> {
    const memberUserId = ctx.session.userId;
    const detail = await this.service.getDetail(memberUserId, null);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (detail.type !== EUserType.personal) {
      return {
        count: 0,
        rows: [],
      };
    }
    const selfTeams = await this.service.getUserTeams(memberUserId);
    const joinedTeams = selfTeams.filter((t) => t.selfMemberStatus === EUserMemberStatus.available);
    return {
      count: joinedTeams.length,
      rows: (joinedTeams as unknown) as TreatDateFieldsAsString<
        Omit<typeof joinedTeams[0], 'members'> & {
          members: TreatDateFieldsAsString<typeof joinedTeams[0]['members'][0]>[];
        }
      >[],
    };
  }

  /**
   * 确认加入团队。
   */
  @route()
  @login()
  async [routesBe.confirmJoinTeam.i](ctx: Context): Promise<void> {
    const { teamUserId } = ctx.request.body as IConfirmJoinTeamReq;
    const memberUserId = ctx.session.userId;
    const teamDetail = (await this.service.getDetail(teamUserId, null))!;
    if (!teamDetail || teamDetail.type !== EUserType.team) {
      throw new ReqError(Codes.USER_NOT_INVITED_TO_THIS_TEAM);
    }
    const memberUserDetail = (await this.service.getDetail(memberUserId, null))!;
    if (memberUserDetail.type !== EUserType.personal) {
      throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    }
    const members = await this.service.getMembersLite(teamUserId);
    const existed = members.find((m) => m.userId === memberUserId);
    if (!existed) {
      throw new ReqError(Codes.USER_NOT_INVITED_TO_THIS_TEAM);
    }
    if (existed.status === EUserMemberStatus.available) {
      throw new ReqError(Codes.USER_HAS_JOINED_TEAM);
    }
    await this.service.updateMemberStatus(teamUserId, memberUserId, EUserMemberStatus.available);
  }

  /**
   * 确认团队就绪锁定。
   */
  @route()
  @login()
  async [routesBe.confirmTeamSettlement.i](ctx: Context): Promise<void> {
    const teamUserId = ctx.session.userId;
    const detail = (await this.service.getDetail(teamUserId, null))!;
    if (detail.type !== EUserType.team) {
      throw new ReqError(Codes.GENERAL_ILLEGAL_REQUEST);
    }
    if (detail.status === EUserStatus.settled) {
      throw new ReqError(Codes.USER_TEAM_HAS_SETTLED);
    }
    const memberCount = await this.service.getTeamMemberCount(teamUserId);
    if (memberCount < 1) {
      throw new ReqError(Codes.USER_TEAM_NEED_AT_LEAST_ONE_MEMBER);
    }
    const areMembersReady = await this.service.areAllTeamMembersReady(teamUserId);
    if (!areMembersReady) {
      throw new ReqError(Codes.USER_TEAM_MEMBERS_ARE_NOT_READY);
    }
    await this.service.confirmTeamSettlement(teamUserId);
  }

  /**
   * 获取当前登录账号相关的指定静态存储对象。
   */
  @route()
  @login()
  async [routesBe.getSelfStaticObject.i](ctx: Context): Promise<IGetSelfStaticObjectResp> {
    const userId = ctx.session.userId;
    const { key } = ctx.request.body as IGetSelfStaticObjectReq;
    const object = await this.miscService.getStaticObject({ key, userId });
    if (!object) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    return (object as unknown) as TreatDateFieldsAsString<
      Omit<typeof object, 'userId'> & { userId: number }
    >;
  }
}
