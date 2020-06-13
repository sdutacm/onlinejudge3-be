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
} from './problem.interface';
import { TTagModel } from '@/lib/models/tag.model';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';

export type CProblemService = ProblemService;

const problemLiteFields: Array<TMProblemLiteFields> = [
  'problemId',
  'title',
  'source',
  'author',
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
  'sampleInput',
  'sampleOutput',
  'hint',
  'source',
  'author',
  'timeLimit',
  'memoryLimit',
  'difficulty',
  'createdAt',
  'updatedAt',
  'accepted',
  'submitted',
  'spj',
  'display',
];

@provide()
export default class ProblemService {
  @inject('problemMeta')
  meta: CProblemMeta;

  @inject('problemModel')
  model: TProblemModel;

  @inject()
  tagModel: TTagModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @config()
  redisKey: IRedisKeyConfig;

  @config('durations')
  durations: IDurationsConfig;

  private _formatListQuery(opts: IMProblemServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      problemId: opts.problemId,
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
    if (opts.author) {
      where.author = {
        [Op.like]: `%${opts.author}%`,
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
    if (opts.tagIds) {
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
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param problemId problemId
   */
  private async _getDetailCache(
    problemId: IProblemModel['problemId'],
  ): Promise<IMProblemDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMProblemDetail>(this.meta.detailCacheKey, [problemId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
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
   * 只有默认 scope 的查询会缓存
   * @param problemId problemId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    problemId: IProblemModel['problemId'],
    scope: TProblemModelScopes | null = 'available',
  ): Promise<IMProblemServiceGetDetailRes> {
    let res: IMProblemServiceGetDetailRes = null;
    const cached = scope === 'available' ? await this._getDetailCache(problemId) : null;
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope(scope || undefined)
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
      scope === 'available' && (await this._setDetailCache(problemId, res));
    }
    return res;
  }
}
