import { provide, inject } from 'midway';
import { Op } from 'sequelize';
import {
  TMUserDetailFields,
  IMUserDetail,
  TMUserLiteFields,
  IMUserLite,
  IMUserServiceGetListOpts,
  IMUserServiceCreateOpts,
  IUserModel,
  IMUserServiceUpdateOpts,
} from './users.interface';
import { TUserModel, TUserModelScopes } from '@/lib/models/user.model';
import { IUtils } from '@/utils';

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
  'rating',
  'ratingHistory',
  'createdAt',
];

@provide()
export class UserService {
  @inject()
  userModel: TUserModel;

  @inject()
  utils: IUtils;

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
   * 获取用户列表
   * @param options 查询参数
   * @param scope 查询 scope，如查询全部则传 undefined
   */
  async getList(
    options: IMUserServiceGetListOpts,
    scope: TUserModelScopes = 'available',
  ): Promise<model.ListModelRes<IMUserLite>> {
    return this.userModel
      .scope(scope)
      .findAndCountAll({
        attributes: userLiteFields,
        where: this._formatQuery(options),
        limit: options.limit,
        offset: options.offset,
        order: options.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMUserLite),
      }));
  }

  /**
   * 获取用户详情
   * @param userId 用户 ID
   * @param scope 查询 scope，如查询全部则传 undefined
   */
  async getDetail(
    userId: IUserModel['userId'],
    scope: TUserModelScopes = 'available',
  ): Promise<model.DetailModelRes<IMUserDetail>> {
    return this.userModel
      .scope(scope)
      .findOne({
        attributes: userDetailFields,
        where: {
          userId,
        },
      })
      .then((d) => d && (d.get({ plain: true }) as IMUserDetail));
  }

  async create(data: IMUserServiceCreateOpts) {
    const res = await this.userModel.create({
      username: data.username,
      nickname: data.nickname,
      password: data.password,
      email: data.email,
    });
    return res.userId;
  }

  async update(userId: IUserModel['userId'], data: IMUserServiceUpdateOpts) {
    const res = await this.userModel.update(
      {
        school: data.school,
        college: data.college,
        major: data.major,
        class: data.class,
        site: data.site,
      },
      {
        where: {
          userId,
        },
      },
    );
    return res[0] > 0;
  }

  async _test() {
    const x = await this.getList({
      nickname: 'root',
    });
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
    console.log('_test done', x);
    return x;
  }
}
