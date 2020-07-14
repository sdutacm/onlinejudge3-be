import { Context, controller, inject, provide, config } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
  authOrRequireContestSession,
  auth,
  login,
} from '@/lib/decorators/controller.decorator';
import { CContestMeta } from './contest.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CContestService } from './contest.service';
import { ILodash } from '@/utils/libs/lodash';
import { IMContestDetail } from './contest.interface';
import { EContestType, EContestUserStatus, EUserPermission } from '@/common/enums';
import { Codes } from '@/common/codes';
import { ReqError } from '@/lib/global/error';
import {
  IRequestContestSessionReq,
  IGetContestSessionResp,
  ISetContestProblemsReq,
  IGetContestUserDetailReq,
  ICreateContestUserReq,
  ICreateContestUserResp,
  IUpdateContestUserReq,
  IAuditContestUserReq,
  IGetContestRanklistReq,
  IGetContestRanklistResp,
  IGetContestRatingStatusResp,
  IGetContestProblemSolutionStatsResp,
} from '@/common/contracts/contest';
import { CMailSender } from '@/utils/mail';
import { CSolutionService } from '../solution/solution.service';
import { CMessageService } from '../message/message.service';
import { CUserService } from '../user/user.service';

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
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  mailSender: CMailSender;

  @config()
  siteTeam: string;

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList: (ctx) => {
      !ctx.isAdmin && delete ctx.request.body.hidden;
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
    if (!ctx.loggedIn) {
      return null;
    }
    if (ctx.helper.isContestLoggedIn(contestId)) {
      return ctx.helper.getContestSession(contestId)!;
    }
    // 搬运自 oj2 api-ng，如果是权限人士则认为任何比赛都有权限进入
    if (ctx.helper.isPerm()) {
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
          break;
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
          break;
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
        break;
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
        break;
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
          throw new ReqError(Codes.GENERAL_NOT_LOGGED_IN);
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
          throw new ReqError(Codes.GENERAL_NOT_LOGGED_IN);
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
          }
          const session = {
            userId: contestUser.contestUserId,
            username: contestUser.username,
            nickname: contestUser.nickname,
            permission: EUserPermission.normal,
            avatar: contestUser.avatar,
          };
          ctx.session.contests[contestId] = session;
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
  @authOrRequireContestSession('admin')
  @id()
  @getDetail(null, {
    afterGetDetail: (ctx) => {
      if (ctx.isAdmin) {
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
  @authOrRequireContestSession('admin')
  @id()
  @getDetail(null)
  async [routesBe.getContestProblems.i](ctx: Context) {
    const contestId = ctx.id!;
    const detail = ctx.detail as IMContestDetail;
    if (!ctx.isAdmin && ctx.helper.isContestPending(detail)) {
      throw new ReqError(Codes.CONTEST_PENDING);
    }
    return this.service.getContestProblems(contestId);
  }

  @route()
  @auth('admin')
  @id()
  @getDetail(null)
  async [routesBe.setContestProblems.i](ctx: Context) {
    const contestId = ctx.id!;
    const { problems } = ctx.request.body as ISetContestProblemsReq;
    await this.service.setContestProblems(contestId, problems);
    await this.service.clearContestProblemsCache(contestId);
  }

  @route()
  @pagination()
  @id()
  async [routesBe.getContestUserList.i](ctx: Context) {
    const pagination = ctx.pagination!;
    const contestId = ctx.id!;
    // @ts-ignore
    const list = await this.service.getContestUserList(contestId, ctx.request.body, pagination);
    return ctx.helper.formatList(pagination.page, pagination.limit, list.count, list.rows);
  }

  @route()
  @login()
  async [routesBe.getContestUserDetail.i](ctx: Context) {
    const { contestUserId } = ctx.request.body as IGetContestUserDetailReq;
    const detail = await this.service.getContestUserDetail(contestUserId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (!ctx.isAdmin && ctx.session.username !== detail.username) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
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
    if (!ctx.isAdmin) {
      delete data.status;
    }
    if (detail.type !== EContestType.register) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_OPEN);
    }
    const now = new Date();
    if (
      !detail?.registerStartAt ||
      !detail?.registerEndAt ||
      !(now >= detail.registerStartAt && now < detail.registerEndAt)
    ) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_IN_PROGRESS);
    }
    const username = ctx.session.username;
    const exists = await this.service.isContestUserExists(contestId, {
      username,
    });
    if (exists) {
      throw new ReqError(Codes.CONTEST_REGISTERED);
    }
    const newId = await this.service.createContestUser(contestId, {
      ...this.lodash.omit(data, ['contestId']),
      username,
    });
    return { contestUserId: newId };
  }

  @route()
  @login()
  @id()
  @getDetail(null)
  async [routesBe.updateContestUser.i](ctx: Context): Promise<void> {
    const detail = ctx.detail as IMContestDetail;
    const data = ctx.request.body as IUpdateContestUserReq;
    const { contestUserId } = data;
    if (!ctx.isAdmin) {
      delete data.status;
    }
    if (detail.type !== EContestType.register) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_OPEN);
    }
    const now = new Date();
    if (
      !detail?.registerStartAt ||
      !detail?.registerEndAt ||
      !(now >= detail.registerStartAt && now < detail.registerEndAt)
    ) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_IN_PROGRESS);
    }
    const username = ctx.session.username;
    const contestUser = await this.service.getContestUserDetail(contestUserId);
    if (!contestUser) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (!ctx.isAdmin && username !== contestUser.username) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    await this.service.updateContestUser(
      contestUserId,
      this.lodash.omit(data, ['contestId', 'contestUserId']),
    );
    await this.service.clearContestUserDetailCache(contestUserId);
  }

  @route()
  @auth('admin')
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
<p>Thanks for registering contesst "${detail.title}". Your registration is ${auditMessage}.</p>
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
  @authOrRequireContestSession('perm')
  async [routesBe.getContestProblemSolutionStats.i](
    ctx: Context,
  ): Promise<IGetContestProblemSolutionStatsResp> {
    const contestId = ctx.id!;
    const problems = await this.service.getContestProblems(contestId);
    const problemIds = problems.rows.map((problem) => problem.problemId);
    return this.solutionService.getContestProblemSolutionStats(contestId, problemIds);
  }

  @route()
  @id()
  @getDetail(null)
  @authOrRequireContestSession('perm')
  async [routesBe.getContestRanklist.i](ctx: Context): Promise<IGetContestRanklistResp> {
    const detail = ctx.detail as IMContestDetail;
    let { god = false } = ctx.request.body as IGetContestRanklistReq;
    if (!ctx.isPerm) {
      god = false;
    }
    return this.service.getRanklist(detail, god);
  }

  @route()
  @id()
  @getDetail(null)
  @authOrRequireContestSession('perm')
  async [routesBe.getContestRatingStatus.i](ctx: Context): Promise<IGetContestRatingStatusResp> {
    const contestId = ctx.id!;
    return this.service.getRatingStatus(contestId);
  }
}
