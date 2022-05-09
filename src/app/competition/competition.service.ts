import { provide, inject, Context, config } from 'midway';
import { Op } from 'sequelize';
import { CCompetitionMeta } from './competition.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { TCompetitionModel, TCompetitionModelScopes } from '@/lib/models/competition.model';
import {
  TMCompetitionLiteFields,
  TMCompetitionDetailFields,
  IMCompetitionLite,
  IMCompetitionDetail,
  ICompetitionModel,
  IMCompetitionServiceGetListOpt,
  IMCompetitionListPagination,
  IMCompetitionServiceGetListRes,
  IMCompetitionServiceGetDetailRes,
  IMCompetitionServiceGetRelativeRes,
  IMCompetitionServiceFindOneOpt,
  IMCompetitionServiceFindOneRes,
  IMCompetitionServiceIsExistsOpt,
  IMCompetitionServiceCreateOpt,
  IMCompetitionServiceCreateRes,
  IMCompetitionServiceUpdateOpt,
  IMCompetitionServiceUpdateRes,
  IMCompetitionServiceGetUserCompetitionsRes,
  IMCompetitionProblemDetail,
  IMCompetitionServiceGetCompetitionProblemsRes,
  TMCompetitionProblemDetailFields,
  IMCompetitionProblemLite,
  IMCompetitionServiceSetCompetitionProblemsOpt,
  // IMCompetitionServiceGetCompetitionUserListOpt,
  IMCompetitionUserListPagination,
  // IMCompetitionServiceGetCompetitionUserListRes,
  TMCompetitionUserLiteFields,
  TMCompetitionUserDetailFields,
  ICompetitionUserModel,
  IMCompetitionUserLite,
  IMCompetitionUserDetailPlain,
  IMCompetitionUserDetail,
  // IMCompetitionServiceGetCompetitionUserDetailRes,
  // IMCompetitionServiceFindOneCompetitionUserOpt,
  // IMCompetitionServiceFindOneCompetitionUserRes,
  // IMCompetitionServiceIsCompetitionUserExistsOpt,
  // IMCompetitionServiceCreateCompetitionUserOpt,
  // IMCompetitionServiceCreateCompetitionUserRes,
  // IMCompetitionServiceUpdateCompetitionUserOpt,
  // IMCompetitionServiceUpdateCompetitionUserRes,
  // IMCompetitionServiceGetRelativeCompetitionUserRes,
  // IMCompetitionServiceGetCompetitionUsersOpt,
  // IMCompetitionServiceGetCompetitionUsersRes,
  IMCompetitionServiceGetCompetitionProblemConfigRes,
  IMCompetitionServiceGetCompetitionUserListOpt,
  IMCompetitionServiceGetCompetitionUserListRes,
  IMCompetitionServiceGetCompetitionUsersOpt,
  IMCompetitionServiceGetCompetitionUsersRes,
  IMCompetitionServiceGetCompetitionUserDetailRes,
  IMCompetitionServiceFindOneCompetitionUserOpt,
  IMCompetitionServiceFindOneCompetitionUserRes,
  IMCompetitionServiceIsCompetitionUserExistsOpt,
  IMCompetitionServiceUpdateCompetitionUserOpt,
  IMCompetitionServiceUpdateCompetitionUserRes,
} from './competition.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { TUserModel } from '@/lib/models/user.model';
import { IUserModel } from '../user/user.interface';
import { TCompetitionProblemModel } from '@/lib/models/competitionProblem.model';
import { CProblemService } from '../problem/problem.service';
import { IProblemModel } from '../problem/problem.interface';
import { TCompetitionUserModel } from '@/lib/models/competitionUser.model';
import { CSolutionService } from '../solution/solution.service';
import { CUserService } from '../user/user.service';

export type CCompetitionService = CompetitionService;

const competitionLiteFields: Array<TMCompetitionLiteFields> = [
  'competitionId',
  'title',
  'startAt',
  'endAt',
  'ended',
  'isTeam',
  'registerStartAt',
  'registerEndAt',
  'createdBy',
  'hidden',
];

const competitionDetailFields: Array<TMCompetitionDetailFields> = [
  'competitionId',
  'title',
  'introduction',
  'startAt',
  'endAt',
  'ended',
  'isTeam',
  'registerStartAt',
  'registerEndAt',
  'createdBy',
  'hidden',
];

const competitionProblemDetailFields: Array<TMCompetitionProblemDetailFields> = ['problemId'];

const competitionUserLiteFields: Array<TMCompetitionUserLiteFields> = [
  'competitionId',
  'userId',
  'role',
  'status',
  'info',
  'password',
  'fieldShortName',
  'seatNo',
  'banned',
  'unofficialParticipation',
  'createdAt',
];

