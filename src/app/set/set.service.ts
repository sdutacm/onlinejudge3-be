import { provide, inject, Context, config } from 'midway';
import { CSetMeta } from './set.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TSetModel, TSetModelScopes } from '@/lib/models/set.model';
import {
  TMSetLiteFields,
  TMSetDetailFields,
  ISetModel,
  IMSetServiceGetListOpt,
  IMSetServiceGetListRes,
  IMSetServiceIsExistsOpt,
  IMSetServiceCreateOpt,
  IMSetServiceCreateRes,
  IMSetServiceUpdateOpt,
  IMSetServiceUpdateRes,
  IMSetServiceGetDetailRes,
  IMSetServiceFindOneOpt,
  IMSetServiceFindOneRes,
  IMSetListPagination,
  IMSetLitePlain,
  IMSetDetailPlain,
  IMSetRelativeUser,
  IMSetServiceGetRelativeRes,
  ISetProps,
  ISetPropsSectionProblemItem,
} from './set.interface';
import { Op } from 'sequelize';
import { IUtils } from '@/utils';
import { CUserService } from '../user/user.service';
import { ILodash } from '@/utils/libs/lodash';
import { IProblemModel } from '../problem/problem.interface';
import { CProblemService } from '../problem/problem.service';

export type CSetService = SetService;

const setLiteFields: Array<TMSetLiteFields> = [
  'setId',
  'userId',
  'title',
  'type',
  'createdAt',
  'updatedAt',
  'hidden',
];

const setDetailFields: Array<TMSetDetailFields> = [
  'setId',
  'userId',
  'title',
  'description',
  'type',
  'props',
  'createdAt',
  'updatedAt',
  'hidden',
];

@provide()
export default class SetService {
  @inject('setMeta')
  meta: CSetMeta;

  @inject('setModel')
  model: TSetModel;

  @inject()
  userService: CUserService;

