import { Context, controller, inject, provide, config } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
  authCompetitionRole,
  login,
} from '@/lib/decorators/controller.decorator';
import { CCompetitionMeta } from './competition.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CCompetitionService } from './competition.service';
import { ILodash } from '@/utils/libs/lodash';
import {
  IMCompetitionDetail,
  IMCompetitionUserLite,
  IMCompetitionUserDetail,
} from './competition.interface';
import { Codes } from '@/common/codes';
import { ReqError } from '@/lib/global/error';
import { CMailSender } from '@/utils/mail';
import { CSolutionService } from '../solution/solution.service';
import { CMessageService } from '../message/message.service';
import { CUserService } from '../user/user.service';
import { IAppConfig } from '@/config/config.interface';
import { CProblemService } from '../problem/problem.service';
import { EPerm } from '@/common/configs/perm.config';
import {
  IGetCompetitionSessionResp,
  ILoginCompetitionReq,
  ILoginCompetitionResp,
  IGetCompetitionUsersReq,
  IGetCompetitionUserDetailReq,
  IGetPublicCompetitionParticipantDetailReq,
  ISignUpCompetitionParticipantReq,
} from '@/common/contracts/competition';
import { ECompetitionUserStatus, ECompetitionUserRole } from '@/common/enums';
import { CCompetitionLogService } from './competitionLog.service';
import { ECompetitionLogAction } from './competition.enum';

@provide()
@controller('/')
export default class CompetitionController {
  @inject('competitionMeta')
  meta: CCompetitionMeta;

  @inject('competitionService')
  service: CCompetitionService;

  @inject()
  solutionService: CSolutionService;

  @inject()
  messageService: CMessageService;

  @inject()
  userService: CUserService;

  @inject()
  problemService: CProblemService;

