import { Context, controller, inject, provide } from 'midway';
import { CGroupService } from './group.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  login,
  rateLimitUser,
  auth,
} from '@/lib/decorators/controller.decorator';
import { CGroupMeta } from './group.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import {
  IGetGroupListReq,
  IGetUserGroupsReq,
  IGetUserGroupsResp,
  ICreateGroupResp,
  ICreateGroupReq,
  ICreateEmptyGroupResp,
  ICreateEmptyGroupReq,
  IUpdateGroupReq,
} from '@/common/contracts/group';
import { ILodash } from '@/utils/libs/lodash';
import { IMGroupDetail } from './group.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { EGroupMemberPermission, EGroupJoinChannel } from '@/common/enums';
import { CPromiseQueue } from '@/utils/libs/promise-queue';

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

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

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

  /**
   * 创建群组。
   *
   * 权限：登录
   *
   * 逻辑：
   * - 如果群组为 private，则 joinChannel 会被强制置为 invitation
   * - 仅 global admin 有权限设置 verified 字段
   * - 创建成功后，当前登录用户成为群组 master
   * @returns 群组 ID
   */
  @route()
  @login()
  @rateLimitUser(60, 2)
  async [routesBe.createGroup.i](ctx: Context): Promise<ICreateGroupResp> {
    const data = ctx.request.body as ICreateGroupReq;
    if (!ctx.isAdmin) {
      delete data.verified;
    }
    if (data.private) {
      data.joinChannel = EGroupJoinChannel.invitation;
    }
    const newId = await this.service.create({
      ...data,
      membersCount: 1,
    });
    await this.service.createGroupMember(newId, {
      userId: ctx.session.userId,
      permission: EGroupMemberPermission.master,
    });
    return { groupId: newId };
  }

  /**
   * 创建空群组。
   *
   * 权限：global admin
   *
   * 逻辑：
   * - joinChannel 会被强制置为 invitation
   * @returns 群组 ID
   */
  @route()
  @auth('admin')
  async [routesBe.createEmptyGroup.i](ctx: Context): Promise<ICreateEmptyGroupResp> {
    const data = ctx.request.body as ICreateEmptyGroupReq;
    const newId = await this.service.create({
      ...data,
      joinChannel: EGroupJoinChannel.invitation,
    });
    return { groupId: newId };
  }

  /**
   * 更新群组。
   *
   * 权限：group.admin+ 或 global admin
   *
   * 逻辑：
   * - 如果群组为 private，则 joinChannel 会被强制置为 invitation
   * - 仅 global admin 有权限设置 verified 字段
   */
  @route()
  @login()
  @id()
  @getDetail()
  async [routesBe.updateGroup.i](ctx: Context): Promise<void> {
    const groupId = ctx.id!;
    const data = ctx.request.body as IUpdateGroupReq;
    if (!(await this.service.hasGroupAdminPerm(groupId))) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    if (!ctx.isAdmin) {
      delete data.verified;
    }
    if (data.private) {
      data.joinChannel = EGroupJoinChannel.invitation;
    }
    await this.service.update(groupId, data);
    await this.service.clearDetailCache(groupId);
  }

  /**
   * 解散群组。
   *
   * 权限：group.master 或 global admin
   */
  @route()
  @login()
  @id()
  @getDetail()
  async [routesBe.deleteGroup.i](ctx: Context): Promise<void> {
    const groupId = ctx.id!;
    if (!ctx.isAdmin && !(await this.service.isGroupMaster(groupId, ctx.session.userId))) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    await this.service.update(groupId, {
      deleted: true,
    });
    await this.service.clearDetailCache(groupId);
    const groupMembers = (await this.service.getGroupMemberList(groupId)).rows;
    await this.service.deleteAllGroupMembers(groupId);
    await this.service.clearGroupMemberListCache(groupId);
    const pq = new this.PromiseQueue(20, Infinity);
    const queueTasks = groupMembers
      .filter((m) => m.user?.userId)
      .map((m) => pq.add(() => this.service.clearUserGroupsCache(m.user.userId)));
    await Promise.all(queueTasks);
  }
}