  @inject()
  problemService: CProblemService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  scopeChecker = {
    available(data: Partial<ISetModel> | null): boolean {
      return data?.hidden === false;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param setId setId
   */
  private async _getDetailCache(setId: ISetModel['setId']): Promise<IMSetDetailPlain | null | ''> {
    return this.ctx.helper
      .redisGet<IMSetDetailPlain>(this.meta.detailCacheKey, [setId])
      .then((res) => this.utils.misc.processDateFromJson(res, ['createdAt']));
  }

  /**
   * 设置详情缓存。
   * @param setId setId
   * @param data 详情数据
   */
  private async _setDetailCache(
    setId: ISetModel['setId'],
    data: IMSetDetailPlain | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [setId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMSetServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      setId: opts.setId,
      userId: opts.userId,
      type: opts.type,
    });
    if (opts.title) {
      where.title = {
        [Op.like]: `%${opts.title}%`,
      };
    }
    return {
      where,
    };
  }

  private async _handleRelativeData<T extends IMSetLitePlain>(
    data: T[],
  ): Promise<
    Array<
      Omit<T, 'userId'> & {
        user?: IMSetRelativeUser;
      }
    >
  > {
    const userIds = data.map((d) => d.userId);
    const problemIds = data.reduce((acc, d) => {
      // @ts-ignore
      const props = d.props as ISetProps | undefined;
      if (!props) {
        return [];
      }
      const sections = props.sections;
      const ids = sections.reduce((ids, section) => {
        return [
          ...ids,
          ...section.problems
            .map((problem) => (problem.title ? 0 : problem.problemId))
            .filter((f) => f), // 已设置自定义 title 的不需要再去拉 title
        ];
      }, [] as IProblemModel['problemId'][]);
      return [...acc, ...ids];
    }, [] as IProblemModel['problemId'][]);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    const relativeProblems = await this.problemService.getRelative(problemIds, null);
    return data.map((d) => {
      const user = relativeUsers[d.userId];
      // @ts-ignore
      const props = d.props as ISetProps | undefined;
      let handledProps: typeof props;
      if (props) {
        const sections = props.sections;
        handledProps = {
          ...props,
          sections: sections.map((section) => ({
            ...section,
            problems: section.problems.map((problem) => {
              if (problem.title) {
                return {
                  ...problem,
                };
              } else {
                return {
                  ...problem,
                  title: relativeProblems[problem.problemId]?.title || '',
                };
              }
            }),
          })),
        };
      }
      return this.utils.misc.ignoreUndefined({
        ...this.lodash.omit(d, ['userId']),
        user: user
          ? {
              userId: user.userId,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
              bannerImage: user.bannerImage,
            }
          : undefined,
        props: handledProps,
      });
    });
  }

  /**
   * 获取 set 中扁平化的题目列表。
   * @param props set props
   */
  getFlatProblems(props: ISetProps): ISetPropsSectionProblemItem[] {
    return props.sections.reduce((problems, section) => {
      return [...problems, ...section.problems];
    }, [] as ISetPropsSectionProblemItem[]);
  }

  /**
   * 获取题目集列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMSetServiceGetListOpt,
    pagination: IMSetListPagination = {},
    scope: TSetModelScopes | null = 'available',
  ): Promise<IMSetServiceGetListRes> {
    const query = this._formatListQuery(options);
    const res = await this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: setLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMSetLitePlain),
      }));
    return {
      ...res,
      rows: await this._handleRelativeData(res.rows),
    };
  }

  /**
   * 获取题目集详情。
   * @param setId setaId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    setId: ISetModel['setId'],
    scope: TSetModelScopes | null = 'available',
  ): Promise<IMSetServiceGetDetailRes> {
    let res: IMSetDetailPlain | null = null;
    const cached = await this._getDetailCache(setId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        .scope(scope || undefined)
        .findOne({
          attributes: setDetailFields,
          where: {
            setId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMSetDetailPlain));
      await this._setDetailCache(setId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (res && (scope === null || this.scopeChecker[scope](res))) {
      const [ret] = await this._handleRelativeData([res]);
      return ret;
    }
    return null;
  }

  /**
   * 按 pk 关联查询题目集详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getRelative(
    keys: ISetModel['setId'][],
    scope: TSetModelScopes | null = 'available',
  ): Promise<IMSetServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: Record<ISetModel['setId'], IMSetDetailPlain> = {};
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
          attributes: setDetailFields,
          where: {
            setId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMSetDetailPlain));
      for (const d of dbRes) {
        res[d.setId] = d;
        await this._setDetailCache(d.setId, d);
      }
      // 查不到的也要缓存
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
    // 处理 relative
    // @ts-ignore
    const ids = Object.keys(res) as number[];
    const resArr = ids.map((k: number) => res[k]);
    const handledResArr = await this._handleRelativeData(resArr);
    const handledRes: IMSetServiceGetRelativeRes = {};
    ids.forEach((k, index) => {
      handledRes[k] = handledResArr[index];
    });
    return handledRes;
  }

  /**
   * 按条件查询题目集详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMSetServiceFindOneOpt,
    scope: TSetModelScopes | null = 'available',
  ): Promise<IMSetServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: setDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMSetDetailPlain));
  }

  /**
   * 按条件查询题目集是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMSetServiceIsExistsOpt,
    scope: TSetModelScopes | null = 'available',
  ): Promise<boolean> {
    const res = await this.model.scope(scope || undefined).findOne({
      attributes: [this.meta.pk],
      where: options as any,
    });
    return !!res;
  }

  /**
   * 创建题目集。
   * @param data 创建数据
   * @returns 创建成功的主键 ID
   */
  async create(data: IMSetServiceCreateOpt): Promise<IMSetServiceCreateRes> {
    const res = await this.model.create(data);
    return res.setId;
  }

  /**
   * 更新题目集（部分更新）。
   * @param setId setId
   * @param data 更新数据
   */
  async update(
    setId: ISetModel['setId'],
    data: IMSetServiceUpdateOpt,
  ): Promise<IMSetServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        setId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param setId setId
   */
  async clearDetailCache(setId: ISetModel['setId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [setId]);
  }

  async getAll(): Promise<IMSetDetailPlain[]> {
    return this.model
      .findAll({
        order: [['setId', 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMSetDetailPlain));
  }
}
