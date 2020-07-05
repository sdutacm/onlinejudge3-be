import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  getDetail,
  id,
  login,
} from '@/lib/decorators/controller.decorator';
import { CSolutionMeta } from './solution.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CSolutionService } from './solution.service';
import { ILodash } from '@/utils/libs/lodash';
import { CContestService } from '../contest/contest.service';
import { IGetSolutionListReq } from '@/common/contracts/solution';
import { IMSolutionServiceGetListRes, IMSolutionDetail } from './solution.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';

@provide()
@controller('/')
export default class SolutionController {
  @inject('solutionMeta')
  meta: CSolutionMeta;

  @inject('solutionService')
  service: CSolutionService;

  @inject()
  contestService: CContestService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList(ctx) {
      const { contestId } = ctx.request.body as IGetSolutionListReq;
      if (contestId && !ctx.helper.isContestLoggedIn(contestId)) {
        delete ctx.request.body.contest;
      }
    },
    afterGetList(ctx) {
      const { contestId } = ctx.request.body as IGetSolutionListReq;
      if (contestId && !ctx.helper.isContestLoggedIn(contestId) && !ctx.isPerm) {
        (ctx.list as IMSolutionServiceGetListRes).rows.forEach((d) => {
          delete d.time;
          delete d.memory;
          delete d.codeLength;
        });
      }
    },
  })
  @respList()
  async [routesBe.getSolutionList.i](_ctx: Context) {}

  @route()
  @login()
  @id()
  @getDetail()
  async [routesBe.getSolutionDetail.i](ctx: Context) {
    const detail = ctx.detail as IMSolutionDetail;
    if (
      !(
        ctx.isPerm ||
        detail.shared ||
        ctx.session.userId === detail.user.userId ||
        (detail.contest?.contestId &&
          detail.isContestUser &&
          detail.user.userId &&
          ctx.helper.getContestSession(detail.contest.contestId)?.userId === detail.user.userId)
      )
    ) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    return detail;
  }
}
