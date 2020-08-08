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
  IBatchAddGroupMembersReq,
} from '@/common/contracts/group';
import { ILodash } from '@/utils/libs/lodash';
import { IMGroupDetail } from './group.interface';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { EGroupMemberPermission, EGroupJoinChannel, EGroupMemberStatus } from '@/common/enums';
import { CPromiseQueue } from '@/utils/libs/promise-queue';
import { CUserService } from '../user/user.service';

@provide()
@controller('/')
export default class GroupController {
  @inject('groupMeta')
  meta: CGroupMeta;

  @inject('groupService')
  service: CGroupService;

  @inject()
  userService: CUserService;

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

  /**
   * 获取群组成员列表。
   *
   * 逻辑：
   * - 对非 group.member+ 或 global admin，如果群组为 private，则视作群组不存在
   * - 对非 group.admin+ 或 global admin，只返回 status=normal 的用户
   * - permission、joinedAt 仅 group.member+ 或 global admin 可见
   * - status 仅 group.admin+ 或 global admin 可见
   *
   * @returns 群组成员列表
   */
  @route()
  @id()
  @getDetail()
  async [routesBe.getGroupMemberList.i](ctx: Context) {
    const groupId = ctx.id!;
    const detail = ctx.detail as IMGroupDetail;
    const hasGroupAdminPerm = await this.service.hasGroupAdminPerm(groupId);
    const hasGroupViewPerm = await this.service.hasGroupViewPerm(groupId);
    if (detail.private && !hasGroupViewPerm) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    const groupMemberList = await this.service.getGroupMemberList(groupId);
    const members = groupMemberList.rows.filter(
      (m) => hasGroupAdminPerm || m.status === EGroupMemberStatus.normal,
    );
    members.forEach((m) => {
      if (!hasGroupAdminPerm) {
        delete m.status;
      }
      if (!hasGroupViewPerm) {
        delete m.permission;
        delete m.joinedAt;
      }
    });
    return ctx.helper.formatFullList(members.length, members);
  }

  /**
   * 申请加入群组。
   *
   * 权限：需要登录且非群组成员
   */
  @route()
  @login()
  @id()
  @getDetail()
  async [routesBe.joinGroup.i](ctx: Context) {
    const groupId = ctx.id!;
    const detail = ctx.detail as IMGroupDetail;
    const userId = ctx.session.userId;
    if (detail.private || detail.joinChannel === EGroupJoinChannel.invitation) {
      throw new ReqError(Codes.GROUP_CANNOT_JOIN);
    }
    if (await this.service.isUserInGroup(groupId, userId, true)) {
      throw new ReqError(Codes.GROUP_ALREADY_JOINED_OR_UNDER_AUDITING);
    }
    await this.service.createGroupMember(groupId, {
      userId,
      status:
        detail.joinChannel === EGroupJoinChannel.audit
          ? EGroupMemberStatus.auditing
          : EGroupMemberStatus.normal,
    });
    await this.service.updateGroupMembersCount(groupId);
    await this.service.clearDetailCache(groupId);
  }

  /**
   * 批量添加群组成员。
   *
   * 权限：group.admin+ 或 global admin
   *
   * 逻辑：
   * - 若用户已在群组中，当状态为 normal 时忽略；当状态为 auditing 时则置为 normal
   */
  @route()
  @login()
  @id()
  @getDetail()
  async [routesBe.batchAddGroupMembers.i](ctx: Context) {
    const groupId = ctx.id!;
    if (!(await this.service.hasGroupAdminPerm(groupId))) {
      throw new ReqError(Codes.GENERAL_NO_PERMISSION);
    }
    let { userIds, usernames } = ctx.request.body as IBatchAddGroupMembersReq;
    userIds = userIds || [];
    usernames = usernames || [];
    // 将所有 username 换成 userId
    const userIdsMap = await this.userService.getUserIdsByUsernames(usernames);
    userIds = [...userIds, ...Object.values(userIdsMap)];
    // 去除无效用户
    const usersMap = await this.userService.getRelative(userIds);
    userIds = Object.keys(usersMap).map((userId) => +userId);
    // 添加成员
    const members = await this.service.getGroupMemberList(groupId);
    for (const userId of userIds) {
      const member = members.rows.find((m) => m.user?.userId === userId);
      if (!member) {
        await this.service.createGroupMember(groupId, {
          userId,
          status: EGroupMemberStatus.normal,
        });
      } else if (member.status === EGroupMemberStatus.auditing) {
        await this.service.updateGroupMember(groupId, userId, {
          status: EGroupMemberStatus.normal,
        });
      }
    }
    await this.service.updateGroupMembersCount(groupId);
    await this.service.clearDetailCache(groupId);
  }
}
