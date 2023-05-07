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
  authPerm,
  authCompetitionRoleOrAuthPerm,
} from '@/lib/decorators/controller.decorator';
import { CCompetitionMeta } from './competition.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CCompetitionService } from './competition.service';
import { ILodash } from '@/utils/libs/lodash';
import { IMCompetitionDetail } from './competition.interface';
import { Codes } from '@/common/codes';
import { ReqError } from '@/lib/global/error';
import { CMailSender } from '@/utils/mail';
import { CSolutionService } from '../solution/solution.service';
import { CMessageService } from '../message/message.service';
import { CUserService } from '../user/user.service';
import { CProblemService } from '../problem/problem.service';
import { EPerm } from '@/common/configs/perm.config';
import {
  IGetCompetitionSessionResp,
  ILoginCompetitionReq,
  ILoginCompetitionResp,
  ICreateCompetitionReq,
  ICreateCompetitionResp,
  IGetCompetitionProblemConfigResp,
  ISetCompetitionProblemConfigReq,
  IGetCompetitionUsersReq,
  IGetCompetitionUserDetailReq,
  IGetPublicCompetitionParticipantDetailReq,
  ISignUpCompetitionParticipantReq,
  IAuditCompetitionParticipantReq,
  IUpdateCompetitionDetailReq,
  IGetCompetitionProblemSolutionStatsResp,
  IGetCompetitionSettingsResp,
  IUpdateCompetitionSettingsReq,
  IGetSelfCompetitionUserDetailReq,
  IBatchCreateCompetitionUsersReq,
  ICreateCompetitionUserReq,
  IUpdateCompetitionUserReq,
  ICreateCompetitionNotificationReq,
  IDeleteCompetitionNotificationReq,
  ICreateCompetitionQuestionReq,
  IReplyCompetitionQuestionReq,
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

  @config()
  siteTeam: string;

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
      // 允许一部分角色凭借 OJ 登录态免密登录
      // TODO 比赛被结束后均可以凭借 OJ 登录态免密登录
      if (
        [
          ECompetitionUserRole.admin,
          ECompetitionUserRole.principal,
          ECompetitionUserRole.auditor,
        ].includes(competitionUser.role)
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
    } else if (
      ![
        ECompetitionUserStatus.available,
        ECompetitionUserStatus.entered,
        ECompetitionUserStatus.quitted,
      ].includes(competitionUser.status)
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
    try {
      this.competitionLogService.log(competitionId, ECompetitionLogAction.Login, {
        detail: {
          userId: competitionUser.userId,
          nickname: competitionUser.info?.nickname || '',
          subname: competitionUser.info?.subname || '',
          role: competitionUser.role,
        },
      });
    } catch (e) {
      console.error(e);
    }
    return session;
  }

  @route()
  @id()
  async [routesBe.logoutCompetition.i](ctx: Context) {
    const competitionId = ctx.id!;
    const sess = ctx.helper.getCompetitionSession(competitionId);
    try {
      this.competitionLogService.log(competitionId, ECompetitionLogAction.Logout, {
        detail: {
          userId: sess?.userId,
          nickname: sess?.nickname,
          subname: sess?.subname,
          role: sess?.role,
        },
      });
    } catch (e) {
      console.error(e);
    }
    delete ctx.session.competitions?.[competitionId];
  }

  @route()
  @id()
  @getDetail(null, {
    afterGetDetail: (ctx) => {},
  })
  @respDetail()
  async [routesBe.getCompetitionDetail.i](_ctx: Context) {}

  @route()
  @authPerm(EPerm.WriteCompetition)
  async [routesBe.createCompetition.i](ctx: Context): Promise<ICreateCompetitionResp> {
    const data = ctx.request.body as ICreateCompetitionReq;
    const competitionId = await this.service.create({
      ...data,
      createdBy: ctx.session.userId,
    });
    await this.service.createCompetitionUser(competitionId, ctx.session.userId, {
      role: ECompetitionUserRole.admin,
      status: ECompetitionUserStatus.available,
      info: {
        nickname: 'Admin',
      },
    });
    await this.service.createCompetitionSetting(competitionId, {});
    return { competitionId };
  }

  @route()
  @id()
  @getDetail(null)
  @authCompetitionRoleOrAuthPerm(
    [ECompetitionUserRole.admin, ECompetitionUserRole.principal],
    undefined,
    EPerm.WriteCompetition,
  )
  async [routesBe.updateCompetitionDetail.i](ctx: Context): Promise<void> {
    const competitionId = ctx.id!;
    const data = this.lodash.omit(ctx.request.body as IUpdateCompetitionDetailReq, [
      'competitionId',
    ]);
    await this.service.update(competitionId, data);
    await this.service.clearDetailCache(competitionId);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.UpdateDetail, {
      detail: {
        title: data.title,
        startAt: data.startAt,
        endAt: data.endAt,
        registerStartAt: data.registerStartAt,
        registerEndAt: data.registerEndAt,
        isTeam: data.isTeam,
        hidden: data.hidden,
      },
    });
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getCompetitionProblems.i](ctx: Context) {
    const competitionId = ctx.id!;
    const detail = ctx.detail as IMCompetitionDetail;
    if (
      !ctx.helper.checkCompetitionRole(competitionId, [
        ECompetitionUserRole.admin,
        ECompetitionUserRole.principal,
        ECompetitionUserRole.judge,
      ]) &&
      ctx.helper.isContestPending(detail)
    ) {
      throw new ReqError(Codes.COMPETITION_PENDING);
    }
    return this.service.getCompetitionProblems(competitionId);
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getCompetitionProblemConfig.i](
    ctx: Context,
  ): Promise<IGetCompetitionProblemConfigResp> {
    const competitionId = ctx.id!;
    const detail = ctx.detail as IMCompetitionDetail;
    if (
      !ctx.helper.checkCompetitionRole(competitionId, [
        ECompetitionUserRole.admin,
        ECompetitionUserRole.principal,
        ECompetitionUserRole.judge,
      ]) &&
      ctx.helper.isContestPending(detail)
    ) {
      throw new ReqError(Codes.COMPETITION_PENDING);
    }
    const list = await this.service.getCompetitionProblemConfig(competitionId);
    const problemIds = list.rows.map((d) => d.problemId);
    const relativeProblems = await this.problemService.getRelative(problemIds, null);
    return {
      count: list.count,
      rows: list.rows.map((d) => ({
        ...d,
        title: relativeProblems[d.problemId]?.title,
      })),
    };
  }

  @route()
  @id()
  @getDetail(null)
  @authCompetitionRole([ECompetitionUserRole.admin, ECompetitionUserRole.principal])
  async [routesBe.setCompetitionProblemConfig.i](ctx: Context) {
    const competitionId = ctx.id!;
    const { problems } = ctx.request.body as ISetCompetitionProblemConfigReq;
    await this.service.setCompetitionProblems(competitionId, problems);
    await this.service.clearCompetitionProblemsCache(competitionId);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.UpdateProblemConfig, {
      detail: {
        problems,
      },
    });
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin])
  @id()
  @getDetail(null)
  async [routesBe.batchCreateCompetitionUsers.i](ctx: Context): Promise<void> {
    const competitionId = ctx.id!;
    const { users, conflict } = ctx.request.body as IBatchCreateCompetitionUsersReq;
    for (const user of users) {
      const { userId } = user;
      const userInfo = await this.service.findOneCompetitionUser(competitionId, { userId });
      if (userInfo) {
        if (conflict === 'upsert') {
          // 覆盖更新
          await this.service.updateCompetitionUser(competitionId, userId, {
            ...this.lodash.omit(user, ['userId']),
            status: user.status ?? ECompetitionUserStatus.available,
          });
          await this.service.clearCompetitionUserDetailCache(competitionId, userId);
        }
        continue;
      }
      // 创建用户
      await this.service.createCompetitionUser(competitionId, userId, {
        ...this.lodash.omit(user, ['userId']),
        status: user.status ?? ECompetitionUserStatus.available,
      });
    }
    await this.service.clearCompetitionUsersCache(competitionId);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.BatchCreateUser);
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin])
  @id()
  @getDetail(null)
  async [routesBe.createCompetitionUser.i](ctx: Context): Promise<void> {
    const competitionId = ctx.id!;
    const { userId } = ctx.request.body as ICreateCompetitionUserReq;
    const data = this.lodash.omit(ctx.request.body as ICreateCompetitionUserReq, [
      'competitionId',
      'userId',
    ]);
    const userInfo = await this.service.findOneCompetitionUser(competitionId, { userId });
    if (userInfo) {
      throw new ReqError(Codes.COMPETITION_USER_EXISTS);
    }
    await this.service.createCompetitionUser(competitionId, userId, data);
    await this.service.clearCompetitionUsersCache(competitionId);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.CreateUser, {
      userId,
      detail: data,
    });
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin])
  @id()
  @getDetail(null)
  async [routesBe.updateCompetitionUser.i](ctx: Context): Promise<void> {
    const competitionId = ctx.id!;
    const { userId } = ctx.request.body as IUpdateCompetitionUserReq;
    const data = this.lodash.omit(ctx.request.body as IUpdateCompetitionUserReq, [
      'competitionId',
      'userId',
    ]);
    const userInfo = await this.service.findOneCompetitionUser(competitionId, { userId });
    if (!userInfo) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    await this.service.updateCompetitionUser(competitionId, userId, data);
    await Promise.all([
      this.service.clearCompetitionUserDetailCache(competitionId, userId),
      this.service.clearCompetitionUsersCache(competitionId),
    ]);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.UpdateUser, {
      userId,
      detail: data,
    });
  }

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
    const currentRole = ctx.helper.getCompetitionSession(competitionId)?.role;
    const list = await this.service.getAllCompetitionUsers(competitionId);
    return {
      ...list,
      rows: list.rows
        .filter((user) => {
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
        })
        .map((user) => {
          if (currentRole !== ECompetitionUserRole.admin) {
            return this.lodash.omit(user, ['password']);
          }
          return user;
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
  async [routesBe.getSelfCompetitionUserDetail.i](ctx: Context) {
    const { competitionId } = ctx.request.body as IGetSelfCompetitionUserDetailReq;
    const session = ctx.helper.getCompetitionSession(competitionId);
    if (!session) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    const userId = session.userId;
    const detail = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    delete detail.password;
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
          delete u.info.studentNo;
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
      delete u.info.studentNo;
      delete u.info.tel;
      delete u.info.qq;
      delete u.info.weChat;
      delete u.info.clothing;
    }
    return u;
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin, ECompetitionUserRole.fieldAssistantant])
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
        length: 8,
        // characters: 'ABCDEFGHJKLMNPQRTUVWXY346789',
        type: 'numeric',
      });
      await this.service.updateCompetitionUser(competitionId, userId, {
        password,
      });
      await this.service.clearCompetitionUserDetailCache(competitionId, userId);
      this.competitionLogService.log(competitionId, ECompetitionLogAction.RequestPassword, {
        userId,
      });
    }
    return {
      password,
    };
  }

  @route()
  @id()
  @getDetail(null)
  @authCompetitionRole([ECompetitionUserRole.admin])
  async [routesBe.randomAllCompetitionUserPasswords.i](ctx: Context) {
    const competitionId = ctx.id!;
    const list = await this.service.getAllCompetitionUsers(competitionId);
    for (const user of list.rows) {
      if (!user.password) {
        await this.service.updateCompetitionUser(competitionId, user.userId, {
          password: this.utils.misc.randomString({
            length: 8,
            type: 'numeric',
          }),
        });
        await this.service.clearCompetitionUserDetailCache(competitionId, user.userId);
      }
    }
    this.competitionLogService.log(competitionId, ECompetitionLogAction.RandomAllUserPasswords);
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
      return null;
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
    await Promise.all([
      this.service.clearCompetitionUserDetailCache(competitionId, userId),
      this.service.clearCompetitionUsersCache(competitionId),
    ]);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.SignUp, {
      userId,
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
    this.competitionLogService.log(competitionId, ECompetitionLogAction.ModifySelfParticipantInfo, {
      userId,
    });
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin, ECompetitionUserRole.auditor])
  @id()
  @getDetail(null)
  async [routesBe.auditCompetitionParticipant.i](ctx: Context): Promise<void> {
    const competitionId = ctx.id!;
    const detail = ctx.detail! as IMCompetitionDetail;
    if (!ctx.helper.isContestPending(detail)) {
      throw new ReqError(Codes.COMPETITION_RUNNING_OR_ENDED);
    }
    const { userId, status, reason } = ctx.request.body as IAuditCompetitionParticipantReq;
    if (
      ![
        ECompetitionUserStatus.available,
        ECompetitionUserStatus.modificationRequired,
        ECompetitionUserStatus.rejected,
      ].includes(status)
    ) {
      throw new ReqError(Codes.GENERAL_REQUEST_PARAMS_ERROR);
    }
    const competitionUser = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!competitionUser) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (competitionUser.role !== ECompetitionUserRole.participant) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    await this.service.updateCompetitionUser(competitionId, userId, {
      status,
    });
    await Promise.all([
      this.service.clearCompetitionUserDetailCache(competitionId, userId),
      this.service.clearCompetitionUsersCache(competitionId),
    ]);

    let auditMessage = '';
    switch (status) {
      case ECompetitionUserStatus.available:
        auditMessage = '<strong>accepted</strong>';
        break;
      case ECompetitionUserStatus.modificationRequired:
        auditMessage = '<strong>waiting for further modification</strong>';
        break;
      case ECompetitionUserStatus.rejected:
        auditMessage = '<strong>rejected</strong>';
        break;
      default:
        auditMessage = '?';
    }
    if (reason) {
      auditMessage += ` with reason "${reason}"`;
    }
    const subject = 'Your Competition Auditing Result';
    const content = `<p>Dear User:</p>
<p>Thanks for signing up competition "${detail.title}". Your information is ${auditMessage}.</p>
<p>You can review or update your information in competition page.</p>
<p><br/></p>
<p>${this.siteTeam}</p>`;
    const user = await this.userService.findOne({ userId });
    // 发送邮件通知
    user?.email && this.mailSender.singleSend(user.email, subject, content);
    // 发送站内信
    this.messageService.sendSystemMessage(userId, subject, content);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.AuditParticipant, {
      userId,
      detail: {
        status,
        reason,
      },
    });
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.participant])
  @id()
  @getDetail(null)
  async [routesBe.confirmEnterCompetition.i](ctx: Context) {
    const competitionId = ctx.id!;
    const detail = ctx.detail! as IMCompetitionDetail;
    if (ctx.helper.isContestEnded(detail)) {
      throw new ReqError(Codes.COMPETITION_ENDED);
    }
    const { userId } = ctx.helper.getCompetitionSession(competitionId)!;
    const user = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!user || user.role !== ECompetitionUserRole.participant) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (user.status === ECompetitionUserStatus.quitted) {
      throw new ReqError(Codes.COMPETITION_USER_QUITTED);
    }
    if (![ECompetitionUserStatus.available, ECompetitionUserStatus.entered].includes(user.status)) {
      throw new ReqError(Codes.COMPETITION_CURRENT_USER_INVALID_STATUS_TO_OPERATE);
    }
    await this.service.updateCompetitionUser(competitionId, userId, {
      status: ECompetitionUserStatus.entered,
    });
    await Promise.all([
      this.service.clearCompetitionUserDetailCache(competitionId, userId),
      this.service.clearCompetitionUsersCache(competitionId),
    ]);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.ConfirmEnter);
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.participant])
  @id()
  @getDetail(null)
  async [routesBe.confirmQuitCompetition.i](ctx: Context) {
    const competitionId = ctx.id!;
    const detail = ctx.detail! as IMCompetitionDetail;
    if (!ctx.helper.isContestRunning(detail)) {
      throw new ReqError(Codes.COMPETITION_NOT_RUNNING);
    }
    const { userId } = ctx.helper.getCompetitionSession(competitionId)!;
    const user = await this.service.getCompetitionUserDetail(competitionId, userId);
    if (!user || user.role !== ECompetitionUserRole.participant) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    if (user.status === ECompetitionUserStatus.quitted) {
      throw new ReqError(Codes.COMPETITION_USER_QUITTED);
    }
    if (user.status !== ECompetitionUserStatus.entered) {
      throw new ReqError(Codes.COMPETITION_CURRENT_USER_INVALID_STATUS_TO_OPERATE);
    }
    await this.service.updateCompetitionUser(competitionId, userId, {
      status: ECompetitionUserStatus.quitted,
    });
    await Promise.all([
      this.service.clearCompetitionUserDetailCache(competitionId, userId),
      this.service.clearCompetitionUsersCache(competitionId),
    ]);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.ConfirmQuit);
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getCompetitionProblemSolutionStats.i](
    ctx: Context,
  ): Promise<IGetCompetitionProblemSolutionStatsResp> {
    const competitionId = ctx.id!;
    const problems = await this.service.getCompetitionProblems(competitionId);
    const problemIds = problems.rows.map((problem) => problem.problemId);
    return this.solutionService.getCompetitionProblemSolutionStats(competitionId, problemIds);
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getCompetitionSettings.i](ctx: Context): Promise<IGetCompetitionSettingsResp> {
    const competitionId = ctx.id!;
    const res = await this.service.getCompetitionSettingDetail(competitionId);
    if (!res) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    delete res.competitionId;
    delete res.createdAt;
    delete res.updatedAt;
    return res;
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin, ECompetitionUserRole.principal])
  @id()
  @getDetail(null)
  async [routesBe.updateCompetitionSettings.i](ctx: Context) {
    const competitionId = ctx.id!;
    const { ...data } = ctx.request.body as IUpdateCompetitionSettingsReq;
    delete data.competitionId;
    await this.service.updateCompetitionSetting(competitionId, data);
    await this.service.clearCompetitionSettingDetailCache(competitionId);
    this.competitionLogService.log(competitionId, ECompetitionLogAction.UpdateSettings, {
      detail: data,
    });
  }

  @route()
  @id()
  @getDetail(null)
  async [routesBe.getCompetitionNotifications.i](ctx: Context) {
    const competitionId = ctx.id!;
    return this.service.getAllCompetitionNotifications(competitionId);
  }

  @route()
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.judge,
  ])
  @id()
  @getDetail(null)
  async [routesBe.createCompetitionNotification.i](ctx: Context) {
    const competitionId = ctx.id!;
    const data = this.lodash.omit(ctx.request.body as ICreateCompetitionNotificationReq, [
      'competitionId',
    ]);
    await this.service.createCompetitionNotification(competitionId, {
      ...data,
      userId: ctx.helper.getCompetitionSession(competitionId)!.userId,
    });
    this.competitionLogService.log(competitionId, ECompetitionLogAction.CreateNotification, {
      detail: data,
    });
  }

  @route()
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.judge,
  ])
  @id()
  @getDetail(null)
  async [routesBe.deleteCompetitionNotification.i](ctx: Context) {
    const competitionId = ctx.id!;
    const { competitionNotificationId } = ctx.request.body as IDeleteCompetitionNotificationReq;
    await this.service.deleteCompetitionNotification(competitionNotificationId, competitionId);
  }

  @route()
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.judge,
  ])
  @id()
  @getDetail(null)
  async [routesBe.getCompetitionQuestions.i](ctx: Context) {
    const competitionId = ctx.id!;
    return this.service.getCompetitionQuestions(competitionId);
  }

  @route()
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.participant,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.judge,
  ])
  @id()
  @getDetail(null)
  async [routesBe.getSelfCompetitionQuestions.i](ctx: Context) {
    const competitionId = ctx.id!;
    return this.service.getCompetitionQuestions(competitionId, {
      userId: ctx.helper.getCompetitionSession(competitionId)!.userId,
    });
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.participant])
  @id()
  @getDetail(null)
  async [routesBe.createCompetitionQuestion.i](ctx: Context) {
    const competitionId = ctx.id!;
    const data = this.lodash.omit(ctx.request.body as ICreateCompetitionQuestionReq, [
      'competitionId',
    ]);
    await this.service.createCompetitionQuestion(competitionId, {
      ...data,
      userId: ctx.helper.getCompetitionSession(competitionId)!.userId,
    });
  }

  @route()
  @authCompetitionRole([
    ECompetitionUserRole.admin,
    ECompetitionUserRole.principal,
    ECompetitionUserRole.judge,
  ])
  @id()
  @getDetail(null)
  async [routesBe.replyCompetitionQuestion.i](ctx: Context) {
    const competitionId = ctx.id!;
    const { competitionQuestionId } = ctx.request.body as IReplyCompetitionQuestionReq;
    const data = this.lodash.omit(ctx.request.body as IReplyCompetitionQuestionReq, [
      'competitionId',
      'competitionQuestionId',
    ]);
    await this.service.updateCompetitionQuestion(competitionQuestionId, competitionId, {
      ...data,
      status: 1,
      repliedUserId: ctx.helper.getCompetitionSession(competitionId)!.userId,
      repliedAt: new Date(),
    });
  }
}
