/* eslint-disable no-return-await */
import { provide, inject, Context, config } from 'midway';
import { Op } from 'sequelize';
import { CGroupMeta } from './group.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TGroupModel, TGroupModelScopes } from '@/lib/models/group.model';
import {
  TMGroupLiteFields,
  TMGroupDetailFields,
  IMGroupLite,
  IMGroupDetail,
  IGroupModel,
  IMGroupServiceGetListOpt,
  IMGroupListPagination,
  IMGroupServiceGetListRes,
  IMGroupServiceGetDetailRes,
  IMGroupServiceGetRelativeRes,
  IMGroupServiceFindOneOpt,
  IMGroupServiceFindOneRes,
  IMGroupServiceIsExistsOpt,
  IMGroupServiceCreateOpt,
  IMGroupServiceCreateRes,
  IMGroupServiceUpdateOpt,
  IMGroupServiceUpdateRes,
  TMGroupMemberDetailFields,
  IMGroupMemberDetail,
  IMGroupServiceGetGroupMemberListRes,
  IMGroupMemberDetailPlain,
  IMGroupServiceFindOneGroupMemberOpt,
  IMGroupServiceFindOneGroupMemberRes,
  IMGroupServiceIsGroupMemberExistsOpt,
  IMGroupServiceBatchCreateGroupMemberOpt,
  IGroupMemberModel,
  IMGroupServiceUpdateGroupMemberOpt,
  IMGroupServiceUpdateGroupMemberRes,
  IMGroupServiceDeleteGroupMemberRes,
  IMGroupServiceDeleteAllGroupMembersRes,
  IMGroupServiceGetMemberInfoInGroupByUserIdRes,
  IMGroupServiceGetPermInGroupByUserIdRes,
  IMGroupServiceCreateGroupMemberOpt,
  IMGroupServiceCreateGroupMemberRes,
} from './group.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { IUserModel } from '../user/user.interface';
import { CUserService } from '../user/user.service';
import { TGroupMemberModel } from '@/lib/models/groupMember.model';
import { EGroupMemberStatus, EGroupMemberPermission } from '@/common/enums';
import { EPerm } from '@/common/configs/perm.config';

export type CGroupService = GroupService;

const groupLiteFields: Array<TMGroupLiteFields> = [
  'groupId',
  'name',
  'avatar',
  'intro',
  'verified',
  'private',
  'joinChannel',
  'membersCount',
  'createdAt',
  'updatedAt',
  'deleted',
];

const groupDetailFields: Array<TMGroupDetailFields> = [
  'groupId',
  'name',
  'avatar',
  'intro',
  'verified',
  'private',
  'joinChannel',
  'membersCount',
  'createdAt',
  'updatedAt',
  'deleted',
];

const groupMemberDetailFields: Array<TMGroupMemberDetailFields> = [
  'groupMemberId',
  'groupId',
  'userId',
  'permission',
  'status',
  'joinedAt',
];

@provide()
export default class GroupService {
  @inject('groupMeta')
  meta: CGroupMeta;

  @inject('groupModel')
  model: TGroupModel;

  @inject()
  groupMemberModel: TGroupMemberModel;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;

