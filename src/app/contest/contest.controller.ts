import { Context, controller, inject, provide, config } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
  login,
  authPerm,
  authPermOrRequireContestSession,
} from '@/lib/decorators/controller.decorator';
import { CContestMeta } from './contest.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CContestService } from './contest.service';
import { ILodash } from '@/utils/libs/lodash';
import { IMContestDetail, IMContestUserLite, IMContestUserDetail } from './contest.interface';
import {
  EContestType,
  EContestUserStatus,
  EUserPermission,
  EContestMode,
  EContestRatingStatus,
} from '@/common/enums';
import { Codes } from '@/common/codes';
import { ReqError } from '@/lib/global/error';
import {
  IRequestContestSessionReq,
  IGetContestSessionResp,
  ISetContestProblemConfigReq,
  IGetContestUserDetailReq,
  ICreateContestUserReq,
  ICreateContestUserResp,
  IUpdateContestUserReq,
  IAuditContestUserReq,
  IGetContestRanklistReq,
  IGetContestRanklistResp,
  IGetContestRatingStatusResp,
  IGetContestProblemSolutionStatsResp,
  ICreateContestReq,
  ICreateContestResp,
  IUpdateContestDetailReq,
  IBatchCreateContestUsersReq,
  IGetContestUsersReq,
  IGetContestProblemConfigResp,
} from '@/common/contracts/contest';
import { CMailSender } from '@/utils/mail';
import { CSolutionService } from '../solution/solution.service';
import { CMessageService } from '../message/message.service';
import { CUserService } from '../user/user.service';
import { IAppConfig } from '@/config/config.interface';
import { exec } from 'child_process';
import path from 'path';
import { CProblemService } from '../problem/problem.service';
import { EPerm } from '@/common/configs/perm.config';

@provide()
@controller('/')
export default class ContestController {
  @inject('contestMeta')
  meta: CContestMeta;

  @inject('contestService')
  service: CContestService;

  @inject()
  solutionService: CSolutionService;

  @inject()
  messageService: CMessageService;

  @inject()
  userService: CUserService;

  @inject()
  problemService: CProblemService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  mailSender: CMailSender;

  @config()
  siteTeam: string;

