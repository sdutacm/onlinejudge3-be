import { provide, inject, Context, config } from 'midway';
import { CProblemMeta } from './problem.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TProblemModel, TProblemModelScopes } from '@/lib/models/problem.model';
import {
  TMProblemLiteFields,
  TMProblemDetailFields,
  IMProblemDetail,
  IMProblemLite,
  IProblemModel,
  IMProblemServiceGetListOpt,
  IMProblemListPagination,
  IMProblemServiceGetListRes,
  IMProblemServiceGetDetailRes,
  IMProblemServiceGetRelativeRes,
  IMProblemServiceFindOneOpt,
  IMProblemServiceFindOneRes,
  IMProblemServiceIsExistsOpt,
  IMProblemServiceCreateOpt,
  IMProblemServiceCreateRes,
  IMProblemServiceUpdateOpt,
  IMProblemServiceUpdateRes,
} from './problem.interface';
import { TTagModel } from '@/lib/models/tag.model';
import { Op, literal } from 'sequelize';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { TProblemTagModel } from '@/lib/models/problemTag.model';
import { ITagModel } from '../tag/tag.interface';

export type CProblemService = ProblemService;

const problemLiteFields: Array<TMProblemLiteFields> = [
  'problemId',
  'title',
  'source',
  'authors',
  'difficulty',
  'createdAt',
  'updatedAt',
  'accepted',
  'submitted',
  'display',
];
const problemDetailFields: Array<TMProblemDetailFields> = [
  'problemId',
  'title',
  'description',
  'input',
  'output',
  'samples',
  'hint',
  'source',
  'authors',
  'timeLimit',
  'memoryLimit',
  'difficulty',
  'createdAt',
  'updatedAt',
  'accepted',
  'submitted',
  'spj',
  'display',
  'spConfig',
  'revision',
];

@provide()
export default class ProblemService {
  @inject('problemMeta')
  meta: CProblemMeta;

  @inject('problemModel')
  model: TProblemModel;

  @inject()
  problemTagModel: TProblemTagModel;

