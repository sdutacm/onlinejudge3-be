import { provide, inject, Context, config, scope } from 'midway';
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
  IMContestServiceGetUserContestsRes,
  IMContestProblemDetail,
  IMContestServiceGetContestProblemsRes,
  TMContestProblemDetailFields,
  IMContestProblemLite,
  IMContestServiceSetContestProblemsOpt,
  IMContestServiceGetContestUserListOpt,
  IMContestUserListPagination,
  IMContestServiceGetContestUserListRes,
  TMContestUserLiteFields,
  TMContestUserDetailFields,
  IContestUserModel,
  IMContestUserLite,
  IMContestUserDetail,
  IMContestServiceGetContestUserDetailRes,
  IMContestServiceFindOneContestUserOpt,
  IMContestServiceFindOneContestUserRes,
  IMContestServiceIsContestUserExistsOpt,
  IMContestServiceCreateContestUserOpt,
  IMContestServiceCreateContestUserRes,
  IMContestServiceUpdateContestUserOpt,
  IMContestServiceUpdateContestUserRes,
} from './contest.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { TUserContestModel } from '@/lib/models/userContest.model';
import { TUserModel } from '@/lib/models/user.model';
import { IUserModel } from '../user/user.interface';
import { TContestProblemModel } from '@/lib/models/contestProblem.model';
import { CProblemService } from '../problem/problem.service';
import { IProblemModel } from '../problem/problem.interface';
import { TContestUserModel } from '@/lib/models/contestUser.model';

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

const contestProblemDetailFields: Array<TMContestProblemDetailFields> = ['problemId', 'title'];

const contestUserLiteFields: Array<TMContestUserLiteFields> = [
  'contestUserId',
  'username',
  'nickname',
  'subname',
  'avatar',
  'status',
  'unofficial',
  'name1',
  'school1',
  'college1',
  'major1',
  'class1',
  'name2',
  'school2',
  'college2',
  'major2',
  'class2',
  'name3',
  'school3',
  'college3',
  'major3',
  'class3',
  'createdAt',
];

const contestUserDetailFields: Array<TMContestUserDetailFields> = [
  'contestUserId',
  'username',
  'nickname',
  'subname',
  'avatar',
  'status',
  'unofficial',
  'password',
  'sitNo',
  'schoolNo1',
  'name1',
  'school1',
  'college1',
  'major1',
  'class1',
  'tel1',
  'email1',
  'clothing1',
  'schoolNo2',
  'name2',
  'school2',
  'college2',
  'major2',
  'class2',
  'tel2',
  'email2',
  'clothing2',
  'schoolNo3',
  'name3',
  'school3',
  'college3',
  'major3',
  'class3',
  'tel3',
  'email3',
  'clothing3',
  'createdAt',
];

const MEMBER_NUM = 3;

