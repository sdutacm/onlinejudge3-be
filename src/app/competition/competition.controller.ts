import { Context, controller, inject, provide, config } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
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
} from '@/common/contracts/competition';
import { ECompetitionUserStatus, ECompetitionUserRole } from '@/common/enums';

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
  @getDetail(null)
  async [routesBe.getCompetitionSession.i](ctx: Context): Promise<IGetCompetitionSessionResp> {
    const competitionId = ctx.id!;
    if (ctx.helper.isCompetitionLoggedIn(competitionId)) {
      return ctx.helper.getCompetitionSession(competitionId)!;
    }
    return null;
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.loginCompetition.i](ctx: Context): Promise<ILoginCompetitionResp> {
    const competitionId = ctx.id!;
    const { userId, password } = ctx.request.body as ILoginCompetitionReq;
    const competitionUser = await this.service.findOneCompetitionUser(competitionId, {
      userId,
      password,
    });
    if (!competitionUser) {
      throw new ReqError(Codes.COMPETITION_INCORRECT_PASSWORD);
    } else if (
      competitionUser.status !== ECompetitionUserStatus.available &&
      competitionUser.status !== ECompetitionUserStatus.entered &&
      competitionUser.status !== ECompetitionUserStatus.quitted
    ) {
      throw new ReqError(Codes.COMPETITION_USER_STATUS_CANNOT_ACCESS);
    }
    const session = {
      userId: competitionUser.userId,
      nickname: competitionUser.info?.nickname || '',
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

  @route()
  @id()
  async [routesBe.logoutCompetition.i](ctx: Context) {
    const competitionId = ctx.id!;
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
  async [routesBe.getCompetitionUsers.i](ctx: Context) {
    const competitionId = ctx.id!;
    const req = ctx.request.body as IGetCompetitionUsersReq;
    const list = await this.service.getCompetitionUsers(competitionId, req);
    return list;
  }

  @route()
  async [routesBe.getCompetitionUserDetail.i](ctx: Context) {
    const { competitionId, userId } = ctx.request.body as IGetCompetitionUserDetailReq;
    const detail = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    // if (
    //   !ctx.helper.checkPerms(EPerm.ReadCompetitionUser) &&
    //   ctx.session.username !== detail.username
    // ) {
    //   throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    // }
    return detail;
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getPublicCompetitionParticipants.i](ctx: Context) {
    const competitionId = ctx.id!;
    const list = await this.service.getCompetitionUsers(competitionId, {
      role: ECompetitionUserRole.participant,
    });
    const filtered = list.rows.filter((user) =>
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
          delete u.info.birthDate;
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
    if (u.info) {
      delete u.info.schoolNo;
      delete u.info.tel;
      delete u.info.qq;
      delete u.info.weChat;
      delete u.info.clothing;
      delete u.info.birthDate;
    }
    return u;
  }
}