  @config('scripts')
  scriptsConfig: IAppConfig['scripts'];

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList: (ctx) => {
      !ctx.helper.checkPerms(EPerm.ReadContest) && delete ctx.request.body.hidden;
      if (ctx.request.body.joined) {
        ctx.request.body.userId = ctx.session.userId;
      }
    },
  })
  @respList()
  async [routesBe.getContestList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getContestSession.i](ctx: Context): Promise<IGetContestSessionResp> {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    if (ctx.helper.isContestLoggedIn(contestId)) {
      return ctx.helper.getContestSession(contestId)!;
    }
    // 搬运自 oj2 api-ng，如果是权限人士则认为任何比赛都有权限进入
    if (ctx.helper.checkPerms(EPerm.ContestAccess)) {
      const session = {
        userId: ctx.session.userId,
        username: ctx.session.username,
        nickname: ctx.session.nickname,
        permission: ctx.session.permission,
        avatar: ctx.session.avatar,
      };
      ctx.session.contests[contestId] = session;
      return session;
    }
    // 根据类型判断是否可以直接授予 session
    switch (detail.type) {
      case EContestType.public: {
        if (!ctx.loggedIn) {
          throw new ReqError(Codes.CONTEST_NEED_LOGIN_OJ);
        }
        const session = {
          userId: ctx.session.userId,
          username: ctx.session.username,
          nickname: ctx.session.nickname,
          permission: ctx.session.permission,
          avatar: ctx.session.avatar,
        };
        ctx.session.contests[contestId] = session;
        return session;
      }
      case EContestType.private: {
        if (!ctx.loggedIn) {
          throw new ReqError(Codes.CONTEST_NEED_LOGIN_OJ);
        }
        const userContests = await this.service.getUserContests(ctx.session.userId);
        if (userContests.rows.includes(contestId)) {
          const session = {
            userId: ctx.session.userId,
            username: ctx.session.username,
            nickname: ctx.session.nickname,
            permission: ctx.session.permission,
            avatar: ctx.session.avatar,
          };
          ctx.session.contests[contestId] = session;
          return session;
        }
        throw new ReqError(Codes.CONTEST_NEED_LOGIN_PRIVATE_CONTEST);
      }
      case EContestType.register: {
        if (ctx.loggedIn) {
          const userContests = await this.service.getUserContests(ctx.session.userId);
          if (userContests.rows.includes(contestId)) {
            // 参加过此个比赛，把 username 对应的比赛用户信息赋到 session
            const contestUser = await this.service.findOneContestUser(contestId, {
              username: ctx.session.username,
            });
            if (contestUser) {
              const session = {
                userId: contestUser.contestUserId,
                username: contestUser.username,
                nickname: contestUser.nickname,
                permission: ctx.session.permission,
                avatar: contestUser.avatar,
              };
              ctx.session.contests[contestId] = session;
              return session;
            }
          }
        }
        throw new ReqError(Codes.CONTEST_NEED_LOGIN_REGISTER_CONTEST);
      }
      default: {
        this.utils.misc.never(detail.type);
        break;
      }
    }
    return null;
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.requestContestSession.i](ctx: Context) {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    const { username, password } = ctx.request.body as IRequestContestSessionReq;
    switch (detail.type) {
      case EContestType.public: {
        if (!ctx.loggedIn) {
          throw new ReqError(Codes.CONTEST_NEED_LOGIN_OJ);
        }
        const session = {
          userId: ctx.session.userId,
          username: ctx.session.username,
          nickname: ctx.session.nickname,
          permission: ctx.session.permission,
          avatar: ctx.session.avatar,
        };
        ctx.session.contests[contestId] = session;
        return session;
      }
      case EContestType.private: {
        if (!ctx.loggedIn) {
          throw new ReqError(Codes.CONTEST_NEED_LOGIN_OJ);
        }
        const userContests = await this.service.getUserContests(ctx.session.userId);
        let approved = false;
        if (userContests.rows.includes(contestId)) {
          approved = true;
        } else if (password === detail.password) {
          this.service.addUserContest(ctx.session.userId, contestId).then(() => {
            this.service.clearUserContestsCache(ctx.session.userId);
          });
          approved = true;
        }
        if (approved) {
          const session = {
            userId: ctx.session.userId,
            username: ctx.session.username,
            nickname: ctx.session.nickname,
            permission: ctx.session.permission,
            avatar: ctx.session.avatar,
          };
          ctx.session.contests[contestId] = session;
          return session;
        }
        throw new ReqError(Codes.CONTEST_INCORRECT_PASSWORD);
      }
      case EContestType.register: {
        // 先尝试判断 user contests
        if (ctx.loggedIn) {
          const userContests = await this.service.getUserContests(ctx.session.userId);
          if (userContests.rows.includes(contestId)) {
            // 参加过此个比赛，把 username 对应的比赛用户信息赋到 session
            const contestUser = await this.service.findOneContestUser(contestId, {
              username: ctx.session.username,
            });
            if (contestUser) {
              const session = {
                userId: contestUser.contestUserId,
                username: contestUser.username,
                nickname: contestUser.nickname,
                permission: ctx.session.permission,
                avatar: contestUser.avatar,
              };
              ctx.session.contests[contestId] = session;
              return session;
            }
          }
        }
        // 再尝试根据用户名密码判断
        if (username && password) {
          const contestUser = await this.service.findOneContestUser(contestId, {
            username,
            password,
          });
          if (!contestUser) {
            throw new ReqError(Codes.CONTEST_INCORRECT_USERNAME_OR_PASSWORD);
          } else if (contestUser.status !== EContestUserStatus.accepted) {
            throw new ReqError(Codes.CONTEST_USER_NOT_ACCEPTED);
          }
          const session = {
            userId: contestUser.contestUserId,
            username: contestUser.username,
            nickname: contestUser.nickname,
            permission: EUserPermission.normal,
            avatar: contestUser.avatar,
          };
          if (ctx.session?.contests) {
            ctx.session.contests[contestId] = session;
          } else {
            // @ts-ignore
            ctx.session = {
              contests: {
                [contestId]: session,
              },
            };
          }
          return session;
        }
        throw new ReqError(Codes.CONTEST_INCORRECT_USERNAME_OR_PASSWORD);
      }
      default: {
        this.utils.misc.never(detail.type);
        return null;
      }
    }
  }

  @route()
  @id()
  async [routesBe.logoutContest.i](ctx: Context) {
    const contestId = ctx.id!;
    delete ctx.session.contests?.[contestId];
  }

  @route()
  @authPermOrRequireContestSession(undefined, EPerm.ReadContest)
  @id()
  @getDetail(null, {
    afterGetDetail: (ctx) => {
      if (!ctx.helper.checkPerms(EPerm.ReadContest)) {
        delete ctx.detail.password;
        if (ctx.helper.isContestPending(ctx.detail as IMContestDetail)) {
          delete ctx.detail.description;
        }
      }
    },
  })
  @respDetail()
  async [routesBe.getContestDetail.i](_ctx: Context) {}

  @route()
  @authPerm(EPerm.WriteContest)
  async [routesBe.createContest.i](ctx: Context): Promise<ICreateContestResp> {
    const data = ctx.request.body as ICreateContestReq;
    const newId = await this.service.create({
      ...data,
      author: ctx.session.userId,
    });
    return { contestId: newId };
  }

  @route()
  @authPerm(EPerm.WriteContest)
  @id()
  @getDetail(null)
  async [routesBe.updateContestDetail.i](ctx: Context): Promise<void> {
    const contestId = ctx.id!;
    const data = this.lodash.omit(ctx.request.body as IUpdateContestDetailReq, ['contestId']);
    await this.service.update(contestId, data);
    await this.service.clearDetailCache(contestId);
  }

  @route()
  @authPermOrRequireContestSession(undefined, [EPerm.ReadContestProblem, EPerm.ContestAccess])
  @id()
  @getDetail(null)
  async [routesBe.getContestProblems.i](ctx: Context) {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    if (!ctx.helper.checkPerms(EPerm.ReadContestProblem) && ctx.helper.isContestPending(detail)) {
      throw new ReqError(Codes.CONTEST_PENDING);
    }
    return this.service.getContestProblems(contestId);
  }

  @route()
  @authPerm(EPerm.ReadContestProblem)
  @id()
  @getDetail(null)
  async [routesBe.getContestProblemConfig.i](ctx: Context): Promise<IGetContestProblemConfigResp> {
    const contestId = ctx.id!;
    const list = await this.service.getContestProblemConfig(contestId);
    const problemIds = list.rows.map((d) => d.problemId);
    const relativeProblems = await this.problemService.getRelative(problemIds, null);
    return {
      count: list.count,
      rows: list.rows.map((d) => ({
        ...d,
        originalTitle: relativeProblems[d.problemId]?.title,
      })),
    };
  }

  @route()
  @authPerm(EPerm.WriteContestProblem)
  @id()
  @getDetail(null)
  async [routesBe.setContestProblemConfig.i](ctx: Context) {
    const contestId = ctx.id!;
    const { problems } = ctx.request.body as ISetContestProblemConfigReq;
    await this.service.setContestProblems(contestId, problems);
    await this.service.clearContestProblemsCache(contestId);
  }

  @route()
  @pagination()
  @id()
  @getDetail(null)
  async [routesBe.getContestUserList.i](ctx: Context) {
    const pagination = ctx.pagination!;
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    // @ts-ignore
    const list = await this.service.getContestUserList(contestId, ctx.request.body, pagination);
    const rows = list.rows;
    if (detail.team === false) {
      // 非团队类型，删除多余成员
      rows.forEach((d: IMContestUserLite) => {
        d.members = d.members.slice(0, 1);
      });
    }
    return ctx.helper.formatList(pagination.page, pagination.limit, list.count, list.rows);
  }

  @route()
  @authPerm(EPerm.ReadContestUser)
  @id()
  @getDetail(null)
  async [routesBe.getContestUsers.i](ctx: Context) {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    const { status } = ctx.request.body as IGetContestUsersReq;
    const list = await this.service.getContestUsers(contestId, { status });
    const rows = list.rows;
    if (detail.team === false) {
      // 非团队类型，删除多余成员
      rows.forEach((d: IMContestUserDetail) => {
        d.members = d.members.slice(0, 1);
      });
    }
    return list;
  }

  @route()
  @login()
  async [routesBe.getContestUserDetail.i](ctx: Context) {
    const { contestUserId } = ctx.request.body as IGetContestUserDetailReq;
    const detail = await this.service.getContestUserDetail(contestUserId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (!ctx.helper.checkPerms(EPerm.ReadContestUser) && ctx.session.username !== detail.username) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    const contestDetail = await this.service.getDetail(detail.contestId, null);
    if (contestDetail?.team === false) {
      // 非团队类型，删除多余成员
      detail.members = detail.members.slice(0, 1);
    }
    return detail;
  }

  @route()
  @login()
  @id()
  @getDetail(null)
  async [routesBe.createContestUser.i](ctx: Context): Promise<ICreateContestUserResp> {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    const data = ctx.request.body as ICreateContestUserReq;
    const username =
      (ctx.helper.checkPerms(EPerm.WriteContestUser) && data.username) || ctx.session.username;
    if (!ctx.helper.checkPerms(EPerm.WriteContestUser)) {
      delete data.status;
    }
    if (detail.type !== EContestType.register) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_OPEN);
    }
    const now = new Date();
    if (
      !ctx.helper.checkPerms(EPerm.WriteContestUser) &&
      (!detail?.registerStartAt ||
        !detail?.registerEndAt ||
        !(now >= detail.registerStartAt && now < detail.registerEndAt))
    ) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_IN_PROGRESS);
    }
    const exists = await this.service.isContestUserExists(contestId, {
      username,
    });
    if (exists) {
      throw new ReqError(Codes.CONTEST_REGISTERED);
    }
    const newId = await this.service.createContestUser(contestId, {
      ...this.lodash.omit(data, ['contestId', 'username']),
      username,
    });
    return { contestUserId: newId };
  }

  @route()
  @authPerm(EPerm.WriteContestUser)
  @id()
  @getDetail(null)
  async [routesBe.batchCreateContestUsers.i](ctx: Context): Promise<void> {
    const contestId = ctx.id!;
    const { users, conflict } = ctx.request.body as IBatchCreateContestUsersReq;
    for (const user of users) {
      const { username } = user;
      const userInfo = await this.service.findOneContestUser(contestId, { username });
      if (userInfo) {
        if (conflict === 'upsert') {
          // 覆盖更新
          await this.service.updateContestUser(userInfo.contestUserId, {
            ...this.lodash.omit(user, ['username']),
            status: user.status ?? EContestUserStatus.accepted,
          });
          await this.service.clearContestUserDetailCache(userInfo.contestUserId);
        }
        continue;
      }
      // 创建用户
      await this.service.createContestUser(contestId, {
        ...user,
        password: user.password || this.utils.misc.randomString({ length: 8, type: 'numeric' }),
        status: user.status ?? EContestUserStatus.accepted,
      });
    }
  }

  @route()
  @login()
  @id()
  @getDetail(null)
  async [routesBe.updateContestUser.i](ctx: Context): Promise<void> {
    const detail = ctx.detail as IMContestDetail;
    const data = ctx.request.body as IUpdateContestUserReq;
    const { contestUserId } = data;
    if (!ctx.helper.checkPerms(EPerm.WriteContestUser)) {
      data.status = EContestUserStatus.waiting;
    }
    if (detail.type !== EContestType.register) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_OPEN);
    }
    const now = new Date();
    if (
      !ctx.helper.checkPerms(EPerm.WriteContestUser) &&
      (!detail?.registerStartAt ||
        !detail?.registerEndAt ||
        !(now >= detail.registerStartAt && now < detail.registerEndAt))
    ) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_IN_PROGRESS);
    }
    const username = ctx.session.username;
    const contestUser = await this.service.getContestUserDetail(contestUserId);
    if (!contestUser) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (!ctx.helper.checkPerms(EPerm.WriteContestUser) && username !== contestUser.username) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    await this.service.updateContestUser(
      contestUserId,
      this.lodash.omit(data, ['contestId', 'contestUserId']),
    );
    await this.service.clearContestUserDetailCache(contestUserId);
  }

  @route()
  @authPerm(EPerm.AuditContestUser)
  @id()
  @getDetail(null)
  async [routesBe.auditContestUser.i](ctx: Context): Promise<void> {
    const detail = ctx.detail as IMContestDetail;
    const data = ctx.request.body as IAuditContestUserReq;
    const { contestUserId, status, reason } = data;
    if (
      ![
        EContestUserStatus.accepted,
        EContestUserStatus.return,
        EContestUserStatus.rejected,
      ].includes(status)
    ) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    const contestUser = await this.service.getContestUserDetail(contestUserId);
    if (!contestUser) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    await this.service.updateContestUser(contestUserId, {
      status,
    });
    await this.service.clearContestUserDetailCache(contestUserId);

    let auditMessage = '';
    switch (status) {
      case EContestUserStatus.accepted:
        auditMessage = '<strong>accepted</strong>';
        break;
      case EContestUserStatus.return:
        auditMessage = '<strong>waiting for further modification</strong>';
        break;
      case EContestUserStatus.rejected:
        auditMessage = '<strong>rejected</strong>';
        break;
      default:
        auditMessage = '?';
    }
    if (reason) {
      auditMessage += ` with reason "${reason}"`;
    }
    const subject = 'Your Contest Registration Result';
    const content = `<p>Dear User:</p>
<p>Thanks for registering contest "${detail.title}". Your registration is ${auditMessage}.</p>
<p>You can review or update your information in contest registration list.</p>
<p><br/></p>
<p>${this.siteTeam}</p>`;
    // 发送邮件通知
    const email = contestUser.members[0]?.email;
    email && this.mailSender.singleSend(email, subject, content);
    // 发送站内信
    this.userService.findOne({ username: contestUser.username }).then((user) => {
      user && this.messageService.sendSystemMessage(user.userId, subject, content);
    });
  }

  @route()
  @id()
  @getDetail(null)
  @authPermOrRequireContestSession(undefined, EPerm.ContestAccess)
  async [routesBe.getContestProblemSolutionStats.i](
    ctx: Context,
  ): Promise<IGetContestProblemSolutionStatsResp> {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    const problems = await this.service.getContestProblems(contestId);
    const problemIds = problems.rows.map((problem) => problem.problemId);
    const useFrozen = !detail.ended && !ctx.helper.checkPerms(EPerm.ContestAccess);
    return this.solutionService.getContestProblemSolutionStats(contestId, problemIds, useFrozen);
  }

  @route()
  @id()
  @getDetail(null)
  @authPermOrRequireContestSession(undefined, EPerm.ContestAccess)
  async [routesBe.getContestRanklist.i](ctx: Context): Promise<IGetContestRanklistResp> {
    const detail = ctx.detail as IMContestDetail;
    let { god = false } = ctx.request.body as IGetContestRanklistReq;
    if (!ctx.helper.checkPerms(EPerm.ContestAccess)) {
      god = false;
    }
    return this.service.getRanklist(detail, god);
  }

  @route()
  @id()
  @getDetail(null)
  @authPermOrRequireContestSession(undefined, EPerm.ContestAccess)
  async [routesBe.getContestRatingStatus.i](ctx: Context): Promise<IGetContestRatingStatusResp> {
    const contestId = ctx.id!;
    const status = await this.service.getRatingStatus(contestId);
    if (!status) {
      throw new ReqError(Codes.CONTEST_NOT_ENDED);
    }
    return status;
  }

  @route()
  @authPerm(EPerm.EndContest)
  @id()
  @getDetail(null)
  async [routesBe.endContest.i](ctx: Context): Promise<void> {
    const contestId = ctx.id!;
    const contest = ctx.detail as IMContestDetail;
    if (!ctx.helper.isContestEnded(contest)) {
      throw new ReqError(Codes.CONTEST_NOT_ENDED);
    } else if (contest.ended) {
      throw new ReqError(Codes.CONTEST_ENDED);
    }
    // 根据比赛类型判断相应处理逻辑
    switch (contest.type) {
      // TODO 比赛结束后更新用户比赛
      case EContestType.register:
        break;
    }
    // 根据比赛模式判断相应处理逻辑
    switch (contest.mode) {
      case EContestMode.rating: {
        if (!this.scriptsConfig?.dirPath || !this.scriptsConfig?.logPath) {
          throw new Error('ConfigNotFoundError: scripts');
        }
        const ranklist = (await this.service.getRanklist(contest, true)).rows;
        const contestUsernames = ranklist.map((row) => row.user.username);
        const userIdMap = await this.userService.getUserIdsByUsernames(contestUsernames);
        const rankData = ranklist.map((row) => ({
          rank: row.rank,
          userId: userIdMap[row.user.username],
          username: row.user.username,
          contestUserId: row.user.userId,
        }));
        await Promise.all([
          this.service.setRankData(contestId, rankData),
          this.service.setRatingStatus(contestId, {
            status: EContestRatingStatus.PD,
            progress: 0,
          }),
        ]);
        // 调用 calRating 脚本
        const cmd = `nohup node ${path.join(
          this.scriptsConfig.dirPath,
          'calRating.js',
        )} contest ${contestId} 2>&1 &`;
        ctx.logger.info('exec:', cmd);
        exec(cmd);
        break;
      }
    }
    await this.service.update(contestId, {
      ended: true,
    });
    await Promise.all([
      this.service.clearDetailCache(contestId),
      this.service.clearContestRanklistCache(contestId),
      this.solutionService.clearContestProblemSolutionStatsCache(contestId),
    ]);
  }
}
