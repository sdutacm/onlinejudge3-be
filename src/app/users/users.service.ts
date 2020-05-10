import { provide, inject, Context, config } from 'midway';
import { Op } from 'sequelize';
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
} from './users.interface';
import { TUserModel, TUserModelScopes } from '@/lib/models/user.model';
import { IUtils } from '@/utils';
import { CUserMeta } from './users.meta';
import { IDurationsConfig } from '@/config/durations.config';

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
  'rating',
  'ratingHistory',
  'createdAt',
];

@provide()
export default class UserService {
  @inject('userMeta')
  meta: CUserMeta;

  @inject()
  userModel: TUserModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @config('durations')
  durations: IDurationsConfig;

  private _formatQuery(opts: Partial<IUserModel>) {
    const q: any = this.utils.misc.ignoreUndefined({
      userId: opts.userId,
      username: opts.username,
      grade: opts.grade,
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
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param userId userId
   */
  private async _getDetailCache(userId: IUserModel['userId']): Promise<IMUserDetail | null | ''> {
    return this.ctx.helper
      .getRedisKey<IMUserDetail>(this.meta.detailCacheKey, [userId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
  }

  private async _setDetailCache(
    userId: IUserModel['userId'],
    data: IMUserDetail | null,
  ): Promise<void> {
    return this.ctx.helper.setRedisKey(
      this.meta.detailCacheKey,
      [userId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
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
    return this.userModel
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: userLiteFields,
        where: this._formatQuery(options),
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
    const cached = scope === 'available' ? await this._getDetailCache(userId) : null;
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.userModel
        .scope(scope || undefined)
        .findOne({
          attributes: userDetailFields,
          where: {
            userId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMUserDetail));
      scope === 'available' && (await this._setDetailCache(userId, res));
    }
    return res;
  }

  async create(data: IMUserServiceCreateOpt): Promise<IMUserServiceCreateRes> {
    const res = await this.userModel.create(data);
    return res.userId;
  }

  async update(
    userId: IUserModel['userId'],
    data: IMUserServiceUpdateOpt,
  ): Promise<IMUserServiceUpdateRes> {
    const res = await this.userModel.update(data, {
      where: {
        userId,
      },
    });
    return res[0] > 0;
  }

  async clearDetailCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.delRedisKey(this.meta.detailCacheKey, [userId]);
  }

  async _test() {
    const x = await this.getList({
      nickname: 'root',
    });
    await this.ctx.helper.getRedisKey('456:%s', ['aaa']);
    // const x = await this.getDetail(1);
    // const x = await this.create({
    //   username: '_test1',
    //   nickname: '_nick1',
    //   password: '123',
    //   email: '123@qq.com',
    // });
    // const x = await this.update(41521, {
    //   school: 'SDUT',
    //   site: 'http://qq.com',
    // });
    // console.log('_test done', x);
    return x;
  }
}
