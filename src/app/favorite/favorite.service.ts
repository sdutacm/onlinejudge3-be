import { provide, inject, Context, config } from 'midway';
import { CFavoriteMeta } from './favorite.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TFavoriteModel, TFavoriteModelScopes } from '@/lib/models/favorite.model';
import {
  TMFavoriteLiteFields,
  TMFavoriteDetailFields,
  IFavoriteModel,
  IMFavoriteServiceGetListOpt,
  IMFavoriteListPagination,
  IMFavoriteServiceGetListRes,
  IMFavoriteServiceIsExistsOpt,
  IMFavoriteServiceCreateOpt,
  IMFavoriteServiceCreateRes,
  IMFavoriteServiceUpdateOpt,
  IMFavoriteServiceUpdateRes,
  IMFavoriteLite,
  IMFavoriteDetail,
  IMFavoriteServiceGetDetailRes,
  IMFavoriteServiceFindOneOpt,
  IMFavoriteServiceFindOneRes,
} from './favorite.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';

export type CFavoriteService = FavoriteService;

const favoriteLiteFields: Array<TMFavoriteLiteFields> = [
  'favoriteId',
  'userId',
  'type',
  'target',
  'note',
  'createdAt',
  'updatedAt',
  'deleted',
];
const favoriteDetailFields: Array<TMFavoriteDetailFields> = [
  'favoriteId',
  'userId',
  'type',
  'target',
  'note',
  'createdAt',
  'updatedAt',
  'deleted',
];

@provide()
export default class FavoriteService {
  @inject('favoriteMeta')
  meta: CFavoriteMeta;

  @inject('favoriteModel')
  model: TFavoriteModel;

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

  private _formatListQuery(opts: IMFavoriteServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      userId: opts.userId,
      type: opts.type,
    });
    if (opts.note) {
      where.note = {
        [Op.like]: `%${opts.note}%`,
      };
    }
    return {
      where,
    };
  }

  /**
   * 获取收藏列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMFavoriteServiceGetListOpt,
    pagination: IMFavoriteListPagination = {},
    scope: TFavoriteModelScopes | null = 'available',
  ): Promise<IMFavoriteServiceGetListRes> {
    const query = this._formatListQuery(options);
    return this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: favoriteLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMFavoriteLite),
      }));
  }

  /**
   * 获取收藏详情。
   * @param favoriteId favoriteId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    favoriteId: IFavoriteModel['favoriteId'],
    scope: TFavoriteModelScopes | null = 'available',
  ): Promise<IMFavoriteServiceGetDetailRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: favoriteDetailFields,
        where: {
          favoriteId,
        },
      })
      .then((d) => d && (d.get({ plain: true }) as IMFavoriteDetail));
  }

  /**
   * 按条件查询收藏详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMFavoriteServiceFindOneOpt,
    scope: TFavoriteModelScopes | null = 'available',
  ): Promise<IMFavoriteServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: favoriteDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMFavoriteDetail));
  }

  /**
   * 按条件查询收藏是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMFavoriteServiceIsExistsOpt,
    scope: TFavoriteModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建收藏。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMFavoriteServiceCreateOpt): Promise<IMFavoriteServiceCreateRes> {
    const res = await this.model.create(data);
    return res.favoriteId;
  }

  /**
   * 更新收藏（部分更新）。
   * @param favoriteId favoriteId
   * @param data 更新数据
   */
  async update(
    favoriteId: IFavoriteModel['favoriteId'],
    data: IMFavoriteServiceUpdateOpt,
  ): Promise<IMFavoriteServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        favoriteId,
      },
    });
    return res[0] > 0;
  }
}
