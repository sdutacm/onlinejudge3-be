import { provide, inject, Context, config } from 'midway';
import { CAuthMeta } from './auth.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TUserPermissionModel } from '@/lib/models/userPermission.model';
import { EPerm, checkPermExpr } from '@/common/configs/perm.config';
import { IUserModel } from '../user/user.interface';
import { IMAuthServiceGetAllUserPermissionsMapRes } from './auth.interface';

export type CAuthService = AuthService;

@provide()
export default class AuthService {
  @inject('authMeta')
  meta: CAuthMeta;

  @inject('userPermissionModel')
  userPermissionModel: TUserPermissionModel;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  /**
   * 获取权限列表缓存。
   * 如果未找到缓存，则返回 `null`
   * @param userId userId
   */
  private async _getPermissionsCache(userId: IUserModel['userId']): Promise<EPerm[] | null> {
    return this.ctx.helper.redisGet<EPerm[]>(this.meta.permissionsCacheKey, [userId]);
  }

  /**
   * 设置权限列表缓存。
   * @param userId userId
   * @param data 权限列表数据
   */
  private async _setPermissionsCache(userId: IUserModel['userId'], data: EPerm[]): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.permissionsCacheKey,
      [userId],
      data,
      data ? this.durations.cacheDetailShort : this.durations.cacheDetailNull,
    );
  }

  /**
   * 清除权限列表缓存。
   * @param userId userId
   */
  async clearPermissionsCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.permissionsCacheKey, [userId]);
  }

  /**
   * 根据指定 userId 查找所有权限。
   * @param userId userId
   */
  async getPermissions(userId: IUserModel['userId']): Promise<EPerm[]> {
    let res: EPerm[];
    const cached = await this._getPermissionsCache(userId);
    if (cached) {
      res = cached;
    } else {
      res = await this.userPermissionModel
        .findAll({
          attributes: ['permission'],
          where: {
            userId,
          },
        })
        .then((r) =>
          r.filter((d) => EPerm[d.permission as EPerm]).map((d) => d.permission as EPerm),
        );
      await this._setPermissionsCache(userId, res);
    }
    return res;
  }

  /**
   * 获取全部有权限的用户及其权限列表。
   */
  async getAllUserPermissionsMap(): Promise<IMAuthServiceGetAllUserPermissionsMapRes> {
    const res = await this.userPermissionModel.findAll().then((r) =>
      r.map((d) => ({
        userId: d.userId,
        permission: d.permission as EPerm,
      })),
    );
    let map: Record<IUserModel['userId'], Set<EPerm>> = {};
    for (const row of res) {
      if (!EPerm[row.permission]) {
        continue;
      }
      if (!map[row.userId]) {
        map[row.userId] = new Set();
      }
      map[row.userId].add(row.permission);
    }
    const ret: Record<IUserModel['userId'], EPerm[]> = {};
    Object.keys(map).forEach((userId) => {
      // @ts-ignore
      ret[userId] = Array.from(map[userId]);
    });
    return ret;
  }

  /**
   * 设置用户权限列表。
   * @param userId userId
   */
  async setUserPermissions(userId: IUserModel['userId'], permissions: EPerm[]) {
    const filteredPermissions = permissions.filter((permission) => EPerm[permission]);
    await this.userPermissionModel.destroy({
      where: {
        userId,
      },
    });
    await this.userPermissionModel.bulkCreate(
      filteredPermissions.map((permission) => ({
        userId,
        permission,
      })),
    );
    await this.clearPermissionsCache(userId);
  }

  /**
   * 检查指定 userId 的权限是否满足所有给定权限。
   * @param userId userId
   * @param permExpr 要检查的权限表达式
   */
  async checkPermissions(
    userId: IUserModel['userId'],
    permExpr: (EPerm | EPerm[])[],
  ): Promise<boolean> {
    const permissions = await this.getPermissions(userId);
    return checkPermExpr(permExpr, permissions);
  }
}
