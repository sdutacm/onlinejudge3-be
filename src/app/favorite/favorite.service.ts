import { provide, inject, Context, config } from 'midway';
import { CFavoriteMeta } from './favorite.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TFavoriteModel, TFavoriteModelScopes } from '@/lib/models/favorite.model';
import {
  TMFavoriteDetailFields,
  IFavoriteModel,
  IMFavoriteServiceGetFullListOpt,
  IMFavoriteServiceGetFullListRes,
  IMFavoriteServiceIsExistsOpt,
  IMFavoriteServiceCreateOpt,
  IMFavoriteServiceCreateRes,
  IMFavoriteServiceUpdateOpt,
  IMFavoriteServiceUpdateRes,
  IMFavoriteDetail,
  IMFavoriteServiceGetDetailRes,
  IMFavoriteServiceFindOneOpt,
  IMFavoriteServiceFindOneRes,
  IMFavoriteDetailPlain,
  IMFavoriteFullListPagination,
} from './favorite.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CProblemService } from '../problem/problem.service';
import { CContestService } from '../contest/contest.service';

export type CFavoriteService = FavoriteService;

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
  problemService: CProblemService;

  @inject()
  contestService: CContestService;

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

  private _formatFullListQuery(opts: IMFavoriteServiceGetFullListOpt) {
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

  private async _handleRelativeData(data: IMFavoriteDetailPlain[]): Promise<IMFavoriteDetail[]> {
    // @ts-ignore
    const problemIds = data.map((d) => d.target?.problemId).filter((f) => f);
    // @ts-ignore
    const contestIds = data.map((d) => d.target?.contestId).filter((f) => f);
    const relativeProblem = await this.problemService.getRelative(problemIds, null);
    const relativeContest = await this.contestService.getRelative(contestIds, null);
    // @ts-ignore
    return data.map((d) => {
      switch (d.type) {
        case 'problem':
          // @ts-ignore
          const problemId = d.target?.problemId;
          return {
            ...d,
            target: {
              problemId,
              title: relativeProblem[problemId]?.title,
            },
          };
        case 'contest':
          // @ts-ignore
          const contestId = d.target?.contestId;
          return {
            ...d,
            target: {
              contestId,
              title: relativeContest[contestId]?.title,
            },
          };
      }
      return d;
    });
  }

  /**
   * 获取收藏全列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getFullList(
    options: IMFavoriteServiceGetFullListOpt,
    pagination: IMFavoriteFullListPagination = {},
    scope: TFavoriteModelScopes | null = 'available',
  ): Promise<IMFavoriteServiceGetFullListRes> {
    const query = this._formatFullListQuery(options);
    const res = await this.model
      .scope(scope || undefined)
      .findAll({
        attributes: favoriteDetailFields,
        where: query.where,
        order: pagination.order,
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMFavoriteDetailPlain));
    return {
      count: res.length,
      rows: await this._handleRelativeData(res),
    };
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
    const res = await this.model
      .scope(scope || undefined)
      .findOne({
        attributes: favoriteDetailFields,
        where: {
          favoriteId,
        },
      })
      .then((d) => d && (d.get({ plain: true }) as IMFavoriteDetailPlain));
    if (!res) {
      return res;
    }
    const [ret] = await this._handleRelativeData([res]);
    return ret;
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
