import { provide, inject, Context, config } from 'midway';
import { Op } from 'sequelize';
import { CContestMeta } from './contest.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TContestModel, TContestModelScopes } from '@/lib/models/contest.model';
import {
  TMContestLiteFields,
  TMContestDetailFields,
  IMContestLite,
  IMContestDetail,
  IContestModel,
  IMContestServiceGetListOpt,
  IMContestListPagination,
  IMContestServiceGetListRes,
  IMContestServiceGetDetailRes,
  IMContestServiceGetRelativeRes,
  IMContestServiceFindOneOpt,
  IMContestServiceFindOneRes,
  IMContestServiceIsExistsOpt,
  IMContestServiceCreateOpt,
  IMContestServiceCreateRes,
  IMContestServiceUpdateOpt,
  IMContestServiceUpdateRes,
} from './contest.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { TUserContestModel } from '@/lib/models/userContest.model';
import { TUserModel } from '@/lib/models/user.model';

export type CContestService = ContestService;

const contestLiteFields: Array<TMContestLiteFields> = [
  'contestId',
  'title',
  'type',
  'category',
  'mode',
  'startAt',
  'endAt',
  'registerStartAt',
  'registerEndAt',
  'team',
  'hidden',
];

const contestDetailFields: Array<TMContestDetailFields> = [
  'contestId',
  'title',
  'type',
  'category',
  'mode',
  'intro',
  'description',
  'password',
  'startAt',
  'endAt',
  'frozenLength',
  'registerStartAt',
  'registerEndAt',
  'team',
  'ended',
  'hidden',
];

@provide()
export default class ContestService {
  @inject('contestMeta')
  meta: CContestMeta;

  @inject('contestModel')
  model: TContestModel;

  @inject()
  userContestModel: TUserContestModel;

  @inject()
  userModel: TUserModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  @config('durations')
  durations: IDurationsConfig;

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param contestId contestId
   */
  private async _getDetailCache(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMContestDetail>(this.meta.detailCacheKey, [contestId])
      .then((res) =>
        this.utils.misc.processDateFromJson(res, [
          'startAt',
          'endAt',
          'registerStartAt',
          'registerEndAt',
        ]),
      );
  }

  /**
   * 设置详情缓存。
   * @param contestId contestId
   * @param data 详情数据
   */
  private async _setDetailCache(
    contestId: IContestModel['contestId'],
    data: IMContestDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [contestId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMContestServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      contestId: opts.contestId,
      type: opts.type,
      category: opts.category,
      mode: opts.mode,
      hidden: opts.hidden,
    });
    if (opts.title) {
      where.title = {
        [Op.like]: `%${opts.title}%`,
      };
    }
    if (opts.contestIds) {
      where.contestId = {
        [Op.in]: opts.contestIds,
      };
    }
    let include: any[] = [];
    if (opts.userId) {
      include = [
        {
          model: this.userModel,
          attributes: [],
          where: {
            userId: opts.userId,
          },
          required: true,
        },
      ];
    }
    return {
      where,
      include,
    };
  }

  /**
   * 获取比赛列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMContestServiceGetListOpt,
    pagination: IMContestListPagination = {},
    scope: TContestModelScopes | null = 'available',
  ): Promise<IMContestServiceGetListRes> {
    const query = this._formatListQuery(options);
    return this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: contestLiteFields,
        where: query.where,
        include: query.include,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
        distinct: query.include?.length > 0,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMContestLite),
      }));
  }

  /**
   * 获取比赛详情。
   * 只有默认 scope 的查询会缓存
   * @param contestId contestId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    contestId: IContestModel['contestId'],
    scope: TContestModelScopes | null = 'available',
  ): Promise<IMContestServiceGetDetailRes> {
    let res: IMContestServiceGetDetailRes = null;
    const cached = scope === 'available' ? await this._getDetailCache(contestId) : null;
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope(scope || undefined)
        .findOne({
          attributes: contestDetailFields,
          where: {
            contestId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMContestDetail));
      scope === 'available' && (await this._setDetailCache(contestId, res));
    }
    return res;
  }

  /**
   * 按 pk 关联查询比赛详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getRelative(
    keys: IContestModel['contestId'][],
    scope: TContestModelScopes | null = 'available',
  ): Promise<IMContestServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMContestServiceGetRelativeRes = {};
    let uncached: typeof keys = [];
    if (scope === 'available') {
      for (const k of ks) {
        const cached = await this._getDetailCache(k);
        if (cached) {
          res[k] = cached;
        } else if (cached === null) {
          uncached.push(k);
        }
      }
    } else {
      uncached = ks;
    }
    if (uncached.length) {
      const dbRes = await this.model
        .scope(scope || undefined)
        .findAll({
          attributes: contestDetailFields,
          where: {
            contestId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMContestDetail));
      for (const d of dbRes) {
        res[d.contestId] = d;
        scope === 'available' && (await this._setDetailCache(d.contestId, d));
      }
      for (const k of ks) {
        !res[k] && scope === 'available' && (await this._setDetailCache(k, null));
      }
    }
    return res;
  }

  /**
   * 按条件查询比赛详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMContestServiceFindOneOpt,
    scope: TContestModelScopes | null = 'available',
  ): Promise<IMContestServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: contestDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMContestDetail));
  }

  /**
   * 按条件查询比赛是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMContestServiceIsExistsOpt,
    scope: TContestModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建比赛。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMContestServiceCreateOpt): Promise<IMContestServiceCreateRes> {
    const res = await this.model.create(data);
    return res.contestId;
  }

  /**
   * 更新比赛（部分更新）。
   * @param contestId contestId
   * @param data 更新数据
   */
  async update(
    contestId: IContestModel['contestId'],
    data: IMContestServiceUpdateOpt,
  ): Promise<IMContestServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        contestId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param contestId contestId
   */
  async clearDetailCache(contestId: IContestModel['contestId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [contestId]);
  }
}