  @inject()
  competitionLogService: CCompetitionLogService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  mailSender: CMailSender;

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList: (ctx) => {
      // !ctx.helper.checkPerms(EPerm.ReadCompetition) && delete ctx.request.body.hidden;
    },
  })
  @respList()
  async [routesBe.getCompetitionList.i](_ctx: Context) {}

  @route()
  @id()
  // @getDetail(null)
  async [routesBe.getCompetitionSession.i](ctx: Context): Promise<IGetCompetitionSessionResp> {
    const competitionId = ctx.id!;
    if (ctx.helper.isCompetitionLoggedIn(competitionId)) {
      return ctx.helper.getCompetitionSession(competitionId)!;
    }
    // 可以靠 OJ 登录态直接换取比赛登录态的情形
    if (ctx.helper.isGlobalLoggedIn()) {
      const competitionUser = await this.service.getCompetitionUserDetail(
        competitionId,
        ctx.session.userId,
      );
      if (!competitionUser) {
        return null;
      }
      // 允许管理员、审核员凭借 OJ 登录态免密登录
      if (
        [ECompetitionUserRole.admin, ECompetitionUserRole.auditor].includes(competitionUser.role)
      ) {
        const session = {
          userId: competitionUser.userId,
          nickname: competitionUser.info?.nickname || '',
          subname: competitionUser.info?.subname || '',
          role: competitionUser.role,
        };
        if (ctx.session?.competitions) {
          ctx.session.competitions[competitionId] = session;
        } else {
          // @ts-ignore
          ctx.session = {
            competitions: {
              [competitionId]: session,
            },
          };
        }
        return session;
      }
    }
    return null;
  }

  @route()
  @id()
  // @getDetail(null)
  async [routesBe.loginCompetition.i](ctx: Context): Promise<ILoginCompetitionResp> {
    const competitionId = ctx.id!;
    const { userId, password } = ctx.request.body as ILoginCompetitionReq;
    const competitionUser = await this.service.findOneCompetitionUser(competitionId, {
      userId,
      password,
    });
    if (!competitionUser) {
      throw new ReqError(Codes.COMPETITION_INCORRECT_PASSWORD);
    } else if (competitionUser.status === ECompetitionUserStatus.quitted) {
      throw new ReqError(Codes.COMPETITION_USER_QUITTED);
    } else if (
      ![ECompetitionUserStatus.available, ECompetitionUserStatus.entered].includes(
        competitionUser.status,
      )
    ) {
      throw new ReqError(Codes.COMPETITION_USER_STATUS_CANNOT_ACCESS);
    }
    if (competitionUser.role === ECompetitionUserRole.participant) {
      await this.service.updateCompetitionUser(competitionId, userId, {
        password: null,
      });
      await this.service.clearCompetitionUserDetailCache(competitionId, userId);
    }
    const session = {
      userId: competitionUser.userId,
      nickname: competitionUser.info?.nickname || '',
      subname: competitionUser.info?.subname || '',
      role: competitionUser.role,
    };
    if (ctx.session?.competitions) {
      ctx.session.competitions[competitionId] = session;
    } else {
      // @ts-ignore
      ctx.session = {
        competitions: {
          [competitionId]: session,
        },
      };
    }
    this.competitionLogService.log(competitionId, ECompetitionLogAction.Login);
    return session;
  }

  @route()
  @id()
  async [routesBe.logoutCompetition.i](ctx: Context) {
    const competitionId = ctx.id!;
    await this.competitionLogService.log(competitionId, ECompetitionLogAction.Logout);
    delete ctx.session.competitions?.[competitionId];
  }

  @route()
  @id()
  @getDetail(null, {
    afterGetDetail: (ctx) => {},
  })
  @respDetail()
  async [routesBe.getCompetitionDetail.i](_ctx: Context) {}

  // @route()
  // @authPerm(EPerm.WriteCompetition)
  // async [routesBe.createCompetition.i](ctx: Context): Promise<ICreateCompetitionResp> {
  //   const data = ctx.request.body as ICreateCompetitionReq;
  //   const newId = await this.service.create({
  //     ...data,
  //     author: ctx.session.userId,
  //   });
  //   return { competitionId: newId };
  // }

  // @route()
  // @authPerm(EPerm.WriteCompetition)
  // @id()
  // @getDetail(null)
  // async [routesBe.updateCompetitionDetail.i](ctx: Context): Promise<void> {
  //   const competitionId = ctx.id!;
  //   const data = this.lodash.omit(ctx.request.body as IUpdateCompetitionDetailReq, ['competitionId']);
  //   await this.service.update(competitionId, data);
  //   await this.service.clearDetailCache(competitionId);
  // }

  @route()
  @id()
  @getDetail(null)
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.auditor,
  ])
  async [routesBe.getCompetitionUsers.i](ctx: Context) {
    const competitionId = ctx.id!;
    const req = ctx.request.body as IGetCompetitionUsersReq;
    const list = await this.service.getCompetitionUsers(competitionId);
    return {
      ...list,
      rows: list.rows.filter((user) => {
        if (req.role !== undefined && user.role !== req.role) {
          return false;
        }
        if (req.status !== undefined && user.status !== req.status) {
          return false;
        }
        if (req.fieldShortName !== undefined && user.fieldShortName !== req.fieldShortName) {
          return false;
        }
        if (req.seatNo !== undefined && user.seatNo !== req.seatNo) {
          return false;
        }
        if (req.banned !== undefined && user.banned !== req.banned) {
          return false;
        }
        return true;
      }),
    };
  }

  @route()
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.auditor,
  ])
  async [routesBe.getCompetitionUserDetail.i](ctx: Context) {
    const { competitionId, userId } = ctx.request.body as IGetCompetitionUserDetailReq;
    const detail = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (!ctx.helper.checkCompetitionRole(competitionId, [ECompetitionUserRole.admin])) {
      delete detail.password;
    }
    return detail;
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getPublicCompetitionParticipants.i](ctx: Context) {
    const competitionId = ctx.id!;
    const list = await this.service.getCompetitionUsers(competitionId);
    const filtered = list.rows.filter(
      (user) =>
        user.role === ECompetitionUserRole.participant &&
        [
          ECompetitionUserStatus.available,
          ECompetitionUserStatus.entered,
          ECompetitionUserStatus.quitted,
        ].includes(user.status),
    );
    return {
      count: filtered.length,
      rows: filtered.map((user) => {
        const u = { ...user };
        if (u.info) {
          delete u.info.schoolNo;
          delete u.info.tel;
          delete u.info.qq;
          delete u.info.weChat;
          delete u.info.clothing;
        }
        return u;
      }),
    };
  }

  @route()
  async [routesBe.getPublicCompetitionParticipantDetail.i](ctx: Context) {
    const { competitionId, userId } = ctx.request.body as IGetPublicCompetitionParticipantDetailReq;
    const detail = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (
      !detail ||
      detail.role !== ECompetitionUserRole.participant ||
      ![
        ECompetitionUserStatus.available,
        ECompetitionUserStatus.entered,
        ECompetitionUserStatus.quitted,
      ].includes(detail.status)
    ) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    const u = { ...detail };
    delete u.password;
    if (u.info) {
      delete u.info.schoolNo;
      delete u.info.tel;
      delete u.info.qq;
      delete u.info.weChat;
      delete u.info.clothing;
    }
    return u;
  }

  @route()
  async [routesBe.requestCompetitionParticipantPassword.i](ctx: Context) {
    const { competitionId, userId } = ctx.request.body as IGetPublicCompetitionParticipantDetailReq;
    const detail = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (
      !detail ||
      detail.role !== ECompetitionUserRole.participant ||
      ![
        ECompetitionUserStatus.available,
        ECompetitionUserStatus.entered,
        ECompetitionUserStatus.quitted,
      ].includes(detail.status)
    ) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (detail.status === ECompetitionUserStatus.quitted) {
      throw new ReqError(Codes.COMPETITION_USER_QUITTED);
    }
    let password = detail.password;
    if (!detail.password) {
      password = this.utils.misc.randomString({
        length: 6,
        characters: 'ABCDEFGHJKLMNPQRTUVWXY346789',
      });
      await this.service.updateCompetitionUser(competitionId, userId, {
        password,
      });
      await this.service.clearCompetitionUserDetailCache(competitionId, userId);
    }
    return {
      password,
    };
  }

  @route()
  @login()
  @id()
  @getDetail(null)
  async [routesBe.getSignedUpCompetitionParticipant.i](ctx: Context) {
    const competitionId = ctx.id!;
    const userId = ctx.session.userId;
    const user = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!user) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (user.role !== ECompetitionUserRole.participant) {
      throw new ReqError(Codes.COMPETITION_ALREADY_BEEN_A_USER);
    }
    return {
      competitionId,
      userId,
      status: user.status,
      unofficialParticipation: user.unofficialParticipation,
      info: user.info,
      createdAt: user.createdAt,
    };
  }

  @route()
  @login()
  @id()
  @getDetail(null)
  async [routesBe.signUpCompetitionParticipant.i](ctx: Context) {
    const competitionId = ctx.id!;
    const detail = ctx.detail! as IMCompetitionDetail;
    const now = new Date();
    if (
      !detail.registerStartAt ||
      !detail.registerEndAt ||
      !(now >= detail.registerStartAt && now < detail.registerEndAt)
    ) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_IN_PROGRESS);
    }
    const userId = ctx.session.userId;
    const { unofficialParticipation, info } = ctx.request.body as ISignUpCompetitionParticipantReq;
    const user = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (user) {
      if (user.role === ECompetitionUserRole.participant) {
        throw new ReqError(Codes.COMPETITION_ALREADY_SIGNED_UP_AS_A_PARTICIPANT);
      } else {
        throw new ReqError(Codes.COMPETITION_ALREADY_BEEN_A_USER);
      }
    }
    await this.service.createCompetitionUser(competitionId, userId, {
      role: ECompetitionUserRole.participant,
      status: ECompetitionUserStatus.auditing,
      info,
      unofficialParticipation,
    });
  }

  @route()
  @login()
  @id()
  @getDetail(null)
  async [routesBe.modifySignedUpCompetitionParticipant.i](ctx: Context) {
    const competitionId = ctx.id!;
    const detail = ctx.detail! as IMCompetitionDetail;
    const now = new Date();
    if (
      !detail.registerStartAt ||
      !detail.registerEndAt ||
      !(now >= detail.registerStartAt && now < detail.registerEndAt)
    ) {
      throw new ReqError(Codes.CONTEST_REGISTER_NOT_IN_PROGRESS);
    }
    const userId = ctx.session.userId;
    const { unofficialParticipation, info } = ctx.request.body as ISignUpCompetitionParticipantReq;
    const user = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!user) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (user.role !== ECompetitionUserRole.participant) {
      throw new ReqError(Codes.COMPETITION_ALREADY_BEEN_A_USER);
    }
    if (
      [
        ECompetitionUserStatus.rejected,
        ECompetitionUserStatus.entered,
        ECompetitionUserStatus.quitted,
      ].includes(user.status)
    ) {
      throw new ReqError(Codes.COMPETITION_CANNOT_MODIFY_SELF_PARTICIPANT);
    }
    await this.service.updateCompetitionUser(competitionId, userId, {
      status: ECompetitionUserStatus.auditing,
      info,
      unofficialParticipation,
    });
    await Promise.all([
      this.service.clearCompetitionUserDetailCache(competitionId, userId),
      this.service.clearCompetitionUsersCache(competitionId),
    ]);
  }
}