  @inject()
  tagModel: TTagModel;

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
    available(data: Partial<IProblemModel> | null): boolean {
      return data?.display === true;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param problemId problemId
   */
  private async _getDetailCache(
    problemId: IProblemModel['problemId'],
  ): Promise<IMProblemDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMProblemDetail>(this.meta.detailCacheKey, [problemId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt', 'updatedAt']));
  }

  /**
   * 设置详情缓存。
   * @param problemId problemId
   * @param data 详情数据
   */
  private async _setDetailCache(
    problemId: IProblemModel['problemId'],
    data: IMProblemDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [problemId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMProblemServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      problemId: opts.problemId,
      display: opts.display,
    });
    if (opts.title) {
      where.title = {
        [Op.like]: `%${opts.title}%`,
      };
    }
    if (opts.source) {
      where.source = {
        [Op.like]: `%${opts.source}%`,
      };
    }
    const authors = (opts.authors || []).filter(Boolean);
    if (authors.length > 0) {
      where.authors = {
        [Op.or]: authors.map((author) => ({ [Op.like]: `%${JSON.stringify(author)}%` })),
      };
    }
    if (opts.problemIds) {
      where.problemId = {
        [Op.in]: opts.problemIds,
      };
    }
    let include: any[] = [
      {
        model: this.tagModel,
        where: {
          hidden: false,
        },
        required: false,
      },
    ];
    if (Array.isArray(opts.tagIds) && opts.tagIds.length > 0) {
      include[0].where.tagId = {
        [Op.in]: opts.tagIds,
      };
      include[0].required = true;
    }
    return {
      where,
      include,
    };
  }

  /**
   * 获取题目列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMProblemServiceGetListOpt,
    pagination: IMProblemListPagination = {},
    scope: TProblemModelScopes | null = 'available',
  ): Promise<IMProblemServiceGetListRes> {
    const query = this._formatListQuery(options);
    return this.model
      .scope(scope || undefined)
      .findAndCountAll({
        // attributes: [[SequelizeFn('COUNT', SequelizeCol('ProblemModel.problem_id')), '_count']],
        attributes: problemLiteFields,
        where: query.where,
        include: query.include,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
        distinct: true,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => {
          const plain = d.get({ plain: true }) as IMProblemLite;
          // @ts-ignore
          plain.tags?.forEach((t) => delete t.ProblemTagModel);
          return plain;
        }),
      }));
  }

  /**
   * 获取题目详情。
   * @param problemId problemId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    problemId: IProblemModel['problemId'],
    scope: TProblemModelScopes | null = 'available',
  ): Promise<IMProblemServiceGetDetailRes> {
    let res: IMProblemServiceGetDetailRes = null;
    const cached = await this._getDetailCache(problemId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        // .scope(scope || undefined)
        .findOne({
          attributes: problemDetailFields,
          where: {
            problemId,
          },
          include: [
            {
              model: this.tagModel,
              where: {
                hidden: false,
              },
              required: false,
            },
          ],
        })
        .then((d) => {
          if (d) {
            const plain = d.get({ plain: true }) as IMProblemDetail;
            // @ts-ignore
            plain.tags?.forEach((t) => delete t.ProblemTagModel);
            return plain;
          }
          return d;
        });
      await this._setDetailCache(problemId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (scope === null || this.scopeChecker[scope](res)) {
      return res;
    }
    return null;
  }

  /**
   * 按 pk 关联查询题目详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getRelative(
    keys: IProblemModel['problemId'][],
    scope: TProblemModelScopes | null = 'available',
  ): Promise<IMProblemServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMProblemServiceGetRelativeRes = {};
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
          attributes: problemDetailFields,
          where: {
            problemId: {
              [Op.in]: uncached,
            },
          },
          include: [
            {
              model: this.tagModel,
              where: {
                hidden: false,
              },
              required: false,
            },
          ],
        })
        .then((r) =>
          r.map((d) => {
            const plain = d.get({ plain: true }) as IMProblemDetail;
            // @ts-ignore
            plain.tags?.forEach((t) => delete t.ProblemTagModel);
            return plain;
          }),
        );
      for (const d of dbRes) {
        res[d.problemId] = d;
        await this._setDetailCache(d.problemId, d);
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
   * 按条件查询题目详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMProblemServiceFindOneOpt,
    scope: TProblemModelScopes | null = 'available',
  ): Promise<IMProblemServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: problemDetailFields,
        where: options as any,
        include: [
          {
            model: this.tagModel,
            where: {
              hidden: false,
            },
            required: false,
          },
        ],
      })
      .then((d) => {
        if (d) {
          const plain = d.get({ plain: true }) as IMProblemDetail;
          // @ts-ignore
          plain.tags?.forEach((t) => delete t.ProblemTagModel);
          return plain;
        }
        return d;
      });
  }

  /**
   * 按条件查询题目是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMProblemServiceIsExistsOpt,
    scope: TProblemModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建题目。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMProblemServiceCreateOpt): Promise<IMProblemServiceCreateRes> {
    const res = await this.model.create(data);
    return res.problemId;
  }

  /**
   * 更新题目（部分更新）。
   * @param problemId problemId
   * @param data 更新数据
   */
  async update(
    problemId: IProblemModel['problemId'],
    data: IMProblemServiceUpdateOpt,
  ): Promise<IMProblemServiceUpdateRes> {
    const res = await this.model.update(
      {
        ...data,
        revision: literal('revision + 1'),
      },
      {
        where: {
          problemId,
        },
      },
    );
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param problemId problemId
   */
  async clearDetailCache(problemId: IProblemModel['problemId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [problemId]);
  }

  /**
   * 设置题目标签。
   * @param problemId problemId
   * @param tagIds tagIds
   */
  async setProblemTags(
    problemId: IProblemModel['problemId'],
    tagIds: ITagModel['tagId'][],
  ): Promise<void> {
    await this.problemTagModel.destroy({
      where: {
        problemId,
      },
    });
    await this.problemTagModel.bulkCreate(
      tagIds.map((tagId) => ({
        problemId,
        tagId,
      })),
    );
  }
}
