import { Context, controller, inject, provide } from 'midway';
import { route, pagination, getList, respList } from '@/lib/decorators/controller.decorator';
import { CSolutionMeta } from './solution.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CSolutionService } from './solution.service';
import { ILodash } from '@/utils/libs/lodash';
import { CContestService } from '../contest/contest.service';
import { IGetSolutionListReq } from '@/common/contracts/solution';

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
  })
  @respList()
  async [routesBe.getSolutionList.i](_ctx: Context) {}
}