const memberFields = [
  'schoolNo',
  'name',
  'school',
  'college',
  'major',
  'class',
  'tel',
  'email',
  'clothing',
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
  contestProblemModel: TContestProblemModel;

  @inject()
  contestUserModel: TContestUserModel;

  @inject()
  problemService: CProblemService;

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

  scopeChecker = {
    available(data: Partial<IContestModel> | null): boolean {
      return data?.hidden === false;
    },
  };

  private _isDataScopeAvailable(data: Partial<IContestModel> | null) {
    return data?.hidden === false;
  }

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

  /**
   * 获取用户比赛列表缓存。
   * @param userId userId
   */
  private async _getUserContestsCache(
    userId: IUserModel['userId'],
  ): Promise<IContestModel['contestId'][] | null> {
    return this.ctx.helper.redisGet<IContestModel['contestId'][]>(this.redisKey.userContests, [
      userId,
    ]);
  }

  /**
   * 设置用户比赛列表缓存。
   * @param userId userId
   * @param data 列表数据
   */
  private async _setUserContestsCache(
    userId: IUserModel['userId'],
    data: IContestModel['contestId'][] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.userContests,
      [userId],
      data,
      this.durations.cacheFullList,
    );
  }

  /**
   * 获取比赛题目列表缓存。
   * @param contestId contestId
   */
  private async _getContestProblemsCache(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestProblemDetail[] | null> {
    return this.ctx.helper.redisGet<IMContestProblemDetail[]>(this.redisKey.contestProblems, [
      contestId,
    ]);
  }

  /**
   * 设置比赛题目列表缓存。
   * @param contestId contestId
   * @param data 列表数据
   */
  private async _setContestProblemsCache(
    contestId: IContestModel['contestId'],
    data: IMContestProblemDetail[] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.contestProblems,
      [contestId],
      data,
      this.durations.cacheFullList,
    );
  }

  /**
   * 获取比赛用户详情缓存。
   * @param contestId contestId
   */
  private async _getContestUserDetailCache(
    contestUserId: IContestUserModel['contestUserId'],
  ): Promise<IMContestUserDetail | null | ''> {
    return this.ctx.helper.redisGet<IMContestUserDetail>(this.redisKey.contestUserDetail, [
      contestUserId,
    ]);
  }

  /**
   * 设置比赛用户详情缓存。
   * @param contestUserId contestUserId
   * @param data 详情数据
   */
  private async _setContestUserDetailCache(
    contestUserId: IContestUserModel['contestUserId'],
    data: IMContestUserDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.contestUserDetail,
      [contestUserId],
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

  private _formatContestUserListQuery(opts: IMContestServiceGetContestUserListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      contestUserId: opts.contestUserId,
      username: opts.username,
    });
    if (opts.nickname) {
      where.nickname = {
        [Op.like]: `%${opts.nickname}%`,
      };
    }
    return {
      where,
    };
  }

  private _parseContestUser<T>(data: Partial<IContestUserModel>): T {
    const res: any = { ...data };
    const members = [];
    for (let i = 1; i <= MEMBER_NUM; ++i) {
      const member: any = {};
      memberFields.forEach((field) => {
        const key = `${field}${i}`;
        // @ts-ignore
        member[field] = res[key];
        // @ts-ignore
        delete res[key];
      });
      members.push(member);
    }
    res.members = members;
    return this.utils.misc.ignoreUndefined(res) as T;
  }

  private _formatContestUser<T>(data: Partial<IMContestUserDetail>): T {
    const res: any = { ...data };
    for (let i = 1; i <= MEMBER_NUM; ++i) {
      memberFields.forEach((field) => {
        const key = `${field}${i}`;
        res[key] = res.members[i - 1]?.[field];
      });
    }
    delete res.members;
    return this.utils.misc.ignoreUndefined(res) as T;
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
   * @param contestId contestId
   * @param scope 查询 scope，默认 available，如查询全部则传 null
   */
  async getDetail(
    contestId: IContestModel['contestId'],
    scope: TContestModelScopes | null = 'available',
  ): Promise<IMContestServiceGetDetailRes> {
    let res: IMContestServiceGetDetailRes = null;
    const cached = await this._getDetailCache(contestId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.model
        // .scope(scope || undefined)
        .findOne({
          attributes: contestDetailFields,
          where: {
            contestId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMContestDetail));
      await this._setDetailCache(contestId, res);
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

  /**
   * 获取用户比赛列表。
   * @param userId userId
   */
  async getUserContests(userId: IUserModel['userId']): Promise<IMContestServiceGetUserContestsRes> {
    let res: IMContestServiceGetUserContestsRes['rows'] | null = null;
    const cached = await this._getUserContestsCache(userId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.userContestModel
        .findAll({
          attributes: ['contestId'],
          where: {
            userId,
          },
        })
        .then((r) => r.map((d) => d.contestId));
      await this._setUserContestsCache(userId, res);
    }
    res = res || [];
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 添加用户比赛。
   * @param userId userId
   * @param contestId contestId
   */
  async addUserContest(
    userId: IUserModel['userId'],
    contestId: IContestModel['contestId'],
  ): Promise<void> {
    await this.userContestModel.create({
      userId,
      contestId,
    });
  }

  /**
   * 清除用户比赛列表缓存。
   * @param userId userId
   */
  async clearUserContestsCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.userContests, [userId]);
  }

  /**
   * 获取比赛题目列表。
   * @param contestId contestId
   */
  async getContestProblems(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestServiceGetContestProblemsRes> {
    let res: IMContestServiceGetContestProblemsRes['rows'] | null = null;
    const cached = await this._getContestProblemsCache(contestId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      const dbRes = await this.contestProblemModel
        .findAll({
          attributes: contestProblemDetailFields,
          where: {
            contestId,
          },
          order: [['index', 'ASC']],
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMContestProblemLite));
      const problemIds = dbRes.map((d) => d.problemId);
      const relativeProblems = await this.problemService.getRelative(problemIds, null);
      res = dbRes.map((d) => {
        const problem = relativeProblems[d.problemId] || {};
        delete problem.tags;
        return {
          ...d,
          ...problem,
          title: d.title || problem.title || '',
        };
      });
      await this._setContestProblemsCache(contestId, res);
    }
    res = res || [];
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 设置比赛题目。
   * @param contestId contestId
   * @param problems 比赛题目列表
   */
  async setContestProblems(
    contestId: IContestModel['contestId'],
    problems: IMContestServiceSetContestProblemsOpt,
  ) {
    await this.contestProblemModel.destroy({
      where: {
        contestId,
      },
    });
    await this.contestProblemModel.bulkCreate(
      problems.map((problem, index) => ({
        contestId,
        problemId: problem.problemId,
        title: problem.title,
        index,
      })),
    );
  }

  /**
   * 清除比赛题目列表缓存。
   * @param contestId contestId
   */
  async clearContestProblemsCache(contestId: IContestModel['contestId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.contestProblems, [contestId]);
  }

  /**
   * 获取指定题目被加入到的所有比赛。
   * @param problemId problemId
   * @returns contestId 列表
   */
  async getAllContestIdsByProblemId(
    problemId: IProblemModel['problemId'],
  ): Promise<IContestModel['contestId'][]> {
    return this.contestProblemModel
      .findAll({
        attributes: ['contestId'],
        where: {
          problemId,
        },
      })
      .then((r) => r.map((d) => d.contestId));
  }

  /**
   * 获取比赛用户列表。
   * @param contestId contestId
   * @param options 查询参数
   * @param pagination 分页参数
   */
  async getContestUserList(
    contestId: IContestModel['contestId'],
    options: IMContestServiceGetContestUserListOpt,
    pagination: IMContestUserListPagination = {},
  ): Promise<IMContestServiceGetContestUserListRes> {
    const query = this._formatContestUserListQuery(options);
    return this.contestUserModel
      .findAndCountAll({
        attributes: contestUserLiteFields,
        where: {
          ...query.where,
          contestId,
        },
        limit: pagination.limit,
        offset: pagination.offset,
        order: pagination.order,
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => {
          const plain = d.get({ plain: true });
          return this._parseContestUser<IMContestUserLite>(plain);
        }),
      }));
  }

  /**
   * 获取比赛用户详情。
   * @param contestUserId contestUserId
   */
  async getContestUserDetail(
    contestUserId: IContestUserModel['contestUserId'],
  ): Promise<IMContestServiceGetContestUserDetailRes> {
    let res: IMContestServiceGetContestUserDetailRes = null;
    const cached = await this._getContestUserDetailCache(contestUserId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.contestUserModel
        .findOne({
          attributes: contestUserDetailFields,
          where: {
            contestUserId,
          },
        })
        .then((d) => d && this._parseContestUser<IMContestUserDetail>(d.get({ plain: true })));
      await this._setContestUserDetailCache(contestUserId, res);
    }
    return res;
  }

  /**
   * 按条件查询比赛用户详情。
   * @param contestId contestId
   * @param options 查询参数
   */
  async findOneContestUser(
    contestId: IContestModel['contestId'],
    options: IMContestServiceFindOneContestUserOpt,
  ): Promise<IMContestServiceFindOneContestUserRes> {
    return this.contestUserModel
      .findOne({
        attributes: contestUserDetailFields,
        where: {
          ...options,
          contestId,
        } as any,
      })
      .then((d) => d && this._parseContestUser<IMContestUserDetail>(d.get({ plain: true })));
  }

  /**
   * 按条件查询比赛用户是否存在。
   * @param contestId contestId
   * @param options 查询参数
   */
  async isContestUserExists(
    contestId: IContestModel['contestId'],
    options: IMContestServiceIsContestUserExistsOpt,
  ): Promise<boolean> {
    const res = await this.contestUserModel.findOne({
      attributes: ['contestUserId'],
      where: {
        ...options,
        contestId,
      } as any,
    });
    return !!res;
  }

  /**
   * 创建比赛用户。
   * @param contestId contestId
   * @param data 创建数据
   * @returns 创建成功的 contestUserId
   */
  async createContestUser(
    contestId: IContestModel['contestId'],
    data: IMContestServiceCreateContestUserOpt,
  ): Promise<IMContestServiceCreateContestUserRes> {
    const res = await this.contestUserModel.create({
      ...this._formatContestUser(data),
      contestId,
    });
    return res.contestUserId;
  }

  /**
   * 更新比赛用户（部分更新）。
   * @param contestUserId contestUserId
   * @param data 更新数据
   */
  async updateContestUser(
    contestUserId: IContestUserModel['contestUserId'],
    data: IMContestServiceUpdateContestUserOpt,
  ): Promise<IMContestServiceUpdateContestUserRes> {
    const res = await this.contestUserModel.update(this._formatContestUser(data), {
      where: {
        contestUserId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除比赛用户详情缓存。
   * @param contestUserId contestUserId
   */
  async clearContestUserDetailCache(
    contestUserId: IContestUserModel['contestUserId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.contestUserDetail, [contestUserId]);
  }
}
