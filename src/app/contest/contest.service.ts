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
  IMContestUserDetailPlain,
  IMContestUserDetail,
  IMContestServiceGetContestUserDetailRes,
  IMContestServiceFindOneContestUserOpt,
  IMContestServiceFindOneContestUserRes,
  IMContestServiceIsContestUserExistsOpt,
  IMContestServiceCreateContestUserOpt,
  IMContestServiceCreateContestUserRes,
  IMContestServiceUpdateContestUserOpt,
  IMContestServiceUpdateContestUserRes,
  IMContestServiceGetRelativeContestUserRes,
  IMContestServiceGetRanklistRes,
  IMContestRanklist,
  IMContestRanklistRow,
  IMContestServiceGetRatingStatusRes,
  IMContestRatingStatus,
  IMContestRankData,
  IMContestRatingContestDetail,
  IMContestServiceGetRatingContestDetailRes,
  TMContestRatingContestDetailFields,
  IMContestServiceGetContestUsersOpt,
  IMContestServiceGetContestUsersRes,
  IMContestServiceGetContestProblemConfigRes,
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
import { CSolutionService } from '../solution/solution.service';
import { EContestType, ESolutionResult, EContestMode, EContestUserStatus } from '@/common/enums';
import { CUserService } from '../user/user.service';
import { TRatingContestModel } from '@/lib/models/ratingContest.model';

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
  'contestId',
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
  'contestId',
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

