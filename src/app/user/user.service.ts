import { provide, inject, Context, config } from 'midway';
import { Op, QueryTypes } from 'sequelize';
import {
  TMUserDetailFields,
  IMUserDetail,
  TMUserLiteFields,
  IMUserLite,
  IMUserServiceGetListOpt,
  IMUserServiceCreateOpt,
  IUserModel,
  IMUserServiceUpdateOpt,
  IMUserServiceGetDetailRes,
  IMUserServiceCreateRes,
  IMUserServiceUpdateRes,
  IMUserServiceGetListRes,
  IMUserListPagination,
  IMUserServiceGetRelativeRes,
  IMUserServiceFindOneOpt,
  IMUserServiceFindOneRes,
  IMUserServiceIsExistsOpt,
  IMUserServiceGetUserIdsByUsernamesRes,
  IMUserServiceUpdateUserLastStatusOpt,
  IMUserServiceGetUserAcceptedAndSubmittedCountRes,
  IUserMemberDetail,
  IUserMemberLite,
} from './user.interface';
import { TUserModel, TUserModelScopes } from '@/lib/models/user.model';
import { IUtils } from '@/utils';
import { CUserMeta } from './user.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { ILodash } from '@/utils/libs/lodash';
import { EUserForbidden, EUserMemberStatus, EUserStatus, EUserType } from '@/common/enums';
import DB from '@/lib/models/db';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TUserMemberModel } from '@/lib/models/userMember.model';

// const Op = Sequelize.Op;
export type CUserService = UserService;

// type TUserDetailFields = Extract<
//   TUserModelFields,
//   'userId' | 'username' | 'nickname' | 'permission'
// >;
const userLiteFields: Array<TMUserLiteFields> = [
  'userId',
  'username',
  'nickname',
  'avatar',
  'bannerImage',
  'rating',
  'accepted',
  'submitted',
  'grade',
  'forbidden',
  'permission',
  'verified',
  'type',
  'status',
  'lastIp',
  'lastTime',
  'createdAt',
];
const userDetailFields: Array<TMUserDetailFields> = [
  'userId',
  'username',
  'nickname',
  'email',
  'submitted',
  'accepted',
  'permission',
  'avatar',
  'bannerImage',
  'school',
  'college',
  'major',
  'class',
  'grade',
  'forbidden',
  'rating',
  'ratingHistory',
  'site',
  'defaultLanguage',
  'settings',
  'coin',
  'verified',
  'type',
  'status',
  'lastIp',
  'lastTime',
  'createdAt',
];

@provide()
export default class UserService {
  @inject('userMeta')
  meta: CUserMeta;

  @inject('userModel')
  model: TUserModel;

  @inject('userMemberModel')
  userMemberModel: TUserMemberModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  durations: IDurationsConfig;

  @config()
  redisKey: IRedisKeyConfig;

