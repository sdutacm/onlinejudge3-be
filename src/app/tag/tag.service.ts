import { provide, inject, Context, config } from 'midway';
import { CTagMeta } from './tag.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TTagModel, TTagModelScopes } from '@/lib/models/tag.model';
import {
  TMTagDetailFields,
  IMTagDetail,
  IMTagServiceGetFullListRes,
  IMTagServiceCreateOpt,
  IMTagServiceCreateRes,
  ITagModel,
  IMTagServiceUpdateOpt,
  IMTagServiceUpdateRes,
  IMTagServiceGetDetailRes,
} from './tag.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';

export type CTagService = TagService;

const tagDetailFields: Array<TMTagDetailFields> = [
  'tagId',
  'nameEn',
  'nameZhHans',
  'nameZhHant',
  'hidden',
  'createdAt',
];

@provide()
export default class TagService {
  @inject('tagMeta')
  meta: CTagMeta;

  @inject('tagModel')
  model: TTagModel;

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
   * 获取全列表缓存。
   */
  private async _getFullListCache(): Promise<IMTagDetail[] | null> {
    return this.ctx.helper
      .redisGet<IMTagDetail[]>(this.redisKey.tagList)
      .then((res) =>
        this.utils.misc.processDateFromJson(
          res,
          res?.map((d, index) => `${index}.createdAt`) || [],
        ),
      );
  }

  /**
   * 设置全列表缓存。
   * @param data 数据
   */
  private async _setFullListCache(data: IMTagDetail[]): Promise<void> {
    return this.ctx.helper.redisSet(this.redisKey.tagList, [], data, this.durations.cacheFullList);
  }

  /**
   * 获取标签全列表。
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getFullList(
    scope: TTagModelScopes | null = 'available',
  ): Promise<IMTagServiceGetFullListRes> {
    let res: IMTagServiceGetFullListRes['rows'] | null = null;
    const cached = scope === 'available' ? await this._getFullListCache() : null;
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope(scope || undefined)
        .findAll({
          attributes: tagDetailFields,
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMTagDetail));
      scope === 'available' && (await this._setFullListCache(res));
    }
    res = res || [];
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 获取标签详情。
   * @param tagId tagId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    tagId: ITagModel['tagId'],
    scope: TTagModelScopes | null = 'available',
  ): Promise<IMTagServiceGetDetailRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: tagDetailFields,
        where: {
          tagId,
        },
      })
      .then((d) => d && (d.get({ plain: true }) as IMTagDetail));
  }

  /**
   * 创建标签。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMTagServiceCreateOpt): Promise<IMTagServiceCreateRes> {
    const res = await this.model.create(data);
    return res.tagId;
  }

  /**
   * 更新标签（部分更新）。
   * @param tagId tagId
   * @param data 更新数据
   */
  async update(
    tagId: ITagModel['tagId'],
    data: IMTagServiceUpdateOpt,
  ): Promise<IMTagServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        tagId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除全列表缓存。
   */
  async clearFullListCache(): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.tagList);
  }
}