const ratingContestDetailFields: Array<TMContestRatingContestDetailFields> = [
  'contestId',
  'ratingUntil',
  'ratingChange',
  'createdAt',
  'updatedAt',
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
  ratingContestModel: TRatingContestModel;

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
    available(data: Partial<IContestModel> | null): boolean {
      return data?.hidden === false;
    },
  };

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
  ): Promise<IMContestUserDetailPlain | null | ''> {
    return this.ctx.helper.redisGet<IMContestUserDetailPlain>(this.redisKey.contestUserDetail, [
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
    data: IMContestUserDetailPlain | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.contestUserDetail,
      [contestUserId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取比赛 Ranklist 缓存。
   * @param contestId contestId
   * @param god 是否上帝视角
   */
  private async _getContestRanklistCache(
    contestId: IContestModel['contestId'],
    god: boolean,
  ): Promise<IMContestRanklist | null> {
    return this.ctx.helper.redisGet<IMContestRanklist>(this.redisKey.contestRanklist, [
      contestId,
      god,
    ]);
  }

  /**
   * 设置比赛 Ranklist 缓存。
   * @param contestId contestId
   * @param god 是否上帝视角
   * @param data 数据
   */
  private async _setContestRanklistCache(
    contestId: IContestModel['contestId'],
    god: boolean,
    data: IMContestRanklist,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.contestRanklist,
      [contestId, god],
      data,
      this.durations.cacheDetailShort,
    );
  }

  /**
   * 获取 Rating 比赛详情缓存。
   * @param contestId contestId
   */
  private async _getRatingContestDetailCache(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestRatingContestDetail | null> {
    return this.ctx.helper.redisGet<IMContestRatingContestDetail>(
      this.redisKey.ratingContestDetail,
      [contestId],
    );
  }

  /**
   * 设置 Rating 比赛详情缓存。
   * @param contestId contestId
   * @param data 数据
   */
  private async _setRatingContestDetailCache(
    contestId: IContestModel['contestId'],
    data: IMContestRatingContestDetail,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.ratingContestDetail,
      [contestId],
      data,
      this.durations.cacheDetail,
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

  private _formatContestUser<T>(data: Partial<IMContestUserDetailPlain>): T {
    const res: any = { ...data };
    for (let i = 1; i <= MEMBER_NUM; ++i) {
      memberFields.forEach((field) => {
        const key = `${field}${i}`;
        res[key] = res.members?.[i - 1]?.[field];
      });
    }
    delete res.members;
    return this.utils.misc.ignoreUndefined(res) as T;
  }

  private async _handleRelativeContestUserData(
    data: IMContestUserDetailPlain[],
  ): Promise<IMContestUserDetail[]> {
    const usernames = data.map((d) => d.username).filter((f) => f);
    const username2userIdMap = await this.userService.getUserIdsByUsernames(usernames);
    const userIds = Object.values(username2userIdMap);
    const relativeUser = await this.userService.getRelative(userIds, null);
    return data.map((d) => {
      const user = relativeUser[username2userIdMap[d.username]];
      return {
        ...d,
        globalUserId: user?.userId,
        rating: user?.rating || 0,
      };
    });
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
        await this._setDetailCache(d.contestId, d);
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
   * 获取比赛题目配置。
   * @param contestId contestId
   */
  async getContestProblemConfig(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestServiceGetContestProblemConfigRes> {
    const res = await this.contestProblemModel
      .findAll({
        attributes: contestProblemDetailFields,
        where: {
          contestId,
        },
        order: [['index', 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMContestProblemLite));
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 判断指定题目是否在指定比赛的题目列表中。
   * @param problemId problemId
   * @param contestId contestId
   */
  async isProblemInContest(
    problemId: IProblemModel['problemId'],
    contestId: IContestModel['contestId'],
  ): Promise<boolean> {
    const problems = await this.getContestProblems(contestId);
    return !!problems.rows.find((problem) => problem.problemId === problemId);
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
   * 获取全部比赛用户。
   * @param contestId contestId
   */
  async getContestUsers(
    contestId: IContestModel['contestId'],
    options: IMContestServiceGetContestUsersOpt,
  ): Promise<IMContestServiceGetContestUsersRes> {
    const res = await this.contestUserModel
      .findAll({
        attributes: contestUserDetailFields,
        where: this.utils.misc.ignoreUndefined({
          contestId,
          status: options.status,
        }),
      })
      .then((r) =>
        r.map((d) => {
          const plain = d.get({ plain: true });
          return this._parseContestUser<IMContestUserDetailPlain>(plain);
        }),
      );
    return {
      count: res.length,
      rows: await this._handleRelativeContestUserData(res),
    };
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
        .then((d) => d && this._parseContestUser<IMContestUserDetailPlain>(d.get({ plain: true })));
      await this._setContestUserDetailCache(contestUserId, res);
    }
    if (!res) {
      return null;
    }
    const [ret] = await this._handleRelativeContestUserData([res]);
    return ret;
  }

  /**
   * 按 pk 关联查询比赛用户详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表
   */
  async getRelativeContestUser(
    keys: IContestUserModel['contestUserId'][],
  ): Promise<IMContestServiceGetRelativeContestUserRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMContestServiceGetRelativeContestUserRes = {};
    let uncached: typeof keys = [];
    for (const k of ks) {
      const cached = await this._getContestUserDetailCache(k);
      if (cached) {
        res[k] = cached;
      } else if (cached === null) {
        uncached.push(k);
      }
    }
    if (uncached.length) {
      const dbRes = await this.contestUserModel
        .findAll({
          attributes: contestUserDetailFields,
          where: {
            contestUserId: {
              [Op.in]: uncached,
            },
          },
        })
        .then((r) =>
          r.map((d) => this._parseContestUser<IMContestUserDetailPlain>(d.get({ plain: true }))),
        );
      for (const d of dbRes) {
        res[d.contestUserId] = d;
        await this._setContestUserDetailCache(d.contestUserId, d);
      }
      for (const k of ks) {
        !res[k] && (await this._setContestUserDetailCache(k, null));
      }
    }
    const resIds = Object.keys(res).map((id) => +id);
    const handled = await this._handleRelativeContestUserData(resIds.map((id) => res[id]));
    resIds.forEach((id, index) => {
      res[id] = handled[index];
    });
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
    const res = await this.contestUserModel
      .findOne({
        attributes: contestUserDetailFields,
        where: {
          ...options,
          contestId,
        } as any,
      })
      .then((d) => d && this._parseContestUser<IMContestUserDetailPlain>(d.get({ plain: true })));
    if (!res) {
      return null;
    }
    const [ret] = await this._handleRelativeContestUserData([res]);
    return ret;
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

  /**
   * 获取比赛 Ranklist。
   * @param contest 比赛详情对象
   * @param ignoreFrozen 是否忽略封榜
   */
  async getRanklist(
    contest: RequireSome<
      IMContestDetail,
      'contestId' | 'type' | 'frozenLength' | 'startAt' | 'endAt' | 'ended'
    >,
    ignoreFrozen = false,
  ): Promise<IMContestServiceGetRanklistRes> {
    const { contestId } = contest;
    const displayAll = contest.frozenLength <= 0 || ignoreFrozen || contest.ended;
    const god = contest.frozenLength > 0 && ignoreFrozen;
    let res: IMContestRanklist | null = null;
    const cached = await this._getContestRanklistCache(contestId, god);
    cached && (res = cached);
    if (!res) {
      const solutions = await this.solutionService.getAllContestSolutionList(contestId);
      const userIds = this.lodash.uniq(solutions.map((solution) => solution.userId));
      const relativeUsers =
        contest.type === EContestType.register
          ? await this.getRelativeContestUser(userIds)
          : await this.userService.getRelative(userIds, null);
      const userRatingChangeInfo: Record<
        number,
        {
          oldRating: number;
          newRating: number;
        }
      > = {}; // 关联用户 id 到 rating change 的映射（如果比赛为 register，则 id 为比赛用户 id）
      if (contest.mode === EContestMode.rating) {
        const ratingContestDetail = await this.getRatingContestDetail(contestId);
        const ratingChange = ratingContestDetail?.ratingChange || {};
        Object.keys(relativeUsers).forEach((id) => {
          const user = relativeUsers[+id];
          // @ts-ignore
          const userId = user.globalUserId || +id;
          userRatingChangeInfo[+id] = {
            oldRating: ratingChange[userId]?.oldRating,
            newRating: ratingChange[userId]?.newRating,
          };
        });
      }
      const problems = (await this.getContestProblems(contestId)).rows;
      const rankMap: Record<IUserModel['userId'], IMContestRanklistRow> = [];
      const problemIndexMap = new Map<number, number>();
      problems.forEach((problem, index) => {
        problemIndexMap.set(problem.problemId, index);
      });
      const fb = problems.map((_problem) => true);
      // @ts-ignore
      Object.keys(relativeUsers).forEach((userId: number) => {
        const user = relativeUsers[userId];
        rankMap[userId] = {
          rank: -1,
          user: {
            userId: +userId,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            // @ts-ignore
            bannerImage: user.bannerImage || '',
            // @ts-ignore
            rating: user.rating || 0,
            // @ts-ignore
            globalUserId: user.globalUserId,
            oldRating: userRatingChangeInfo[userId]?.oldRating,
            newRating: userRatingChangeInfo[userId]?.newRating,
          },
          solved: 0,
          time: 0,
          stats: problems.map((_problem) => ({
            result: '-',
            attempted: 0,
            time: 0,
          })),
        };
      });
      const frozenStart = new Date(contest.endAt.getTime() - contest.frozenLength * 1000);
      for (const solution of solutions) {
        const problemIndex = problemIndexMap.get(solution.problemId);
        if (problemIndex === undefined) {
          continue;
        }
        const { userId } = solution;
        const stat = rankMap[userId]?.stats?.[problemIndex];
        if (!stat) {
          continue;
        }
        if (
          [ESolutionResult.WT, ESolutionResult.JG, ESolutionResult.CE, ESolutionResult.SE].includes(
            solution.result,
          )
        ) {
          // 非有效提交，忽略
          continue;
        } else if (stat.result === 'FB' || stat.result === 'AC') {
          // 如果该用户这个题目之前已经 AC，则不处理
          continue;
        } else if (!displayAll && frozenStart <= solution.createdAt) {
          // 如果封榜，则尝试 +1
          stat.attempted++;
          stat.result = '?';
        } else if (solution.result !== ESolutionResult.AC) {
          // 如果为错误的提交
          stat.attempted++;
          stat.result = 'X';
        } else if (solution.result === ESolutionResult.AC) {
          // 如果该次提交为 AC
          rankMap[userId].solved++;
          // @ts-ignore
          stat.time = Math.floor((solution.createdAt - contest.startAt) / 1000);
          const problemPenalty = 20 * 60 * stat.attempted;
          rankMap[userId].time += stat.time + problemPenalty;
          stat.attempted++;
          // 判断是否为 FB
          // 因为提交是按顺序获得的，因此第一个 AC 的提交就是 FB
          if (fb[problemIndex]) {
            fb[problemIndex] = false;
            stat.result = 'FB';
          } else {
            stat.result = 'AC';
          }
        }
      }
      const ranklist: IMContestRanklist = [];
      // @ts-ignore
      Object.keys(rankMap).forEach((userId: number) => {
        ranklist.push(rankMap[userId]);
      });
      // 排序
      ranklist.sort((a, b) => {
        if (a.solved !== b.solved) {
          return b.solved - a.solved;
        }
        return a.time - b.time;
      });
      if (ranklist.length) {
        // 计算并列排名
        ranklist[0].rank = 1;
        for (let i = 1; i < ranklist.length; ++i) {
          if (
            ranklist[i].solved === ranklist[i - 1].solved &&
            ranklist[i].time === ranklist[i - 1].time
          ) {
            ranklist[i].rank = ranklist[i - 1].rank;
          } else {
            ranklist[i].rank = i + 1;
          }
        }
      }
      res = ranklist;
      await this._setContestRanklistCache(contestId, god, res);
    }

    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 清除比赛 Ranklist 缓存。
   * @param contestId contestId
   * @param god 是否上帝视角（不传则清空全部）
   */
  async clearContestRanklistCache(
    contestId: IContestModel['contestId'],
    god?: boolean,
  ): Promise<void | [void, void]> {
    if (god === undefined) {
      return Promise.all([
        this.ctx.helper.redisDel(this.redisKey.contestRanklist, [contestId, true]),
        this.ctx.helper.redisDel(this.redisKey.contestRanklist, [contestId, false]),
      ]);
    }
    return this.ctx.helper.redisDel(this.redisKey.contestRanklist, [contestId, god]);
  }

  /**
   * 获取比赛 Rating 计算状态。
   * @param contestId contestId
   */
  async getRatingStatus(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestServiceGetRatingStatusRes> {
    return this.ctx.helper.redisGet<IMContestRatingStatus>(this.redisKey.contestRatingStatus, [
      contestId,
    ]);
  }

  /**
   * 设置比赛 Rating 计算状态。
   * @param contestId contestId
   * @param data 数据
   */
  async setRatingStatus(
    contestId: IContestModel['contestId'],
    data: IMContestRatingStatus,
  ): Promise<void> {
    return this.ctx.helper.redisSet(this.redisKey.contestRatingStatus, [contestId], data);
  }

  /**
   * 设置比赛 RankData。
   * @param contestId contestId
   * @param data 数据
   */
  async setRankData(contestId: IContestModel['contestId'], data: IMContestRankData) {
    return this.ctx.helper.redisSet(this.redisKey.contestRankData, [contestId], data);
  }

  /**
   * 获取 Rating 比赛详情。
   * @param contestId contestId
   */
  async getRatingContestDetail(
    contestId: IContestModel['contestId'],
  ): Promise<IMContestServiceGetRatingContestDetailRes> {
    let res: IMContestServiceGetRatingContestDetailRes = null;
    const cached = await this._getRatingContestDetailCache(contestId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.ratingContestModel
        .findOne({
          attributes: ratingContestDetailFields,
          where: {
            contestId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMContestRatingContestDetail));
      res && (await this._setRatingContestDetailCache(contestId, res));
    }
    return res;
  }
}