const competitionUserDetailFields: Array<TMCompetitionUserDetailFields> = [
  'competitionId',
  'userId',
  'role',
  'status',
  'info',
  'password',
  'fieldShortName',
  'seatNo',
  'banned',
  'unofficialParticipation',
  'createdAt',
];

const MEMBER_NUM = 3;

@provide()
export default class CompetitionService {
  @inject('competitionMeta')
  meta: CCompetitionMeta;

  @inject('competitionModel')
  model: TCompetitionModel;

  @inject()
  competitionProblemModel: TCompetitionProblemModel;

  @inject()
  competitionUserModel: TCompetitionUserModel;

  @inject()
  problemService: CProblemService;

  @inject()
  userService: CUserService;

  @inject()
  solutionService: CSolutionService;

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

  @config()
  durations: IDurationsConfig;

  scopeChecker = {
    available(data: Partial<ICompetitionModel> | null): boolean {
      return data?.hidden === false;
    },
  };

  /**
   * 获取详情缓存。
   * 如果缓存存在且值为 null，则返回 `''`；如果未找到缓存，则返回 `null`
   * @param competitionId competitionId
   */
  private async _getDetailCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionDetail | null | ''> {
    return this.ctx.helper
      .redisGet<IMCompetitionDetail>(this.meta.detailCacheKey, [competitionId])
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
   * @param competitionId competitionId
   * @param data 详情数据
   */
  private async _setDetailCache(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.meta.detailCacheKey,
      [competitionId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取比赛题目列表缓存。
   * @param competitionId competitionId
   */
  private async _getCompetitionProblemsCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionProblemDetail[] | null> {
    return this.ctx.helper.redisGet<IMCompetitionProblemDetail[]>(
      this.redisKey.competitionProblems,
      [competitionId],
    );
  }

  /**
   * 设置比赛题目列表缓存。
   * @param competitionId competitionId
   * @param data 列表数据
   */
  private async _setCompetitionProblemsCache(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionProblemDetail[] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionProblems,
      [competitionId],
      data,
      this.durations.cacheFullList,
    );
  }

  /**
   * 获取比赛用户详情缓存。
   * @param competitionId competitionId
   * @param userId userId
   */
  private async _getCompetitionUserDetailCache(
    competitionId: ICompetitionUserModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
  ): Promise<IMCompetitionUserDetailPlain | null | ''> {
    return this.ctx.helper.redisGet<IMCompetitionUserDetailPlain>(
      this.redisKey.competitionUserDetail,
      [competitionId, userId],
    );
  }

  /**
   * 设置比赛用户详情缓存。
   * @param competitionId competitionId
   * @param userId userId
   * @param data 详情数据
   */
  private async _setCompetitionUserDetailCache(
    competitionId: ICompetitionUserModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
    data: IMCompetitionUserDetailPlain | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionUserDetail,
      [competitionId, userId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  private _formatListQuery(opts: IMCompetitionServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      competitionId: opts.competitionId,
      isTeam: opts.isTeam,
      createdBy: opts.createdBy,
      // hidden: opts.hidden,
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

  private _formatCompetitionUserListQuery(opts: IMCompetitionServiceGetCompetitionUserListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      userId: opts.userId,
      role: opts.role,
      status: opts.status,
      banned: opts.banned,
    });
    // if (opts.nickname) {
    //   where.info = {
    //     [Op.like]: `"nickname":"%${opts.nickname}%"`,
    //   };
    // }
    return {
      where,
    };
  }

  private _parseCompetitionUser<T>(data: Partial<ICompetitionUserModel>): T {
    const res: any = { ...data };
    return this.utils.misc.ignoreUndefined(res) as T;
  }

  // private _formatCompetitionUser<T>(data: Partial<IMCompetitionUserDetailPlain>): T {
  //   const res: any = { ...data };
  //   for (let i = 1; i <= MEMBER_NUM; ++i) {
  //     memberFields.forEach((field) => {
  //       const key = `${field}${i}`;
  //       res[key] = res.members?.[i - 1]?.[field];
  //     });
  //   }
  //   delete res.members;
  //   return this.utils.misc.ignoreUndefined(res) as T;
  // }

  // private async _handleRelativeCompetitionUserData(
  //   data: IMCompetitionUserDetailPlain[],
  // ): Promise<IMCompetitionUserDetail[]> {
  //   const usernames = data.map((d) => d.username).filter((f) => f);
  //   const username2userIdMap = await this.userService.getUserIdsByUsernames(usernames);
  //   const userIds = Object.values(username2userIdMap);
  //   const relativeUser = await this.userService.getRelative(userIds, null);
  //   return data.map((d) => {
  //     const user = relativeUser[username2userIdMap[d.username]];
  //     return {
  //       ...d,
  //       globalUserId: user?.userId,
  //       rating: user?.rating || 0,
  //     };
  //   });
  // }

  /**
   * 获取比赛列表。
   * @param options 查询参数
   * @param pagination 分页参数
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getList(
    options: IMCompetitionServiceGetListOpt,
    pagination: IMCompetitionListPagination = {},
    scope: TCompetitionModelScopes | null = 'available',
  ): Promise<IMCompetitionServiceGetListRes> {
    const query = this._formatListQuery(options);
    return this.model
      .scope(scope || undefined)
      .findAndCountAll({
        attributes: competitionLiteFields,
        where: query.where,
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMCompetitionLite),
      }));
  }

  /**
   * 获取比赛详情。
   * @param competitionId competitionId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    competitionId: ICompetitionModel['competitionId'],
    scope: TCompetitionModelScopes | null = 'available',
  ): Promise<IMCompetitionServiceGetDetailRes> {
    let res: IMCompetitionServiceGetDetailRes = null;
    const cached = await this._getDetailCache(competitionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        // .scope(scope || undefined)
        .findOne({
          attributes: competitionDetailFields,
          where: {
            competitionId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMCompetitionDetail));
      await this._setDetailCache(competitionId, res);
    }
    // 使用缓存，业务上自己处理 scope
    if (scope === null || this.scopeChecker[scope](res)) {
      return res;
    }
    return null;
  }

  /**
   * 按 pk 关联查询比赛详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getRelative(
    keys: ICompetitionModel['competitionId'][],
    scope: TCompetitionModelScopes | null = 'available',
  ): Promise<IMCompetitionServiceGetRelativeRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMCompetitionServiceGetRelativeRes = {};
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
          attributes: competitionDetailFields,
          where: {
            competitionId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionDetail));
      for (const d of dbRes) {
        res[d.competitionId] = d;
        await this._setDetailCache(d.competitionId, d);
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
   * 按条件查询比赛详情。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async findOne(
    options: IMCompetitionServiceFindOneOpt,
    scope: TCompetitionModelScopes | null = 'available',
  ): Promise<IMCompetitionServiceFindOneRes> {
    return this.model
      .scope(scope || undefined)
      .findOne({
        attributes: competitionDetailFields,
        where: options as any,
      })
      .then((d) => d && (d.get({ plain: true }) as IMCompetitionDetail));
  }

  /**
   * 按条件查询比赛是否存在。
   * @param options 查询参数
   * @param scope 查询 scope
   */
  async isExists(
    options: IMCompetitionServiceIsExistsOpt,
    scope: TCompetitionModelScopes | null = 'available',
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
  async create(data: IMCompetitionServiceCreateOpt): Promise<IMCompetitionServiceCreateRes> {
    const res = await this.model.create(data);
    return res.competitionId;
  }

  /**
   * 更新比赛（部分更新）。
   * @param competitionId competitionId
   * @param data 更新数据
   */
  async update(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionServiceUpdateOpt,
  ): Promise<IMCompetitionServiceUpdateRes> {
    const res = await this.model.update(data, {
      where: {
        competitionId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除详情缓存。
   * @param competitionId competitionId
   */
  async clearDetailCache(competitionId: ICompetitionModel['competitionId']): Promise<void> {
    return this.ctx.helper.redisDel(this.meta.detailCacheKey, [competitionId]);
  }

  /**
   * 获取比赛题目列表。
   * @param competitionId competitionId
   */
  async getCompetitionProblems(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionServiceGetCompetitionProblemsRes> {
    let res: IMCompetitionServiceGetCompetitionProblemsRes['rows'] | null = null;
    const cached = await this._getCompetitionProblemsCache(competitionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      const dbRes = await this.competitionProblemModel
        .findAll({
          attributes: competitionProblemDetailFields,
          where: {
            competitionId,
          },
          order: [['index', 'ASC']],
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionProblemLite));
      const problemIds = dbRes.map((d) => d.problemId);
      const relativeProblems = await this.problemService.getRelative(problemIds, null);
      res = dbRes.map((d) => {
        const problem = relativeProblems[d.problemId] || {};
        delete problem.tags;
        return {
          ...d,
          ...problem,
        };
      });
      await this._setCompetitionProblemsCache(competitionId, res);
    }
    res = res || [];
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 获取比赛题目配置。
   * @param competitionId competitionId
   */
  async getCompetitionProblemConfig(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionServiceGetCompetitionProblemConfigRes> {
    const res = await this.competitionProblemModel
      .findAll({
        attributes: competitionProblemDetailFields,
        where: {
          competitionId,
        },
        order: [['index', 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionProblemLite));
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 判断指定题目是否在指定比赛的题目列表中。
   * @param problemId problemId
   * @param competitionId competitionId
   */
  async isProblemInCompetition(
    problemId: IProblemModel['problemId'],
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<boolean> {
    const problems = await this.getCompetitionProblems(competitionId);
    return !!problems.rows.find((problem) => problem.problemId === problemId);
  }

  /**
   * 设置比赛题目。
   * @param competitionId competitionId
   * @param problems 比赛题目列表
   */
  async setCompetitionProblems(
    competitionId: ICompetitionModel['competitionId'],
    problems: IMCompetitionServiceSetCompetitionProblemsOpt,
  ) {
    await this.competitionProblemModel.destroy({
      where: {
        competitionId,
      },
    });
    await this.competitionProblemModel.bulkCreate(
      problems.map((problem, index) => ({
        competitionId,
        problemId: problem.problemId,
        index,
      })),
    );
  }

  /**
   * 清除比赛题目列表缓存。
   * @param competitionId competitionId
   */
  async clearCompetitionProblemsCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.competitionProblems, [competitionId]);
  }

  /**
   * 获取指定题目被加入到的所有比赛。
   * @param problemId problemId
   * @returns competitionId 列表
   */
  async getAllCompetitionIdsByProblemId(
    problemId: IProblemModel['problemId'],
  ): Promise<ICompetitionModel['competitionId'][]> {
    return this.competitionProblemModel
      .findAll({
        attributes: ['competitionId'],
        where: {
          problemId,
        },
      })
      .then((r) => r.map((d) => d.competitionId));
  }

  /**
   * 获取比赛用户列表。
   * @param competitionId competitionId
   * @param options 查询参数
   * @param pagination 分页参数
   */
  async getCompetitionUserList(
    competitionId: ICompetitionModel['competitionId'],
    options: IMCompetitionServiceGetCompetitionUserListOpt,
    pagination: IMCompetitionUserListPagination = {},
  ): Promise<IMCompetitionServiceGetCompetitionUserListRes> {
    const query = this._formatCompetitionUserListQuery(options);
    return this.competitionUserModel
      .findAndCountAll({
        attributes: competitionUserLiteFields,
        where: {
          ...query.where,
          competitionId,
        },
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => {
          const plain = d.get({ plain: true });
          return this._parseCompetitionUser<IMCompetitionUserLite>(plain);
        }),
      }));
  }

  /**
   * 获取全部比赛用户。
   * @param competitionId competitionId
   */
  async getCompetitionUsers(
    competitionId: ICompetitionModel['competitionId'],
    options: IMCompetitionServiceGetCompetitionUsersOpt,
  ): Promise<IMCompetitionServiceGetCompetitionUsersRes> {
    // TODO 缓存
    const res = await this.competitionUserModel
      .findAll({
        attributes: competitionUserDetailFields,
        where: this.utils.misc.ignoreUndefined({
          competitionId,
          role: options.role,
          status: options.status,
          banned: options.banned,
          fieldShortName: options.fieldShortName,
          seatNo: options.seatNo,
        }),
        order: [['createdAt', 'ASC']],
      })
      .then((r) =>
        r.map((d) => {
          const plain = d.get({ plain: true });
          return this._parseCompetitionUser<IMCompetitionUserDetailPlain>(plain);
        }),
      );
    return {
      count: res.length,
      // rows: await this._handleRelativeCompetitionUserData(res),
      rows: res,
    };
  }

  /**
   * 获取比赛用户详情。
   * @param competitionId competitionId
   * @param userId userId
   */
  async getCompetitionUserDetail(
    competitionId: ICompetitionUserModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
  ): Promise<IMCompetitionServiceGetCompetitionUserDetailRes> {
    let res: IMCompetitionServiceGetCompetitionUserDetailRes = null;
    const cached = await this._getCompetitionUserDetailCache(competitionId, userId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.competitionUserModel
        .findOne({
          attributes: competitionUserDetailFields,
          where: {
            competitionId,
            userId,
          },
        })
        .then(
          (d) =>
            d && this._parseCompetitionUser<IMCompetitionUserDetailPlain>(d.get({ plain: true })),
        );
      await this._setCompetitionUserDetailCache(competitionId, userId, res);
    }
    if (!res) {
      return null;
    }
    // const [ret] = await this._handleRelativeCompetitionUserData([res]);
    // return ret;
    return res;
  }

  // /**
  //  * 按 pk 关联查询比赛用户详情。
  //  * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
  //  * @param keys 要关联查询的 pk 列表
  //  */
  // async getRelativeCompetitionUser(
  //   keys: ICompetitionUserModel['competitionUserId'][],
  // ): Promise<IMCompetitionServiceGetRelativeCompetitionUserRes> {
  //   const ks = this.lodash.uniq(keys);
  //   const res: IMCompetitionServiceGetRelativeCompetitionUserRes = {};
  //   let uncached: typeof keys = [];
  //   for (const k of ks) {
  //     const cached = await this._getCompetitionUserDetailCache(k);
  //     if (cached) {
  //       res[k] = cached;
  //     } else if (cached === null) {
  //       uncached.push(k);
  //     }
  //   }
  //   if (uncached.length) {
  //     const dbRes = await this.competitionUserModel
  //       .findAll({
  //         attributes: competitionUserDetailFields,
  //         where: {
  //           competitionUserId: {
  //             [Op.in]: uncached,
  //           },
  //         },
  //       })
  //       .then((r) =>
  //         r.map((d) =>
  //           this._parseCompetitionUser<IMCompetitionUserDetailPlain>(d.get({ plain: true })),
  //         ),
  //       );
  //     for (const d of dbRes) {
  //       res[d.competitionUserId] = d;
  //       await this._setCompetitionUserDetailCache(d.competitionUserId, d);
  //     }
  //     for (const k of ks) {
  //       !res[k] && (await this._setCompetitionUserDetailCache(k, null));
  //     }
  //   }
  //   const resIds = Object.keys(res).map((id) => +id);
  //   const handled = await this._handleRelativeCompetitionUserData(resIds.map((id) => res[id]));
  //   resIds.forEach((id, index) => {
  //     res[id] = handled[index];
  //   });
  //   return res;
  // }

  /**
   * 按条件查询比赛用户详情。
   * @param competitionId competitionId
   * @param options 查询参数
   */
  async findOneCompetitionUser(
    competitionId: ICompetitionModel['competitionId'],
    options: IMCompetitionServiceFindOneCompetitionUserOpt,
  ): Promise<IMCompetitionServiceFindOneCompetitionUserRes> {
    const res = await this.competitionUserModel
      .findOne({
        attributes: competitionUserDetailFields,
        where: {
          ...options,
          competitionId,
        } as any,
      })
      .then(
        (d) =>
          d && this._parseCompetitionUser<IMCompetitionUserDetailPlain>(d.get({ plain: true })),
      );
    if (!res) {
      return null;
    }
    // const [ret] = await this._handleRelativeCompetitionUserData([res]);
    // return ret;
    return res;
  }

  /**
   * 按条件查询比赛用户是否存在。
   * @param competitionId competitionId
   * @param options 查询参数
   */
  async isCompetitionUserExists(
    competitionId: ICompetitionUserModel['competitionId'],
    options: IMCompetitionServiceIsCompetitionUserExistsOpt,
  ): Promise<boolean> {
    const res = await this.competitionUserModel.findOne({
      attributes: ['competitionId', 'userId'],
      where: {
        ...options,
        competitionId,
      } as any,
    });
    return !!res;
  }

  // /**
  //  * 创建比赛用户。
  //  * @param competitionId competitionId
  //  * @param data 创建数据
  //  * @returns 创建成功的 competitionUserId
  //  */
  // async createCompetitionUser(
  //   competitionId: ICompetitionModel['competitionId'],
  //   data: IMCompetitionServiceCreateCompetitionUserOpt,
  // ): Promise<IMCompetitionServiceCreateCompetitionUserRes> {
  //   const res = await this.competitionUserModel.create({
  //     ...this._formatCompetitionUser(data),
  //     competitionId,
  //   });
  //   return res.competitionUserId;
  // }

  /**
   * 更新比赛用户（部分更新）。
   * @param competitionId competitionId
   * @param userId userId
   * @param data 更新数据
   */
  async updateCompetitionUser(
    competitionId: ICompetitionUserModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
    data: IMCompetitionServiceUpdateCompetitionUserOpt,
  ): Promise<IMCompetitionServiceUpdateCompetitionUserRes> {
    const res = await this.competitionUserModel.update(data, {
      where: {
        competitionId,
        userId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除比赛用户详情缓存。
   * @param competitionId competitionId
   * @param userId userId
   */
  async clearCompetitionUserDetailCache(
    competitionId: ICompetitionUserModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.competitionUserDetail, [competitionId, userId]);
  }
}
