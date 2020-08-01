import { Context, controller, inject, provide } from 'midway';
import { CGroupService } from './group.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
} from '@/lib/decorators/controller.decorator';
import { CGroupMeta } from './group.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { IGetGroupListReq, IGetUserGroupsReq, IGetUserGroupsResp } from '@/common/contracts/group';
import { ILodash } from '@/utils/libs/lodash';
import { IMGroupDetail } from './group.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';

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
  @getDetail()
  async [routesBe.getGroupDetail.i](ctx: Context) {
    const groupId = ctx.id!;
    const detail = ctx.detail as IMGroupDetail;
    if (detail.private && !(await this.service.hasGroupViewPerm(groupId))) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    return detail;
  }

  @route()
  async [routesBe.getUserGroups.i](ctx: Context): Promise<IGetUserGroupsResp> {
    const { userId } = ctx.request.body as IGetUserGroupsReq;
    let list = await this.service.getUserGroups(userId);
    if (!(ctx.loggedIn && ctx.session.userId === ctx.request.body.userId)) {
      list.rows = list.rows.filter((d) => !d.private);
    }
    return ctx.helper.formatFullList(list.count, list.rows);
  }
}
