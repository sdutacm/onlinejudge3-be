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
} from '@/common/contracts/competition';
import { ECompetitionUserStatus } from '@/common/enums';

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
}
