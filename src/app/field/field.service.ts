import { provide, inject, Context, config } from 'midway';
import { CFieldMeta } from './field.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TFieldModel } from '@/lib/models/field.model';
import {
  TMFieldLiteFields,
  TMFieldDetailFields,
  IFieldModel,
  IMFieldServiceGetListOpt,
  IMFieldServiceGetListRes,
  IMFieldServiceIsExistsOpt,
  IMFieldServiceCreateOpt,
  IMFieldServiceCreateRes,
  IMFieldServiceUpdateOpt,
  IMFieldServiceUpdateRes,
  IMFieldServiceGetDetailRes,
  IMFieldServiceFindOneOpt,
  IMFieldServiceFindOneRes,
  IMFieldListPagination,
  IMFieldLitePlain,
  IMFieldDetailPlain,
} from './field.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';

export type CFieldService = FieldService;

const fieldLiteFields: Array<TMFieldLiteFields> = [
  'fieldId',
  'name',
  'shortName',
  // 'deleted',
  'createdAt',
  'updatedAt',
];

const fieldDetailFields: Array<TMFieldDetailFields> = [
  'fieldId',
  'name',
  'shortName',
  'seatingArrangement',
  // 'deleted',
  'createdAt',
  'updatedAt',
];

@provide()
export default class FieldService {
  @inject('fieldMeta')
  meta: CFieldMeta;

  @inject('fieldModel')
  model: TFieldModel;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param fieldId fieldId
   */
  private async _getDetailCache(
    fieldId: IFieldModel['fieldId'],
  ): Promise<IMFieldDetailPlain | null | ''> {
    return this.ctx.helper
      .redisGet<IMFieldDetailPlain>(this.meta.detailCacheKey, [fieldId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt', 'updatedAt']));
  }

  /**
   * 设置详情缓存。
   * @param fieldId fieldId
   * @param data 详情数据
   */
  private async _setDetailCache(
    fieldId: IFieldModel['fieldId'],
    data: IMFieldDetailPlain | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [fieldId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMFieldServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      fieldId: opts.fieldId,
      shortName: opts.shortName,
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

  private async _handleRelativeData<T extends IMFieldLitePlain>(data: T[]): Promise<Array<T>> {
    return data;
  }

  /**
   * 获取场地列表。
   * @param options 查询参数
   * @param pagination 分页参数
   */
  async getList(
    options: IMFieldServiceGetListOpt,
    pagination: IMFieldListPagination = {},
  ): Promise<IMFieldServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .scope('available')
      .findAndCountAll({
        attributes: fieldLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMFieldLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
  }

  /**
   * 获取场地详情。
   * @param fieldId fieldaId
   */
  async getDetail(fieldId: IFieldModel['fieldId']): Promise<IMFieldServiceGetDetailRes> {
    let res: IMFieldDetailPlain | null = null;
    const cached = await this._getDetailCache(fieldId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope('available')
        .findOne({
          attributes: fieldDetailFields,
          where: {
            fieldId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMFieldDetailPlain));
      await this._setDetailCache(fieldId, res);
    }
    if (res) {
      const [ret] = await this._handleRelativeData([res]);
      return ret;
    }
    return null;
  }

  /**
   * 按条件查询场地详情。
   * @param options 查询参数
   */
  async findOne(options: IMFieldServiceFindOneOpt): Promise<IMFieldServiceFindOneRes> {
    return this.model
      .scope('available')
      .findOne({
        attributes: fieldDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMFieldDetailPlain));
  }

  /**
   * 按条件查询场地是否存在。
   * @param options 查询参数
   */
  async isExists(options: IMFieldServiceIsExistsOpt): Promise<boolean> {
    const res = await this.model.scope('available').findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建场地。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMFieldServiceCreateOpt): Promise<IMFieldServiceCreateRes> {
    const res = await this.model.create(data);
    return res.fieldId;
  }

  /**
   * 更新场地（部分更新）。
   * @param fieldId fieldId
   * @param data 更新数据
   */
  async update(
    fieldId: IFieldModel['fieldId'],
    data: IMFieldServiceUpdateOpt,
  ): Promise<IMFieldServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        fieldId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param fieldId fieldId
   */
  async clearDetailCache(fieldId: IFieldModel['fieldId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [fieldId]);
  }
}
