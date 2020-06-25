import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
  authOrRequireContestSession,
} from '@/lib/decorators/controller.decorator';
import { CContestMeta } from './contest.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CContestService } from './contest.service';
import { ILodash } from '@/utils/libs/lodash';
import { IMContestDetail } from './contest.interface';
import { EContestType } from '@/common/enums';
import { Codes } from '@/common/codes';
import { ReqError } from '@/lib/global/error';
import { IRequestContestSessionReq, IGetContestSessionResp } from '@/common/contracts/contest';

@provide()
@controller('/')
export default class ContestController {
  @inject('contestMeta')
  meta: CContestMeta;

  @inject('contestService')
  service: CContestService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

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
  @getDetail()
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
        // TODO 注册比赛
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
  @getDetail()
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
        throw new ReqError(Codes.CONTESTS_INCORRECT_PASSWORD);
      }
      case EContestType.register: {
        // TODO 注册比赛
        return null;
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
  @getDetail(undefined, {
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
}
