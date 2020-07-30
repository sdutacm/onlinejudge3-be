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
        ctx.request.body.private = false;
        const { groupId, name } = ctx.request.body as IGetGroupListReq;
        if (!groupId && !name) {
          return false;
        }
      }
    },
  })
  @respList()
  async [routesBe.getGroupList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail(undefined, {
    afterGetDetail: (ctx) => {
      // TODO 对非 group.member+ 或管理，如果群组为 private，则返回群组不存在
    },
  })
  @respDetail()
  async [routesBe.getGroupDetail.i](_ctx: Context) {}
}
