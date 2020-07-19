import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  getDetail,
  id,
} from '@/lib/decorators/controller.decorator';
import { CSolutionMeta } from './solution.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CSolutionService } from './solution.service';
import { ILodash } from '@/utils/libs/lodash';
import { CContestService } from '../contest/contest.service';
import { IGetSolutionListReq, IUpdateSolutionShareReq } from '@/common/contracts/solution';
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
        delete ctx.request.body.contestId;
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
  @id()
  @getDetail()
  async [routesBe.getSolutionDetail.i](ctx: Context) {
    const detail = ctx.detail as IMSolutionDetail;
    const isSelf = this.service.isSolutionSelf(ctx, detail);
    if (!(ctx.isPerm || (ctx.loggedIn && detail.shared) || isSelf)) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    return detail;
  }

  @route()
  @id()
  @getDetail()
  async [routesBe.updateSolutionShare.i](ctx: Context) {
    const solutionId = ctx.id!;
    const { shared } = ctx.request.body as IUpdateSolutionShareReq;
    const detail = ctx.detail as IMSolutionDetail;
    const isSelf = this.service.isSolutionSelf(ctx, detail);
    if (!isSelf) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    await this.service.update(solutionId, {
      shared,
    });
    await this.service.clearDetailCache(solutionId);
  }
}
