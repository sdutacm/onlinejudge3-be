import { Context, controller, inject, provide } from 'midway';
import { CGroupService } from './group.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  respDetail,
} from '@/lib/decorators/controller.decorator';
import { CGroupMeta } from './group.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { IGetGroupListReq } from '@/common/contracts/group';
import { ILodash } from '@/utils/libs/lodash';

@provide()
@controller('/')
export default class GroupController {
  @inject('groupMeta')
  meta: CGroupMeta;

  @inject('groupService')
  service: CGroupService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @pagination()
  @getList(undefined, {
    beforeGetList: (ctx) => {
      if (!ctx.isAdmin) {
        delete ctx.request.body.private;
        const { groupId, name, verified } = ctx.request.body as IGetGroupListReq;
        if (!groupId && !name && verified === undefined) {
          return false;
        }
      }
    },
  })
  @respList()
  async [routesBe.getGroupList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getGroupDetail.i](_ctx: Context) {}
}