  scopeChecker = {
    available(data: Partial<IUserModel> | null): boolean {
      return data?.forbidden === EUserForbidden.normal;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param userId userId
   */
  private async _getDetailCache(userId: IUserModel['userId']): Promise<IMUserDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMUserDetail>(this.meta.detailCacheKey, [userId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt', 'lastTime']));
  }

  /**
   * 设置详情缓存。
   * @param userId userId
   * @param data 详情数据
   */
  private async _setDetailCache(
    userId: IUserModel['userId'],
    data: IMUserDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [userId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取团队成员列表缓存。
   */
  private async _getMembersCache(userId: IUserModel['userId']): Promise<IUserMemberLite[] | null> {
    return this.ctx.helper
      .redisGet<IUserMemberLite[]>(this.redisKey.userMembers, [userId])
      .then((res) =>
        this.utils.misc.processDateFromJson(
          res,
          res
            ? [
                ...res.map((d, index) => `${index}.createdAt`),
                ...res.map((d, index) => `${index}.updatedAt`),
              ]
            : [],
        ),
      );
  }

  /**
   * 设置团队成员列表缓存。
   * @param data 数据
   */
  private async _setMembersCache(
    userId: IUserModel['userId'],
    data: IUserMemberLite[],
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.userMembers,
      [userId],
      data,
      this.durations.cacheFullList,
    );
  }

  private _formatListQuery(opts: IMUserServiceGetListOpt) {
    const q: any = this.utils.misc.ignoreUndefined({
      userId: opts.userId,
      username: opts.username,
      grade: opts.grade,
      forbidden: opts.forbidden,
      permission: opts.permission,
      verified: opts.verified,
      type: opts.type,
      status: opts.status,
    });
    if (opts.nickname) {
      q.nickname = {
        [Op.like]: `%${opts.nickname}%`,
      };
    }
    if (opts.school) {
      q.school = {
        [Op.like]: `%${opts.school}%`,
      };
    }
    if (opts.college) {
      q.college = {
        [Op.like]: `%${opts.college}%`,
      };
    }
    if (opts.major) {
      q.major = {
        [Op.like]: `%${opts.major}%`,
      };
    }
    if (opts.class) {
      q.class = {
        [Op.like]: `%${opts.class}%`,
      };
    }
    return q;
  }

  /**
   * 获取用户列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMUserServiceGetListOpt,
    pagination: IMUserListPagination = {},
    scope: TUserModelScopes | null = 'available',
  ): Promise<IMUserServiceGetListRes> {
    return this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: userLiteFields,
        where: this._formatListQuery(options),
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMUserLite),
      }));
  }

  /**
   * 获取用户详情。
   * @param userId userId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    userId: IUserModel['userId'],
    scope: TUserModelScopes | null = 'available',
  ): Promise<IMUserServiceGetDetailRes> {
    let res: IMUserServiceGetDetailRes = null;
    const cached = await this._getDetailCache(userId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        // .scope(scope || undefined)
        .findOne({
          attributes: userDetailFields,
          where: {
            userId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMUserDetail));
      await this._setDetailCache(userId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (scope === null || this.scopeChecker[scope](res)) {
      return res;
    }
    return null;
  }

  /**
   * 按 pk 关联查询用户详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getRelative(
    keys: IUserModel['userId'][],
    scope: TUserModelScopes | null = 'available',
  ): Promise<IMUserServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMUserServiceGetRelativeRes = {};
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
          attributes: userDetailFields,
          where: {
            userId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMUserDetail));
      for (const d of dbRes) {
        res[d.userId] = d;
        await this._setDetailCache(d.userId, d);
      }
      // 查不到的也要缓存
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
   * 按条件查询用户详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMUserServiceFindOneOpt,
    scope: TUserModelScopes | null = 'available',
  ): Promise<IMUserServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: userDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMUserDetail));
  }

  /**
   * 按条件查询用户是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMUserServiceIsExistsOpt,
    scope: TUserModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建用户。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMUserServiceCreateOpt): Promise<IMUserServiceCreateRes> {
    const res = await this.model.create(data);
    return res.userId;
  }

  /**
   * 更新用户（部分更新）。
   * @param userId userId
   * @param data 更新数据
   */
  async update(
    userId: IUserModel['userId'],
    data: IMUserServiceUpdateOpt,
  ): Promise<IMUserServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        userId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param userId userId
   */
  async clearDetailCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [userId]);
  }

  /**
   * 清除所有session
   */
  async clearAllSessions(userId: IUserModel['userId']): Promise<void> {
    const sessionKeys = await this.ctx.helper.redisKeys(this.redisKey.session, [userId, '*']);
    await Promise.all(sessionKeys.map((key) => this.ctx.helper.redisDel(key)));
  }

  /**
   * 判断用户名是否已被使用。
   * @param username 用户名
   */
  async isUsernameExists(username: IUserModel['username']): Promise<boolean> {
    return this.isExists({ username }, null);
  }

  /**
   * 判断昵称是否已被使用。
   * @param nickname 昵称
   */
  async isNicknameExists(nickname: IUserModel['nickname']): Promise<boolean> {
    return this.isExists({ nickname }, null);
  }

  /**
   * 判断邮箱是否已验证且被使用。
   * @param email 邮箱
   */
  async isEmailExists(email: IUserModel['email']): Promise<boolean> {
    return this.isExists(
      {
        email,
        verified: true,
      },
      null,
    );
  }

  /**
   * 通过用户名批量换取 userId。
   * @param usernames 用户名列表
   */
  async getUserIdsByUsernames(
    usernames: IUserModel['username'][],
  ): Promise<IMUserServiceGetUserIdsByUsernamesRes> {
    if (usernames.length === 0) {
      return {};
    }
    const dbRes = await DB.sequelize.query(
      `SELECT user_id AS userId, user_name AS username FROM user WHERE binary user_name IN (?)`,
      {
        replacements: [usernames],
        type: QueryTypes.SELECT,
      },
    );
    const res: IMUserServiceGetUserIdsByUsernamesRes = {};
    dbRes.forEach((d) => {
      // @ts-ignore
      res[d.username] = d.userId;
    });
    return res;
  }

  /**
   * 更新用户最近状态。
   * @param userId userId
   * @param lastStatus 用户最近状态
   */
  async updateUserLastStatus(
    userId: IUserModel['userId'],
    { lastIp }: IMUserServiceUpdateUserLastStatusOpt,
  ): Promise<void> {
    await this.update(userId, {
      lastIp,
      lastTime: new Date(),
    });
  }

  /**
   * 获取用户 accempted 和 submitted。
   * @param userId userId
   */
  async getUserAcceptedAndSubmittedCount(
    userId: IUserModel['userId'],
  ): Promise<IMUserServiceGetUserAcceptedAndSubmittedCountRes> {
    return this.model
      .findOne({
        attributes: ['accepted', 'submitted'],
        where: {
          userId,
        },
      })
      .then(
        (d) =>
          d &&
          (d.get({ plain: true }) as {
            accepted: IUserModel['accepted'];
            submitted: IUserModel['submitted'];
          }),
      );
  }

  async getUserCount(): Promise<number> {
    return this.model.count({
      where: {
        forbidden: EUserForbidden.normal,
      },
    });
  }

  async getMembersLite(teamUserId: IUserModel['userId']): Promise<IUserMemberLite[]> {
    let rowsLite: IUserMemberLite[] | null = null;
    const cached = await this._getMembersCache(teamUserId);
    if (cached) {
      rowsLite = cached;
    } else if (cached === null) {
      rowsLite = await this.userMemberModel
        .findAll({
          where: {
            userId: teamUserId,
          },
          order: [['createdAt', 'ASC']],
        })
        .then((r) =>
          r.map(
            (d) =>
              ({
                userId: d.memberUserId,
                ...(this.lodash.omit(d.get({ plain: true }), ['userId', 'memberUserId']) as any),
              } as IUserMemberLite),
          ),
        );
      await this._setMembersCache(teamUserId, rowsLite);
    }
    return rowsLite || [];
  }

  async getMembers(teamUserId: IUserModel['userId']): Promise<IUserMemberDetail[]> {
    const rowsLite = await this.getMembersLite(teamUserId);
    const userIds = rowsLite.map((d) => d.userId);
    const users = await this.getRelative(userIds);
    return rowsLite.map((d) => ({
      ...d,
      ...this.lodash.pick(users[d.userId], [
        'username',
        'nickname',
        'avatar',
        'bannerImage',
        'accepted',
        'submitted',
        'rating',
        'verified',
      ]),
    }));
  }

  async addMember(teamUserId: IUserModel['userId'], memberUserId: IUserModel['userId']) {
    if (!teamUserId || !memberUserId) {
      return;
    }
    await this.userMemberModel.create({
      userId: teamUserId,
      memberUserId,
    });
    await this.clearMembersCache(teamUserId);
  }

  async isUserInTeam(teamUserId: IUserModel['userId'], memberUserId: IUserModel['userId']) {
    const members = await this.getMembersLite(teamUserId);
    return members.some((d) => d.userId === memberUserId);
  }

  async updateMemberStatus(
    teamUserId: IUserModel['userId'],
    memberUserId: IUserModel['userId'],
    status: IUserMemberDetail['status'],
  ) {
    if (!teamUserId || !memberUserId) {
      return;
    }
    await this.userMemberModel.update(
      {
        status,
      },
      {
        where: {
          userId: teamUserId,
          memberUserId,
        },
      },
    );
    await this.clearMembersCache(teamUserId);
  }

  async removeMember(teamUserId: IUserModel['userId'], memberUserId: IUserModel['userId']) {
    if (!teamUserId || !memberUserId) {
      return;
    }
    await this.userMemberModel.destroy({
      where: {
        userId: teamUserId,
        memberUserId,
      },
    });
    await this.clearMembersCache(teamUserId);
  }

  async getTeamMemberCount(teamUserId: IUserModel['userId'], onlyAvailable = false) {
    const members = await this.getMembersLite(teamUserId);
    return onlyAvailable
      ? members.filter((d) => d.status === EUserMemberStatus.available).length
      : members.length;
  }

  async areAllTeamMembersReady(teamUserId: IUserModel['userId']) {
    const members = await this.getMembersLite(teamUserId);
    return members.length > 0 && members.every((d) => d.status === EUserMemberStatus.available);
  }

  async isTeamAvailable(teamUserId: IUserModel['userId']) {
    const detail = await this.getDetail(teamUserId);
    if (!detail || detail.type !== EUserType.team || detail.status !== EUserStatus.settled) {
      return false;
    }
    return true;
  }

  async getRelativeTeamMembers(teamUserIds: IUserModel['userId'][]) {
    const res: Record<number, IUserMemberDetail[]> = {};
    await Promise.all(
      teamUserIds.map((teamUserId) =>
        this.getMembers(teamUserId).then((r) => {
          res[teamUserId] = r;
        }),
      ),
    );
    return res;
  }

  async getUserTeamsLite(memberUserId: IUserModel['userId']) {
    return this.userMemberModel
      .findAll({
        where: {
          memberUserId,
        },
      })
      .then((r) =>
        r.map((d) => ({
          teamUserId: d.userId,
          ...(this.lodash.omit(d.get({ plain: true }), ['userId', 'memberUserId']) as Omit<
            IUserMemberLite,
            'userId'
          >),
        })),
      );
  }

  async getUserTeams(memberUserId: IUserModel['userId']) {
    const rowsLite = await this.getUserTeamsLite(memberUserId);
    const teamUserIds = rowsLite.map((d) => d.teamUserId);
    const teams = await this.getRelative(teamUserIds, null);
    const relativeMembers = await this.getRelativeTeamMembers(teamUserIds);
    return rowsLite.map((d) => ({
      teamUserId: d.teamUserId,
      selfMemberStatus: d.status,
      selfJoinedAt: d.updatedAt,
      ...this.lodash.pick(teams[d.teamUserId], [
        'username',
        'nickname',
        'avatar',
        'bannerImage',
        'status',
      ]),
      members: relativeMembers[d.teamUserId] || [],
    }));
  }

  /**
   * 清除团队成员列表缓存。
   */
  async clearMembersCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.userMembers, [userId]);
  }

  async confirmTeamSettlement(userId: IUserModel['userId']) {
    await this.model.update(
      {
        status: EUserStatus.settled,
      },
      {
        where: {
          userId,
          type: EUserType.team,
          status: EUserStatus.normal,
        },
      },
    );
    await this.clearDetailCache(userId);
  }
}
