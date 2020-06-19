import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
  auth,
} from '@/lib/decorators/controller.decorator';
import { CContestMeta } from './contest.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CContestService } from './contest.service';
import { ILodash } from '@/utils/libs/lodash';

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
    },
  })
  @respList()
  // TODO joined
  async [routesBe.getContestList.i](_ctx: Context) {}
}