  scopeChecker = {
    available(data: Partial<IGroupModel> | null): boolean {
      return data?.deleted === false;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param groupId groupId
   */
  private async _getDetailCache(
    groupId: IGroupModel['groupId'],
  ): Promise<IMGroupDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMGroupDetail>(this.meta.detailCacheKey, [groupId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt', 'updatedAt']));
  }

  /**
   * 设置详情缓存。
   * @param groupId groupId
   * @param data 详情数据
   */
  private async _setDetailCache(
    groupId: IGroupModel['groupId'],
    data: IMGroupDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [groupId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取群组用户列表缓存。
   * @param groupId groupId
   */
  private async _getGroupMemberListCache(
    groupId: IGroupModel['groupId'],
  ): Promise<IMGroupMemberDetailPlain[] | null> {
    return this.ctx.helper.redisGet<IMGroupMemberDetailPlain[]>(this.redisKey.groupMemberList, [
      groupId,
    ]);
  }

  /**
   * 设置群组用户列表缓存。
   * @param groupId groupId
   * @param data 列表数据
   */
  private async _setGroupMemberListCache(
    groupId: IGroupModel['groupId'],
    data: IMGroupMemberDetailPlain[] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.groupMemberList,
      [groupId],
      data,
      this.durations.cacheFullList,
    );
  }

  /**
   * 获取用户群组列表缓存。
   * @param userId userId
   */
  private async _getUserGroupsCache(
    userId: IUserModel['userId'],
  ): Promise<IGroupModel['groupId'][] | null> {
    return this.ctx.helper.redisGet<IGroupModel['groupId'][]>(this.redisKey.userGroups, [userId]);
  }

  /**
   * 设置用户群组列表缓存。
   * @param userId userId
   * @param data 列表数据
   */
  private async _setUserGroupsCache(
    userId: IUserModel['userId'],
    data: IGroupModel['groupId'][] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.userGroups,
      [userId],
      data,
      this.durations.cacheFullList,
    );
  }

  private _formatListQuery(opts: IMGroupServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      groupId: opts.groupId,
      verified: opts.verified,
      private: opts.private,
      joinChannel: opts.joinChannel,
    });
    if (opts.name) {
      where.name = {
        [Op.like]: `%${opts.name}%`,
      };
    }
    return {
      where,
    };
  }

  private async _handleGroupMemberRelativeData(
    data: IMGroupMemberDetailPlain[],
  ): Promise<IMGroupMemberDetail[]> {
    const userIds = data.map((d) => d.userId);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    return data.map((d) => {
      const user = relativeUsers[d.userId];
      return this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['userId']),
        user: user
          ? {
              userId: user.userId,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
              bannerImage: user.bannerImage,
            }
          : undefined,
      });
    });
  }

  /**
   * 获取群组列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMGroupServiceGetListOpt,
    pagination: IMGroupListPagination = {},
    scope: TGroupModelScopes | null = 'available',
  ): Promise<IMGroupServiceGetListRes> {
    const query = this._formatListQuery(options);
    return this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: groupLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMGroupLite),
      }));
  }

  /**
   * 获取群组详情。
   * @param groupId groupId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    groupId: IGroupModel['groupId'],
    scope: TGroupModelScopes | null = 'available',
  ): Promise<IMGroupServiceGetDetailRes> {
    let res: IMGroupServiceGetDetailRes = null;
    const cached = await this._getDetailCache(groupId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .findOne({
          attributes: groupDetailFields,
          where: {
            groupId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMGroupDetail));
      await this._setDetailCache(groupId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (scope === null || this.scopeChecker[scope](res)) {
      return res;
    }
    return null;
  }

  /**
   * 按 pk 关联查询群组详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getRelative(
    keys: IGroupModel['groupId'][],
    scope: TGroupModelScopes | null = 'available',
  ): Promise<IMGroupServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMGroupServiceGetRelativeRes = {};
    let uncached: typeof keys = [];
    for (const k of ks) {
      const cached = await this._getDetailCache(k);
      if (cached) {
        res[k] = cached;
      } else if (cached === null) {
        uncached.push(k);
      }
    }
    if (uncached.length) {
      const dbRes = await this.model
        // .scope(scope || undefined)
        .findAll({
          attributes: groupDetailFields,
          where: {
            groupId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMGroupDetail));
      for (const d of dbRes) {
        res[d.groupId] = d;
        await this._setDetailCache(d.groupId, d);
      }
      for (const k of ks) {
        !res[k] && (await this._setDetailCache(k, null));
      }
    }
    // 使用缓存，业务上自己处理 scope
    // @ts-ignore
    Object.keys(res).forEach((k: number) => {
      if (!(scope === null || this.scopeChecker[scope](res[k]))) {
        delete res[k];
      }
    });
    return res;
  }

  /**
   * 按条件查询群组详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMGroupServiceFindOneOpt,
    scope: TGroupModelScopes | null = 'available',
  ): Promise<IMGroupServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: groupDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMGroupDetail));
  }

  /**
   * 按条件查询群组是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMGroupServiceIsExistsOpt,
    scope: TGroupModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建群组。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMGroupServiceCreateOpt): Promise<IMGroupServiceCreateRes> {
    const res = await this.model.create(data);
    return res.groupId;
  }

  /**
   * 更新群组（部分更新）。
   * @param groupId groupId
   * @param data 更新数据
   */
  async update(
    groupId: IGroupModel['groupId'],
    data: IMGroupServiceUpdateOpt,
  ): Promise<IMGroupServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        groupId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param groupId groupId
   */
  async clearDetailCache(groupId: IGroupModel['groupId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [groupId]);
  }

  /**
   * 获取群组成员列表。
   * @param groupId groupId
   */
  async getGroupMemberList(
    groupId: IGroupModel['groupId'],
  ): Promise<IMGroupServiceGetGroupMemberListRes> {
    let res: IMGroupMemberDetailPlain[] | null = null;
    const cached = await this._getGroupMemberListCache(groupId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.groupMemberModel
        .findAll({
          attributes: groupMemberDetailFields,
          where: {
            groupId,
          },
          order: [['groupMemberId', 'ASC']],
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMGroupMemberDetailPlain));
      await this._setGroupMemberListCache(groupId, res);
    }
    res = res || [];
    return {
      count: res.length,
      rows: await this._handleGroupMemberRelativeData(res),
    };
  }

  /**
   * 清除群组成员列表缓存。
   * @param groupId groupId
   */
  async clearGroupMemberListCache(groupId: IGroupModel['groupId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.groupMemberList, [groupId]);
  }

  /**
   * 获取用户加入的群组列表。
   * @param userId userId
   */
  async getUserGroups(userId: IUserModel['userId']) {
    let res: IGroupModel['groupId'][] | null = null;
    const cached = await this._getUserGroupsCache(userId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.groupMemberModel
        .findAll({
          attributes: ['groupId'],
          where: {
            userId,
            status: EGroupMemberStatus.normal,
          },
          order: [['groupMemberId', 'ASC']],
        })
        .then((r) => r.map((d) => d.groupId));
      await this._setUserGroupsCache(userId, res);
    }
    res = res || [];
    const relativeGroups = await this.getRelative(res);
    const rows = res.map((groupId) => relativeGroups[groupId]).filter((f) => f);
    return {
      count: res.length,
      rows,
    };
  }

  /**
   * 清除用户群组列表缓存。
   * @param userId userId
   */
  async clearUserGroupsCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.userGroups, [userId]);
  }

  /**
   * 按条件查询群组用户详情。
   * @param groupId groupId
   * @param options 查询参数
   */
  async findOneGroupMember(
    groupId: IGroupModel['groupId'],
    options: IMGroupServiceFindOneGroupMemberOpt,
  ): Promise<IMGroupServiceFindOneGroupMemberRes> {
    const res = await this.groupMemberModel
      .findOne({
        attributes: groupMemberDetailFields,
        where: {
          ...options,
          groupId,
        } as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMGroupMemberDetailPlain));
    if (!res) {
      return null;
    }
    const [ret] = await this._handleGroupMemberRelativeData([res]);
    return ret;
  }

  /**
   * 按条件查询群组用户是否存在。
   * @param groupId groupId
   * @param options 查询参数
   */
  async isGroupMemberExists(
    groupId: IGroupModel['groupId'],
    options: IMGroupServiceIsGroupMemberExistsOpt,
  ): Promise<boolean> {
    const res = await this.groupMemberModel.findOne({
      attributes: ['groupMemberId'],
      where: {
        ...options,
        groupId,
      } as any,
    });
    return !!res;
  }

  /**
   * 创建群组用户。
   * @param groupId groupId
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async createGroupMember(
    groupId: IGroupModel['groupId'],
    data: IMGroupServiceCreateGroupMemberOpt,
  ): Promise<IMGroupServiceCreateGroupMemberRes> {
    const res = await this.groupMemberModel.create({
      ...data,
      groupId,
    });
    return res.groupMemberId;
  }

  /**
   * 批量创建群组用户。
   * @param groupId groupId
   * @param data 创建数据
   */
  async batchCreateGroupMember(
    groupId: IGroupModel['groupId'],
    data: IMGroupServiceBatchCreateGroupMemberOpt,
  ): Promise<void> {
    await this.groupMemberModel.bulkCreate(
      data.map((d) => ({
        ...d,
        groupId,
      })),
    );
  }

  /**
   * 更新群组用户（部分更新）。
   * @param groupId groupId
   * @param groupId userId
   * @param data 更新数据
   */
  async updateGroupMember(
    groupId: IGroupMemberModel['groupId'],
    userId: IGroupMemberModel['userId'],
    data: IMGroupServiceUpdateGroupMemberOpt,
  ): Promise<IMGroupServiceUpdateGroupMemberRes> {
    const res = await this.groupMemberModel.update(data, {
      where: {
        groupId,
        userId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 删除群组用户。
   * @param groupId groupId
   * @param userId userId
   */
  async deleteGroupMember(
    groupId: IGroupMemberModel['groupId'],
    userId: IGroupMemberModel['userId'],
  ): Promise<IMGroupServiceDeleteGroupMemberRes> {
    const res = await this.groupMemberModel.destroy({
      where: {
        groupId,
        userId,
      },
    });
    return res > 0;
  }

  /**
   * 删除全部群组用户。
   * @param groupId groupId
   */
  async deleteAllGroupMembers(
    groupId: IGroupMemberModel['groupId'],
  ): Promise<IMGroupServiceDeleteAllGroupMembersRes> {
    const res = await this.groupMemberModel.destroy({
      where: {
        groupId,
      },
    });
    return res;
  }

  /**
   * 获取用户在指定群组的成员信息。
   * @param groupId groupId
   * @param userId userId
   * @param includePendingUser 是否包括待加入成员
   */
  async getMemberInfoInGroupByUserId(
    groupId: IGroupModel['groupId'],
    userId: IUserModel['userId'],
    includePendingUser = false,
  ): Promise<IMGroupServiceGetMemberInfoInGroupByUserIdRes> {
    let info: IMGroupMemberDetail | null = null;
    const members = await this.getGroupMemberList(groupId);
    info = members.rows.find((m) => m.user?.userId === userId) || null;
    if (!includePendingUser && info?.status !== EGroupMemberStatus.normal) {
      info = null;
    }
    return info;
  }

  /**
   * 判断用户是否在指定群组的成员列表中。
   * @param groupId groupId
   * @param userId userId
   * @param includePendingUser 是否包括待加入成员
   */
  async isUserInGroup(
    groupId: IGroupModel['groupId'],
    userId: IUserModel['userId'],
    includePendingUser = false,
  ): Promise<boolean> {
    return !!(await this.getMemberInfoInGroupByUserId(groupId, userId, includePendingUser));
  }

  /**
   * 获取用户在指定群组的权限。
   * @param groupId groupId
   * @param userId userId
   */
  async getPermInGroupByUserId(
    groupId: IGroupModel['groupId'],
    userId: IUserModel['userId'],
  ): Promise<IMGroupServiceGetPermInGroupByUserIdRes> {
    const info = await this.getMemberInfoInGroupByUserId(groupId, userId, true);
    return info?.permission ?? null;
  }

  /**
   * 判断用户是否是群组 master。
   * @param groupId groupId
   * @param userId userId
   */
  async isGroupMaster(
    groupId: IGroupModel['groupId'],
    userId: IUserModel['userId'],
  ): Promise<boolean> {
    const perm = await this.getPermInGroupByUserId(groupId, userId);
    return perm !== null && perm >= EGroupMemberPermission.master;
  }

  /**
   * 判断用户是否是群组 admin。
   * @param groupId groupId
   * @param userId userId
   */
  async isGroupAdmin(
    groupId: IGroupModel['groupId'],
    userId: IUserModel['userId'],
  ): Promise<boolean> {
    const perm = await this.getPermInGroupByUserId(groupId, userId);
    return perm !== null && perm >= EGroupMemberPermission.admin;
  }

  /**
   * 判断用户是否是群组 member。
   * @param groupId groupId
   * @param userId userId
   */
  async isGroupMember(
    groupId: IGroupModel['groupId'],
    userId: IUserModel['userId'],
  ): Promise<boolean> {
    const perm = await this.getPermInGroupByUserId(groupId, userId);
    return perm !== null && perm >= EGroupMemberPermission.user;
  }

  /**
   * 判断当前登录用户是否有群组查看权限。
   * @param groupId groupId
   * @param strict 是否使用狭义权限（排除 global admin）
   */
  async hasGroupViewPerm(groupId: IGroupModel['groupId'], strict = false): Promise<boolean> {
    if (!this.ctx.loggedIn) {
      return false;
    }
    if (strict) {
      return this.isGroupMember(groupId, this.ctx.session.userId);
    }
    // eslint-disable-next-line no-return-await
    return (
      this.ctx.helper.checkPerms(EPerm.ReadGroup) ||
      (await this.isGroupMember(groupId, this.ctx.session.userId))
    );
  }

  /**
   * 判断当前登录用户是否有群组管理权限。
   * @param groupId groupId
   * @param strict 是否使用狭义权限（排除 global admin）
   */
  async hasGroupAdminPerm(groupId: IGroupModel['groupId'], strict = false): Promise<boolean> {
    if (!this.ctx.loggedIn) {
      return false;
    }
    if (strict) {
      return this.isGroupAdmin(groupId, this.ctx.session.userId);
    }
    // eslint-disable-next-line no-return-await
    return (
      this.ctx.helper.checkPerms(EPerm.WriteGroup) ||
      (await this.isGroupAdmin(groupId, this.ctx.session.userId))
    );
  }

  /**
   * 更新群组成员数量。
   * 这个操作会刷新群组成员列表缓存。
   * @param groupId groupId
   */
  async updateGroupMembersCount(groupId: IGroupModel['groupId']): Promise<void> {
    await this.clearGroupMemberListCache(groupId);
    const members = await this.getGroupMemberList(groupId);
    const membersCount = members.rows.reduce(
      (acc, cur) => acc + (cur.status === EGroupMemberStatus.normal ? 1 : 0),
      0,
    );
    await this.update(groupId, {
      membersCount,
    });
  }
}
