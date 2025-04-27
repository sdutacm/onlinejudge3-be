/* eslint-disable @typescript-eslint/no-unused-vars */
import { provide, inject, Context, config } from 'midway';
import { Op } from 'sequelize';
import ivm from 'isolated-vm';
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
  IMCompetitionServiceCreateCompetitionUserOpt,
  IMCompetitionServiceCreateCompetitionUserRes,
  IMCompetitionServiceUpdateCompetitionUserOpt,
  IMCompetitionServiceUpdateCompetitionUserRes,
  IMCompetitionServiceGetRelativeCompetitionUserRes,
  // IMCompetitionServiceGetCompetitionUsersOpt,
  // IMCompetitionServiceGetCompetitionUsersRes,
  IMCompetitionServiceGetCompetitionProblemConfigRes,
  IMCompetitionServiceGetCompetitionUserListOpt,
  IMCompetitionServiceGetCompetitionUserListRes,
  IMCompetitionServiceGetCompetitionUsersRes,
  IMCompetitionServiceGetCompetitionUserDetailRes,
  IMCompetitionServiceFindOneCompetitionUserOpt,
  IMCompetitionServiceFindOneCompetitionUserRes,
  IMCompetitionServiceIsCompetitionUserExistsOpt,
  TMCompetitionSettingDetailFields,
  IMCompetitionSettingDetail,
  ICompetitionSettingModel,
  IMCompetitionServiceCreateCompetitionSettingOpt,
  IMCompetitionServiceUpdateCompetitionSettingOpt,
  IMCompetitionServiceUpdateCompetitionSettingRes,
  IMCompetitionServiceGetAllCompetitionUsersRes,
  TMCompetitionNotificationDetailFields,
  IMCompetitionNotificationDetail,
  IMCompetitionServiceCreateCompetitionNotificationOpt,
  ICompetitionNotificationModel,
  TMCompetitionQuestionDetailFields,
  IMCompetitionQuestionDetail,
  IMCompetitionServiceCreateCompetitionQuestionOpt,
  ICompetitionQuestionModel,
  IMCompetitionServiceUpdateCompetitionQuestionOpt,
  IMCompetitionServicegetCompetitionQuestionsOpt,
  IMCompetitionServiceGetCompetitionNotificationsRes,
  IMCompetitionRanklist,
  IMCompetitionServiceGetRanklistRes,
  IMCompetitionRanklistRow,
  IMCompetitionServiceGetRatingContestDetailRes,
  IMCompetitionRatingStatus,
  IMCompetitionRankData,
  IMCompetitionServiceGetRatingStatusRes,
  IMCompetitionServiceGetRelativeCompetitionProblemRes,
} from './competition.interface';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { TUserModel } from '@/lib/models/user.model';
import { TCompetitionProblemModel } from '@/lib/models/competitionProblem.model';
import { CProblemService } from '../problem/problem.service';
import { IProblemModel } from '../problem/problem.interface';
import { TCompetitionUserModel } from '@/lib/models/competitionUser.model';
import { CSolutionService } from '../solution/solution.service';
import { CUserService } from '../user/user.service';
import { TCompetitionSettingModel } from '@/lib/models/competitionSetting.model';
import { TCompetitionNotificationModel } from '@/lib/models/competitionNotification.model';
import { TCompetitionQuestionModel } from '@/lib/models/competitionQuestion.model';
import { IUserModel } from '../user/user.interface';
import {
  IMContestRatingContestDetail,
  TMContestRatingContestDetailFields,
} from '../contest/contest.interface';
import { TRatingContestModel } from '@/lib/models/ratingContest.model';
import { ECompetitionRulePreset, ECompetitionLogAction } from './competition.enum';
import { ESolutionResult, ECompetitionUserRole, ECompetitionUserStatus } from '@/common/enums';
import { compileVarScoreExpression } from '@/common/utils/competition';
import { ICompetitionSpConfig } from '@/common/interfaces/competition';
import { CCompetitionLogService } from './competitionLog.service';
import { CCompetitionEventService } from './competitionEvent.service';
import { CUserAchievementService } from '../user/userAchievement.service';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { CPromiseQueue } from '@/utils/libs/promise-queue';

export type CCompetitionService = CompetitionService;

const competitionLiteFields: Array<TMCompetitionLiteFields> = [
  'competitionId',
  'title',
  'startAt',
  'endAt',
  'ended',
  'rule',
  'isTeam',
  'isRating',
  'registerStartAt',
  'registerEndAt',
  'createdBy',
  'hidden',
];

const competitionDetailFields: Array<TMCompetitionDetailFields> = [
  'competitionId',
  'title',
  'introduction',
  'announcement',
  'startAt',
  'endAt',
  'ended',
  'rule',
  'isTeam',
  'isRating',
  'registerStartAt',
  'registerEndAt',
  'createdBy',
  'hidden',
  'spConfig',
];

const competitionProblemDetailFields: Array<TMCompetitionProblemDetailFields> = [
  'problemId',
  'alias',
  'balloonAlias',
  'balloonColor',
  'score',
  'varScoreExpression',
];

const competitionUserLiteFields: Array<TMCompetitionUserLiteFields> = [
  'competitionId',
  'userId',
  'role',
  'status',
  'info',
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

const competitionSettingDetailFields: Array<TMCompetitionSettingDetailFields> = [
  'competitionId',
  'frozenLength',
  'allowedJoinMethods',
  'allowedAuthMethods',
  'allowedSolutionLanguages',
  'allowAnyObservation',
  'useOnetimePassword',
  'joinPassword',
  'externalRanklistUrl',
  'createdAt',
  'updatedAt',
];

// @ts-ignore
const competitionSettingRelativeFields: Array<Exclude<
  TMCompetitionSettingDetailFields,
  'joinPassword'
>> = competitionSettingDetailFields.filter((k) => k !== 'joinPassword');

const competitionNotificationDetailFields: Array<TMCompetitionNotificationDetailFields> = [
  'competitionNotificationId',
  'competitionId',
  'userId',
  'content',
  'createdAt',
  'updatedAt',
];

const competitionQuestionDetailFields: Array<TMCompetitionQuestionDetailFields> = [
  'competitionQuestionId',
  'competitionId',
  'status',
  'userId',
  'content',
  'reply',
  'repliedUserId',
  'repliedAt',
  'createdAt',
  'updatedAt',
];

const ratingContestDetailFields: Array<TMContestRatingContestDetailFields> = [
  'contestId',
  'competitionId',
  'ratingUntil',
  'ratingChange',
  'createdAt',
  'updatedAt',
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
  competitionSettingModel: TCompetitionSettingModel;

  @inject()
  competitionNotificationModel: TCompetitionNotificationModel;

  @inject()
  competitionQuestionModel: TCompetitionQuestionModel;

  @inject()
  ratingContestModel: TRatingContestModel;

  @inject()
  problemService: CProblemService;

  @inject()
  userService: CUserService;

  @inject()
  solutionService: CSolutionService;

  @inject()
  competitionLogService: CCompetitionLogService;

  @inject()
  competitionEventService: CCompetitionEventService;

  @inject()
  userAchievementService: CUserAchievementService;

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

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

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
   * 获取全部比赛用户列表缓存。
   * @param competitionId competitionId
   */
  private async _getCompetitionUsersCache(
    competitionId: ICompetitionUserModel['competitionId'],
  ): Promise<IMCompetitionUserLite[] | null | ''> {
    return this.ctx.helper.redisGet<IMCompetitionUserLite[]>(this.redisKey.competitionUsers, [
      competitionId,
    ]);
  }

  /**
   * 设置全部比赛用户列表缓存。
   * @param competitionId competitionId
   * @param data
   */
  private async _setCompetitionUsersCache(
    competitionId: ICompetitionUserModel['competitionId'],
    data: IMCompetitionUserLite[] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionUsers,
      [competitionId],
      data,
      data ? this.durations.cacheFullList : this.durations.cacheDetailNull,
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

  /**
   * 获取比赛设置详情缓存。
   * @param competitionId competitionId
   */
  private async _getCompetitionSettingDetailCache(
    competitionId: ICompetitionSettingModel['competitionId'],
  ): Promise<IMCompetitionSettingDetail | null | ''> {
    return this.ctx.helper.redisGet<IMCompetitionSettingDetail>(
      this.redisKey.competitionSettingDetail,
      [competitionId],
    );
  }

  /**
   * 设置比赛设置详情缓存。
   * @param competitionId competitionId
   * @param data 详情数据
   */
  private async _setCompetitionSettingDetailCache(
    competitionId: ICompetitionSettingModel['competitionId'],
    data: IMCompetitionSettingDetail | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionSettingDetail,
      [competitionId],
      data,
      data ? this.durations.cacheDetail : this.durations.cacheDetailNull,
    );
  }

  /**
   * 获取比赛通知列表缓存。
   * @param competitionId competitionId
   */
  private async _getCompetitionNotificationsCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionNotificationDetail[] | null> {
    return this.ctx.helper.redisGet<IMCompetitionNotificationDetail[]>(
      this.redisKey.competitionNotifications,
      [competitionId],
    );
  }

  /**
   * 设置比赛通知列表缓存。
   * @param competitionId competitionId
   * @param data 列表数据
   */
  private async _setCompetitionNotificationsCache(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionNotificationDetail[] | null,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionNotifications,
      [competitionId],
      data,
      this.durations.cacheDetailMedium,
    );
  }

  /**
   * 获取比赛 Ranklist 缓存。
   * @param competitionId competitionId
   * @param god 是否上帝视角
   */
  private async _getCompetitionRanklistCache(
    competitionId: ICompetitionModel['competitionId'],
    god: boolean,
  ): Promise<IMCompetitionRanklist | null> {
    return this.ctx.helper.redisGet<IMCompetitionRanklist>(this.redisKey.competitionRanklist, [
      competitionId,
      god,
    ]);
  }

  /**
   * 设置比赛 Ranklist 缓存。
   * @param competitionId competitionId
   * @param god 是否上帝视角
   * @param data 数据
   */
  private async _setCompetitionRanklistCache(
    competitionId: ICompetitionModel['competitionId'],
    god: boolean,
    data: IMCompetitionRanklist,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.competitionRanklist,
      [competitionId, god],
      data,
      this.durations.cacheDetailVeryShort,
    );
  }

  /**
   * 获取 Rating 比赛详情缓存。
   * @param competitionId competitionId
   */
  private async _getRatingContestDetailCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMContestRatingContestDetail | null> {
    return this.ctx.helper.redisGet<IMContestRatingContestDetail>(
      this.redisKey.ratingContestDetailForCompetition,
      [competitionId],
    );
  }

  /**
   * 设置 Rating 比赛详情缓存。
   * @param competitionId competitionId
   * @param data 数据
   */
  private async _setRatingContestDetailCache(
    competitionId: ICompetitionModel['competitionId'],
    data: IMContestRatingContestDetail,
  ): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.ratingContestDetailForCompetition,
      [competitionId],
      data,
      this.durations.cacheDetail,
    );
  }

  private _formatListQuery(opts: IMCompetitionServiceGetListOpt) {
    const where: any = this.utils.misc.ignoreUndefined({
      competitionId: opts.competitionId,
      rule: opts.rule,
      isTeam: opts.isTeam,
      isRating: opts.isRating,
      createdBy: opts.createdBy,
      // hidden: opts.hidden,
      deleted: false,
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
            deleted: false,
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
      const [detailCached, settingsCached] = await Promise.all([
        this._getDetailCache(k),
        this._getCompetitionSettingDetailCache(k),
      ]);
      const cached = detailCached
        ? {
            ...detailCached,
            settings: settingsCached
              ? this.lodash.omit(settingsCached, [
                  'competitionId',
                  'joinPassword',
                  'createdAt',
                  'updatedAt',
                ])
              : undefined,
          }
        : null;
      if (cached) {
        // @ts-ignore
        res[k] = cached;
      } else if (cached === null) {
        uncached.push(k);
      }
    }
    if (uncached.length) {
      const [dbRes, settingsDbRes] = await Promise.all<
        IMCompetitionDetail[],
        IMCompetitionSettingDetail[]
      >([
        this.model
          // .scope(scope || undefined)
          .findAll({
            attributes: competitionDetailFields,
            where: {
              competitionId: {
                [Op.in]: uncached,
              },
            },
          })
          .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionDetail)),
        this.competitionSettingModel
          // .scope(scope || undefined)
          .findAll({
            attributes: competitionSettingRelativeFields,
            where: {
              competitionId: {
                [Op.in]: uncached,
              },
            },
          })
          .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionSettingDetail)),
      ]);
      for (const d of dbRes) {
        const s = settingsDbRes.find((r) => r.competitionId === d.competitionId);
        res[d.competitionId] = {
          ...d,
          // @ts-ignore
          settings: s
            ? this.lodash.omit(s, ['competitionId', 'joinPassword', 'createdAt', 'updatedAt'])
            : undefined,
        };
        await this._setDetailCache(d.competitionId, d);
        await this._setCompetitionSettingDetailCache(d.competitionId, s || null);
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
        alias: problem.alias || '',
        balloonAlias: problem.balloonAlias || '',
        balloonColor: problem.balloonColor || '',
        score: problem.score ?? null,
        varScoreExpression: problem.varScoreExpression || '',
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
   * 按 pk 关联查询比赛题目详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表，格式为 `${competitionId}_${problemId}`
   */
  async getRelativeCompetitionProblem(
    keys: string[],
  ): Promise<IMCompetitionServiceGetRelativeCompetitionProblemRes> {
    const competitionIdSet = new Set<number>();
    keys.forEach((k) => {
      const [competitionId] = k.split('_').map((id) => +id);
      competitionIdSet.add(competitionId);
    });
    const competitionIds = Array.from(competitionIdSet);
    const competitionProblemsMap = new Map<number, IMCompetitionProblemDetail[]>();
    await Promise.all(
      competitionIds.map((competitionId) =>
        this.getCompetitionProblems(competitionId)
          .then((d) => {
            d && competitionProblemsMap.set(competitionId, d.rows);
          })
          .catch(console.error),
      ),
    );

    const ks = this.lodash.uniq(keys);
    const res: IMCompetitionServiceGetRelativeCompetitionProblemRes = {};
    ks.forEach((k) => {
      const [competitionId, problemId] = k.split('_').map((id) => +id);
      const problems = competitionProblemsMap.get(competitionId);
      if (problems) {
        const problem = problems.find((d) => d.problemId === problemId);
        if (problem) {
          res[k] = problem;
        }
      }
    });
    return res;
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
   * 获取全部比赛用户（带缓存，不包含密码）。
   * @param competitionId competitionId
   */
  async getCompetitionUsers(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionServiceGetCompetitionUsersRes> {
    let res: IMCompetitionServiceGetCompetitionUsersRes['rows'] | null = null;
    const cached = await this._getCompetitionUsersCache(competitionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.competitionUserModel
        .findAll({
          attributes: competitionUserLiteFields,
          where: this.utils.misc.ignoreUndefined({
            competitionId,
          }),
          order: [['createdAt', 'ASC']],
        })
        .then((r) =>
          r.map((d) => {
            const plain = d.get({ plain: true });
            return this._parseCompetitionUser<IMCompetitionUserDetailPlain>(plain);
          }),
        );
      await this._setCompetitionUsersCache(competitionId, res);
    }
    // res = await this._handleRelativeCompetitionUserData(res) || [],
    res = res || [];
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 获取全部比赛用户（不带缓存，全部字段）。
   * @param competitionId competitionId
   */
  async getAllCompetitionUsers(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionServiceGetAllCompetitionUsersRes> {
    const res = await this.competitionUserModel
      .findAll({
        attributes: competitionUserDetailFields,
        where: this.utils.misc.ignoreUndefined({
          competitionId,
        }),
        order: [
          ['role', 'ASC'],
          ['createdAt', 'ASC'],
        ],
      })
      .then((r) =>
        r.map((d) => {
          const plain = d.get({ plain: true });
          return this._parseCompetitionUser<IMCompetitionUserDetailPlain>(plain);
        }),
      );
    return {
      count: res.length,
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

  /**
   * 按 pk 关联查询比赛用户详情。
   * 如果部分查询的 key 在未找到，则返回的对象中不会含有此 key
   * @param keys 要关联查询的 pk 列表，格式为 `${competitionId}_${userId}`
   */
  async getRelativeCompetitionUser(
    keys: string[],
  ): Promise<IMCompetitionServiceGetRelativeCompetitionUserRes> {
    const ks = this.lodash.uniq(keys);
    const res: IMCompetitionServiceGetRelativeCompetitionUserRes = {};
    await Promise.all(
      ks.map((k) => {
        const [competitionId, userId] = k.split('_').map((id) => +id);
        return this.getCompetitionUserDetail(competitionId, userId)
          .then((d) => {
            d && (res[k] = d);
          })
          .catch(console.error);
      }),
    );
    return res;
  }

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

  /**
   * 创建比赛用户。
   * @param competitionId competitionId
   * @param userId userId
   * @param data 创建数据
   */
  async createCompetitionUser(
    competitionId: ICompetitionModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
    data: IMCompetitionServiceCreateCompetitionUserOpt,
  ): Promise<IMCompetitionServiceCreateCompetitionUserRes> {
    await this.competitionUserModel.create({
      ...data,
      competitionId,
      userId,
    });
  }

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

  async deleteCompetitionUser(
    competitionId: ICompetitionUserModel['competitionId'],
    userId: ICompetitionUserModel['userId'],
  ) {
    if (!competitionId || !userId) {
      return false;
    }
    const res = await this.competitionUserModel.destroy({
      where: {
        competitionId,
        userId,
      },
    });
    return res > 0;
  }

  /**
   * 创建比赛设置。
   * @param competitionId competitionId
   * @param data 创建数据
   */
  async createCompetitionSetting(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionServiceCreateCompetitionSettingOpt,
  ): Promise<void> {
    await this.competitionSettingModel.create({
      ...data,
      competitionId,
    });
  }

  /**
   * 更新比赛设置（部分更新）。
   * @param competitionId competitionId
   * @param data 更新数据
   */
  async updateCompetitionSetting(
    competitionId: ICompetitionSettingModel['competitionId'],
    data: IMCompetitionServiceUpdateCompetitionSettingOpt,
  ): Promise<IMCompetitionServiceUpdateCompetitionSettingRes> {
    const res = await this.competitionSettingModel.update(data, {
      where: {
        competitionId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 获取比赛设置详情。
   * @param competitionId competitionId
   */
  async getCompetitionSettingDetail(
    competitionId: ICompetitionUserModel['competitionId'],
  ): Promise<IMCompetitionSettingDetail | null> {
    let res: IMCompetitionSettingDetail | null = null;
    const cached = await this._getCompetitionSettingDetailCache(competitionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.competitionSettingModel
        .findOne({
          attributes: competitionSettingDetailFields,
          where: {
            competitionId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMCompetitionSettingDetail));
      await this._setCompetitionSettingDetailCache(competitionId, res);
    }
    if (!res) {
      return null;
    }
    return res;
  }

  /**
   * 获取全部比赛通知。
   * @param competitionId competitionId
   */
  async getAllCompetitionNotifications(
    competitionId: ICompetitionUserModel['competitionId'],
  ): Promise<defModel.FullListModelRes<IMCompetitionNotificationDetail>> {
    let res: IMCompetitionServiceGetCompetitionNotificationsRes['rows'] | null = null;
    const cached = await this._getCompetitionNotificationsCache(competitionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.competitionNotificationModel
        .findAll({
          attributes: competitionNotificationDetailFields,
          where: {
            competitionId,
            deleted: false,
          },
        })
        .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionNotificationDetail));
      await this._setCompetitionNotificationsCache(competitionId, res);
    }
    res = res || [];
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 创建比赛通知。
   * @param competitionId competitionId
   * @param data 创建数据
   */
  async createCompetitionNotification(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionServiceCreateCompetitionNotificationOpt,
  ): Promise<void> {
    await this.competitionNotificationModel.create({
      ...data,
      competitionId,
    });
  }

  /**
   * 删除比赛通知。
   * @param competitionNotificationId competitionNotificationId
   * @param competitionId competitionId
   */
  async deleteCompetitionNotification(
    competitionNotificationId: ICompetitionNotificationModel['competitionNotificationId'],
    competitionId: ICompetitionNotificationModel['competitionId'],
  ): Promise<boolean> {
    const res = await this.competitionNotificationModel.update(
      {
        deleted: true,
      },
      {
        where: {
          competitionNotificationId,
          competitionId,
        },
      },
    );
    return res[0] > 0;
  }

  /**
   * 清除比赛通知列表缓存。
   * @param competitionId competitionId
   */
  async clearCompetitionNotificationsCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.competitionNotifications, [competitionId]);
  }

  /**
   * 获取比赛提问。
   * @param competitionId competitionId
   * @param opts
   */
  async getCompetitionQuestions(
    competitionId: ICompetitionUserModel['competitionId'],
    opts: IMCompetitionServicegetCompetitionQuestionsOpt = {},
  ): Promise<defModel.FullListModelRes<IMCompetitionQuestionDetail>> {
    const res = await this.competitionQuestionModel
      .findAll({
        attributes: competitionQuestionDetailFields,
        where: {
          ...this.utils.misc.ignoreUndefined(opts),
          competitionId,
        },
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMCompetitionQuestionDetail));
    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 创建比赛提问。
   * @param competitionId competitionId
   * @param data 创建数据
   */
  async createCompetitionQuestion(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionServiceCreateCompetitionQuestionOpt,
  ): Promise<void> {
    await this.competitionQuestionModel.create({
      ...data,
      competitionId,
      reply: '',
    });
  }

  /**
   * 更新比赛提问。
   * @param competitionQuestionId competitionQuestionId
   * @param competitionId competitionId
   * @param data
   */
  async updateCompetitionQuestion(
    competitionQuestionId: ICompetitionQuestionModel['competitionQuestionId'],
    competitionId: ICompetitionQuestionModel['competitionId'],
    data: IMCompetitionServiceUpdateCompetitionQuestionOpt,
  ): Promise<boolean> {
    const res = await this.competitionQuestionModel.update(this.utils.misc.ignoreUndefined(data), {
      where: {
        competitionQuestionId,
        competitionId,
      },
    });
    return res[0] > 0;
  }

  /**
   * 清除全部比赛用户列表缓存。
   * @param competitionId competitionId
   */
  async clearCompetitionUsersCache(
    competitionId: ICompetitionUserModel['competitionId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.competitionUsers, [competitionId]);
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

  /**
   * 清除比赛设置详情缓存。
   * @param competitionId competitionId
   */
  async clearCompetitionSettingDetailCache(
    competitionId: ICompetitionSettingModel['competitionId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.competitionSettingDetail, [competitionId]);
  }

  /**
   * 获取比赛 Ranklist。
   * @param competition 比赛详情对象
   * @param competitionSettings 比赛设置对象
   * @param ignoreFrozen 是否忽略封榜
   */
  async getRanklist(
    competition: RequireSome<
      IMCompetitionDetail,
      'competitionId' | 'rule' | 'isRating' | 'isTeam' | 'startAt' | 'endAt' | 'ended' | 'spConfig'
    >,
    competitionSettings: IMCompetitionSettingDetail,
    ignoreFrozen = false,
  ): Promise<IMCompetitionServiceGetRanklistRes> {
    const { competitionId } = competition;
    const displayAll = competitionSettings.frozenLength <= 0 || ignoreFrozen || competition.ended;
    const god = competitionSettings.frozenLength > 0 && ignoreFrozen;
    let res: IMCompetitionRanklist | null = null;
    const cached = await this._getCompetitionRanklistCache(competitionId, god);
    cached && (res = cached);

    if (!res) {
      const getScoreExpressionVM = async () => {
        let vm: {
          eval: (exp: string) => any;
          drop: () => void;
        };
        // @ts-ignore
        if (vm) {
          return vm;
        }
        try {
          const isolate = new ivm.Isolate({ memoryLimit: 16 });
          const context = await isolate.createContext();
          vm = {
            eval: async (exp: string) => {
              try {
                const res = await context.eval(exp, {
                  timeout: 100,
                });
                if (typeof res === 'number') {
                  return res;
                }
                throw new Error(
                  `invalid score value returned while evaling: ${exp}, return: ${res}`,
                );
              } catch (e) {
                this.ctx.error('eval score expression failed:', e);
                throw e;
              }
            },
            drop: () => {
              context.release();
              isolate.dispose();
            },
          };
        } catch (e) {
          this.ctx.error('init score expression vm failed', e);
          throw e;
        }
        return vm;
      };
      let vmToDrop: { drop: Function } | undefined;

      const isICPCWithScore = [ECompetitionRulePreset.ICPCWithScore].includes(
        competition.rule as ECompetitionRulePreset,
      );
      const solutions = await this.solutionService.getAllCompetitionSolutionList(competitionId);
      const participants = (await this.getCompetitionUsers(competitionId)).rows.filter(
        (u) => !u.banned && u.role === ECompetitionUserRole.participant,
      );
      const participantUserIdSet = new Set<number>();
      const participantUserIdMap = new Map<number, IMCompetitionUserLite>();
      participants.forEach((p) => {
        participantUserIdSet.add(p.userId);
        participantUserIdMap.set(p.userId, p);
      });
      const userIds = this.lodash.uniq(
        solutions
          .map((solution) => participantUserIdSet.has(solution.userId) && solution.userId)
          .filter(Boolean) as number[],
      );
      const relativeUsers = await this.userService.getRelative(userIds, null);
      const userRatingChangeInfo: Record<
        number,
        {
          oldRating: number;
          newRating: number;
        }
      > = {}; // 关联用户 id 到 rating change 的映射
      if (competition.isRating) {
        const ratingCompetitionDetail = await this.getRatingContestDetail(competitionId);
        const ratingChange = ratingCompetitionDetail?.ratingChange || {};
        Object.keys(relativeUsers).forEach((id) => {
          const userId = +id;
          userRatingChangeInfo[userId] = {
            oldRating: ratingChange[userId]?.oldRating,
            newRating: ratingChange[userId]?.newRating,
          };
        });
      }
      const problems = (await this.getCompetitionProblems(competitionId)).rows;
      const rankMap = new Map<IUserModel['userId'], IMCompetitionRanklistRow>();
      const problemIndexMap = new Map<number, number>();
      problems.forEach((problem, index) => {
        problemIndexMap.set(problem.problemId, index);
      });
      const fb = problems.map((_problem) => true);
      // @ts-ignore
      Object.keys(relativeUsers).forEach((_userId: string) => {
        const userId = +_userId;
        const user = relativeUsers[userId];
        rankMap.set(userId, {
          rank: -1,
          user: {
            userId,
            username: user.username,
            nickname: participantUserIdMap.get(userId)?.info?.nickname ?? user.nickname,
            avatar: user.avatar,
            bannerImage: user.bannerImage || '',
            rating: user.rating || 0,
            oldRating: userRatingChangeInfo[userId]?.oldRating,
            newRating: userRatingChangeInfo[userId]?.newRating,
          },
          score: 0,
          time: 0,
          stats: problems.map((_problem) => ({
            result: null,
            tries: 0,
            time: 0,
            score: undefined,
          })),
        });
      });
      const frozenStart = new Date(
        competition.endAt.getTime() - competitionSettings.frozenLength * 1000,
      );
      for (const solution of solutions) {
        if (solution.createdAt.getTime() >= competition.endAt.getTime()) {
          continue;
        }
        const problemIndex = problemIndexMap.get(solution.problemId);
        if (problemIndex === undefined) {
          continue;
        }
        const { userId } = solution;
        if (!rankMap.has(userId)) {
          continue;
        }
        const curRankData = rankMap.get(userId)!;
        const stat = curRankData.stats?.[problemIndex];
        if (!stat) {
          continue;
        }
        if (
          [
            ESolutionResult.RPD,
            ESolutionResult.WT,
            ESolutionResult.JG,
            ESolutionResult.CE,
            ESolutionResult.SE,
            ESolutionResult.NLF,
          ].includes(solution.result)
        ) {
          // 非有效提交，忽略
          continue;
        } else if (stat.result === 'FB' || stat.result === 'AC') {
          // 如果该用户这个题目之前已经 AC，则不处理
          continue;
        } else if (!displayAll && frozenStart <= solution.createdAt) {
          // 如果封榜，则尝试 +1
          stat.tries++;
          stat.result = '?';
          if (isICPCWithScore) {
            stat.score = stat.score ?? 0;
          }
        } else if (solution.result !== ESolutionResult.AC) {
          // 如果为错误的提交
          stat.tries++;
          stat.result = 'RJ';
          if (isICPCWithScore) {
            stat.score = stat.score ?? 0;
          }
        } else {
          // 如果该次提交为 AC
          const elapsedMs = solution.createdAt.getTime() - competition.startAt.getTime();
          // @ts-ignore
          stat.time = Math.floor(elapsedMs / 1000);
          const problemPenalty = isICPCWithScore ? 0 : 20 * 60 * stat.tries;
          curRankData.time += stat.time + problemPenalty;
          if (isICPCWithScore) {
            // 计算得分
            const problem = problems[problemIndex];
            let score = problem.score || 0;
            if (problem.varScoreExpression) {
              const compiledExpression = compileVarScoreExpression(problem.varScoreExpression, {
                score: problem.score!,
                problemIndex,
                elapsedTime: {
                  h: Math.floor(elapsedMs / 1000 / 60 / 60),
                  min: Math.floor(elapsedMs / 1000 / 60),
                  s: Math.floor(elapsedMs / 1000),
                },
                tries: stat.tries,
              });
              const vm = await getScoreExpressionVM();
              vmToDrop = vm;
              score = await vm.eval(compiledExpression);
            }
            stat.score = score;
          }
          stat.tries++;
          // 判断是否为 FB
          // 因为提交是按顺序获得的，因此第一个 AC 的提交就是 FB
          if (fb[problemIndex]) {
            fb[problemIndex] = false;
            stat.result = 'FB';
          } else {
            stat.result = 'AC';
          }
          // 更新总分
          curRankData.score += isICPCWithScore ? stat.score! : 1;
        }
      }
      const ranklist: IMCompetitionRanklist = [];
      rankMap.forEach((r) => {
        ranklist.push(r);
      });
      // 排序
      ranklist.sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        return a.time - b.time;
      });
      if (ranklist.length) {
        // 计算并列排名
        ranklist[0].rank = 1;
        for (let i = 1; i < ranklist.length; ++i) {
          if (
            ranklist[i].score === ranklist[i - 1].score &&
            ranklist[i].time === ranklist[i - 1].time
          ) {
            ranklist[i].rank = ranklist[i - 1].rank;
          } else {
            ranklist[i].rank = i + 1;
          }
        }
      }
      res = ranklist;
      vmToDrop?.drop();
      await this._setCompetitionRanklistCache(competitionId, god, res);
    }

    return {
      count: res.length,
      rows: res,
    };
  }

  /**
   * 清除比赛 Ranklist 缓存。
   * @param competitionId competitionId
   * @param god 是否上帝视角（不传则清空全部）
   */
  async clearCompetitionRanklistCache(
    competitionId: ICompetitionModel['competitionId'],
    god?: boolean,
  ): Promise<void | [void, void]> {
    if (god === undefined) {
      return Promise.all([
        this.ctx.helper.redisDel(this.redisKey.competitionRanklist, [competitionId, true]),
        this.ctx.helper.redisDel(this.redisKey.competitionRanklist, [competitionId, false]),
      ]);
    }
    return this.ctx.helper.redisDel(this.redisKey.competitionRanklist, [competitionId, god]);
  }

  /**
   * 获取比赛 Rating 计算状态。
   * @param competitionId competitionId
   */
  async getRatingStatus(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionServiceGetRatingStatusRes> {
    return this.ctx.helper.redisGet<IMCompetitionRatingStatus>(
      this.redisKey.competitionRatingStatus,
      [competitionId],
    );
  }

  /**
   * 设置比赛 Rating 计算状态。
   * @param competitionId competitionId
   * @param data 数据
   */
  async setRatingStatus(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionRatingStatus,
  ): Promise<void> {
    return this.ctx.helper.redisSet(this.redisKey.competitionRatingStatus, [competitionId], data);
  }

  /**
   * 清除比赛 Rating 计算状态。
   * @param competitionId competitionId
   * @param god 是否上帝视角（不传则清空全部）
   */
  async deleteRatingStatus(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<void | [void, void]> {
    return this.ctx.helper.redisDel(this.redisKey.competitionRatingStatus, [competitionId]);
  }

  /**
   * 设置比赛 RankData。此数据将用于提供给计算脚本进行 rating 计算。
   * @param competitionId competitionId
   * @param data 数据
   */
  async setRankData(
    competitionId: ICompetitionModel['competitionId'],
    data: IMCompetitionRankData,
  ) {
    return this.ctx.helper.redisSet(this.redisKey.competitionRankData, [competitionId], data);
  }

  async getLatestTwoRatingContests() {
    const latestCompetitions = await this.ratingContestModel.findAll({
      attributes: ratingContestDetailFields,
      order: [['ratingContestId', 'DESC']],
      limit: 2,
    });
    return latestCompetitions.map(
      (d) => d && (d.get({ plain: true }) as IMContestRatingContestDetail),
    );
  }

  async deleteRatingContest(competitionId: ICompetitionModel['competitionId']) {
    if (!competitionId) {
      return;
    }
    await this.ratingContestModel.destroy({
      where: {
        competitionId,
      },
    });
  }

  /**
   * 获取 Rating 比赛详情。
   * @param competitionId competitionId
   */
  async getRatingContestDetail(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMCompetitionServiceGetRatingContestDetailRes> {
    let res: IMCompetitionServiceGetRatingContestDetailRes = null;
    const cached = await this._getRatingContestDetailCache(competitionId);
    if (cached) {
      res = cached;
    } else if (cached === null) {
      res = await this.ratingContestModel
        .findOne({
          attributes: ratingContestDetailFields,
          where: {
            competitionId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IMContestRatingContestDetail));
      res && (await this._setRatingContestDetailCache(competitionId, res));
    }
    return res;
  }

  /**
   * 清除 Rating 详情缓存。
   * @param competitionId competitionId
   */
  async clearRatingContestDetailCache(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.ratingContestDetailForCompetition, [
      competitionId,
    ]);
  }

  async getSpGenshinParticipantCanViewProblemIndexes(
    competitionId: ICompetitionModel['competitionId'],
    userId: IUserModel['userId'],
    spConfig: ICompetitionSpConfig,
  ): Promise<number[]> {
    const sections = spConfig?.genshinConfig?.explorationModeOptions?.sections || [];
    const unlockRawRecords = await this.competitionLogService.findAllLogs(competitionId, {
      action: ECompetitionLogAction.SpGenshinExplorationUnlock,
      opUserId: userId,
    });
    const unlockedSectionIdSet = new Set<string>();
    unlockRawRecords.rows.forEach((record) => {
      const sectionId = record.detail?.sectionId as string;
      if (!sections.some((section) => section.id === sectionId)) {
        return;
      }
      unlockedSectionIdSet.add(sectionId);
    });
    const unlockedProblemIndexes: number[] = [];
    for (const section of sections) {
      if (section.unlockByDefault || unlockedSectionIdSet.has(section.id)) {
        unlockedProblemIndexes.push(...section.problemIndexes);
      }
    }
    return unlockedProblemIndexes;
  }

  async checkCompetitionAchievements(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<void> {
    const _start = Date.now();
    this.ctx.logger.info(`[checkCompetitionAchievements ${competitionId}] started`);
    const attendedParticipants = (await this.getCompetitionUsers(competitionId)).rows.filter(
      (r) =>
        r.role === ECompetitionUserRole.participant &&
        [ECompetitionUserStatus.entered, ECompetitionUserStatus.quitted].includes(r.status) &&
        !r.banned,
    );
    this.ctx.logger.info(
      `[checkCompetitionAchievements ${competitionId}] found ${attendedParticipants.length} participants`,
    );
    const userIds = attendedParticipants.map((r) => r.userId);
    const userIdSet = new Set(userIds);

    const detail = await this.getDetail(competitionId, null);
    const settings = await this.getCompetitionSettingDetail(competitionId);
    if (!detail || !settings) {
      this.ctx.logger.info(`[checkCompetitionAchievements ${competitionId}] not found, skip`);
      return;
    }
    // 参与比赛
    const competitionBrands = (detail.spConfig as ICompetitionSpConfig)?.brands || [];
    let commonAchievementKeys: EAchievementKey[] = [];
    if (competitionBrands.includes('APF')) {
      commonAchievementKeys.push(EAchievementKey.AttendCompetitionAPF);
    }
    if (competitionBrands.includes('SDUTPC')) {
      commonAchievementKeys.push(EAchievementKey.AttendCompetitionSDUTPC);
    }
    if (competitionBrands.includes('SDUTRound')) {
      commonAchievementKeys.push(EAchievementKey.AttendCompetitionSDUTRound);
    }
    if (competitionBrands.includes('AzurSeries')) {
      commonAchievementKeys.push(EAchievementKey.AttendCompetitionAzurSeries);
    }
    if (competitionBrands.includes('Genshin')) {
      commonAchievementKeys.push(EAchievementKey.AttendCompetitionGenshinImpact);
    }
    const pq = new this.PromiseQueue(10, Infinity);
    let queueTasks = userIds.map((userId) =>
      pq.add(async () => {
        try {
          await Promise.all(
            commonAchievementKeys.map((key) =>
              this.userAchievementService.addUserAchievementAndPush(userId, key, detail.endAt),
            ),
          );
        } catch (e) {
          this.ctx.logger.error(
            `[checkCompetitionAchievements ${competitionId}/${userId}] add attended achievements failed:`,
            e,
          );
        }
      }),
    );
    await Promise.all(queueTasks);
    // 比赛题目
    const problems = (await this.getCompetitionProblems(competitionId)).rows;
    const problemIds = problems.map((p) => p.problemId);
    const problemFbUserIdMap = new Map<number, number>();
    // 比赛提交
    const solutions = (
      await this.solutionService.getAllCompetitionSolutionList(competitionId)
    ).filter(
      (s) =>
        problemIds.includes(s.problemId) &&
        userIdSet.has(s.userId) &&
        ![
          ESolutionResult.WT,
          ESolutionResult.JG,
          ESolutionResult.RPD,
          ESolutionResult.CNL,
          ESolutionResult.CE,
          ESolutionResult.SE,
          ESolutionResult.NLF,
        ].includes(s.result),
    );
    const acSolutions = solutions.filter((s) => s.result === ESolutionResult.AC);
    const userSolutionsMap = new Map<number, typeof solutions>();
    const userACSolutionsMap = new Map<number, typeof acSolutions>();
    const userACProblemIdSetMap = new Map<number, Set<number>>();
    const userAttemptedProblemIdSetMap = new Map<number, Set<number>>();
    const akUserIdsSet = new Set<number>();
    solutions.forEach((s) => {
      const { userId, problemId, result } = s;
      if (!userSolutionsMap.has(userId)) {
        userSolutionsMap.set(userId, []);
      }
      if (!userACSolutionsMap.has(userId)) {
        userACSolutionsMap.set(userId, []);
      }
      if (!userACProblemIdSetMap.has(userId)) {
        userACProblemIdSetMap.set(userId, new Set());
      }
      if (!userAttemptedProblemIdSetMap.has(userId)) {
        userAttemptedProblemIdSetMap.set(userId, new Set());
      }

      const userACProblemIdSet = userACProblemIdSetMap.get(userId)!;
      userAttemptedProblemIdSetMap.get(userId)!.add(problemId);
      // 一旦一个题目已经 AC 过，则之后的提交被忽略
      if (userACProblemIdSet.has(problemId)) {
        return;
      }

      userSolutionsMap.get(userId)!.push(s);
      if (result === ESolutionResult.AC) {
        userACSolutionsMap.get(userId)!.push(s);
        userACProblemIdSet.add(problemId);
        if (userACProblemIdSet.size >= problemIds.length) {
          akUserIdsSet.add(userId);
        }
      }
    });
    // AK
    const akUserIds = Array.from(akUserIdsSet);
    this.ctx.logger.info(
      `[checkCompetitionAchievements ${competitionId}] AK users: [${akUserIds.join(',')}]`,
    );
    queueTasks = akUserIds.map((userId) =>
      pq.add(async () => {
        try {
          await this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.AK,
            detail.endAt,
          );
        } catch (e) {
          this.ctx.logger.error(
            `[checkCompetitionAchievements ${competitionId}/${userId}] add AK achievement failed:`,
            e,
          );
        }
      }),
    );
    await Promise.all(queueTasks);
    // 1A
    if (problemIds.length >= 5) {
      const oneHitACUserIds: number[] = [];
      for (const [userId, acProblems] of userACProblemIdSetMap) {
        if (acProblems.size >= 5) {
          const userSolutionsOfACProblems = userSolutionsMap
            .get(userId)!
            .filter((s) => acProblems.has(s.problemId));
          if (userSolutionsOfACProblems.every((s) => s.result === ESolutionResult.AC)) {
            oneHitACUserIds.push(userId);
          }
        }
      }
      this.ctx.logger.info(
        `[checkCompetitionAchievements ${competitionId}] 1A users: [${oneHitACUserIds}]`,
      );
      queueTasks = oneHitACUserIds.map((userId) =>
        pq.add(async () => {
          try {
            await this.userAchievementService.addUserAchievementAndPush(
              userId,
              EAchievementKey.Competition1AMaster,
              detail.endAt,
            );
          } catch (e) {
            this.ctx.logger.error(
              `[checkCompetitionAchievements ${competitionId}/${userId}] add 1A achievement failed:`,
              e,
            );
          }
        }),
      );
    }
    await Promise.all(queueTasks);
    // FB
    acSolutions.forEach((s) => {
      if (!problemFbUserIdMap.has(s.problemId)) {
        problemFbUserIdMap.set(s.problemId, s.userId);
      }
    });
    const fbUserIds = Array.from(new Set(problemFbUserIdMap.values()));
    this.ctx.logger.info(
      `[checkCompetitionAchievements ${competitionId}] FB users: [${fbUserIds.join(',')}]`,
    );
    queueTasks = fbUserIds.map((userId) =>
      pq.add(async () => {
        try {
          await this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.FB,
            detail.endAt,
          );
        } catch (e) {
          this.ctx.logger.error(
            `[checkCompetitionAchievements ${competitionId}/${userId}] add FB achievement failed:`,
            e,
          );
        }
      }),
    );
    await Promise.all(queueTasks);
    // 个人罚时时间
    const largePenaltyUserIds: number[] = [];
    if (detail.rule === ECompetitionRulePreset.ICPC) {
      for (const [userId, solutions] of userSolutionsMap) {
        const acProblemIdSet = userACProblemIdSetMap.get(userId)!;
        let attemptedCount = 0;
        for (const solution of solutions) {
          if (solution.result !== ESolutionResult.AC && acProblemIdSet.has(solution.problemId)) {
            attemptedCount++;
          }
        }
        // TODO load penalty settings
        if (attemptedCount >= 10) {
          largePenaltyUserIds.push(userId);
        }
      }
      queueTasks = largePenaltyUserIds.map((userId) =>
        pq.add(async () => {
          try {
            await this.userAchievementService.addUserAchievementAndPush(
              userId,
              EAchievementKey.TooManyPenalties,
              detail.endAt,
            );
          } catch (e) {
            this.ctx.logger.error(
              `[checkCompetitionAchievements ${competitionId}/${userId}] add large penalty achievement failed:`,
              e,
            );
          }
        }),
      );
      await Promise.all(queueTasks);
    }
    // 全交全没过
    const allSubmittedButAllFailedUserIds: number[] = [];
    for (const [userId] of userSolutionsMap) {
      if (
        userAttemptedProblemIdSetMap.get(userId)!.size === problemIds.length &&
        userACProblemIdSetMap.get(userId)!.size === 0
      ) {
        allSubmittedButAllFailedUserIds.push(userId);
      }
    }
    this.ctx.logger.info(
      `[checkCompetitionAchievements ${competitionId}] all submitted all failed users: [${allSubmittedButAllFailedUserIds.join(
        ',',
      )}]`,
    );
    queueTasks = allSubmittedButAllFailedUserIds.map((userId) =>
      pq.add(async () => {
        try {
          await this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.AllSubmittedButAllFailed,
            detail.endAt,
          );
        } catch (e) {
          this.ctx.logger.error(
            `[checkCompetitionAchievements ${competitionId}/${userId}] add all submitted all failed achievement failed:`,
            e,
          );
        }
      }),
    );
    await Promise.all(queueTasks);
    // AC 连击
    const acComboUserIds: number[] = [];
    for (const [userId, acSolutions] of userACSolutionsMap) {
      let lastACTime: Date | undefined;
      for (const acSolution of acSolutions) {
        if (!lastACTime) {
          lastACTime = acSolution.createdAt;
          continue;
        }
        const timeDiff = acSolution.createdAt.getTime() - lastACTime.getTime();
        if (timeDiff <= 300 * 1000) {
          acComboUserIds.push(userId);
          break;
        }
        lastACTime = acSolution.createdAt;
      }
    }
    this.ctx.logger.info(
      `[checkCompetitionAchievements ${competitionId}] AC combo users: [${acComboUserIds.join(
        ',',
      )}]`,
    );
    queueTasks = acComboUserIds.map((userId) =>
      pq.add(async () => {
        try {
          await this.userAchievementService.addUserAchievementAndPush(
            userId,
            EAchievementKey.CompetitionACCombo,
            detail.endAt,
          );
        } catch (e) {
          this.ctx.logger.error(
            `[checkCompetitionAchievements ${competitionId}/${userId}] add AC combo achievement failed:`,
            e,
          );
        }
      }),
    );
    await Promise.all(queueTasks);

    // 封榜时间
    const frozenLength = settings?.frozenLength || 0;
    if (frozenLength > 0) {
      const frozenStart = new Date(detail.endAt.getTime() - frozenLength * 1000);
      const fzAcUserIds: number[] = [];
      for (const [userId, userAcSolutions] of userACSolutionsMap) {
        for (const solution of userAcSolutions) {
          if (solution.createdAt >= frozenStart) {
            fzAcUserIds.push(userId);
            break;
          }
        }
      }
      this.ctx.logger.info(
        `[checkCompetitionAchievements ${competitionId}] AC during frozen users: [${fzAcUserIds.join(
          ',',
        )}]`,
      );
      queueTasks = fzAcUserIds.map((userId) =>
        pq.add(async () => {
          try {
            await this.userAchievementService.addUserAchievementAndPush(
              userId,
              EAchievementKey.SolveDuringFrozenTime,
              detail.endAt,
            );
          } catch (e) {
            this.ctx.logger.error(
              `[checkCompetitionAchievements ${competitionId}/${userId}] add FZ achievement failed:`,
              e,
            );
          }
        }),
      );
      await Promise.all(queueTasks);
    }

    this.ctx.logger.info(
      `[checkCompetitionAchievements ${competitionId}] finished in ${Date.now() - _start}ms`,
    );
  }

  async checkCompetitionRatingAchievements(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<void> {
    const _start = Date.now();
    this.ctx.logger.info(`[checkCompetitionRatingAchievements ${competitionId}] started`);
    const detail = await this.getDetail(competitionId, null);
    const ratingContestDetail = await this.getRatingContestDetail(competitionId);
    if (!detail || !ratingContestDetail) {
      this.ctx.logger.info(
        `[checkCompetitionRatingAchievements ${competitionId}] no rating detail, skip`,
      );
      return;
    }
    const { ratingUntil } = ratingContestDetail;
    const userIds = Object.keys(ratingUntil).map((id) => +id);
    const pq = new this.PromiseQueue(10, Infinity);
    const queueTasks = userIds.map((userId) =>
      pq.add(async () => {
        try {
          if (!userId) {
            this.ctx.logger.warn(
              `[checkCompetitionRatingAchievements ${competitionId}/${userId}] invalid user, skipped`,
            );
            return;
          }
          const { rating } = ratingUntil[userId];
          let key: EAchievementKey | undefined;
          if (rating >= 2500) {
            key = EAchievementKey.RatingLv4;
          } else if (rating >= 2200) {
            key = EAchievementKey.RatingLv3;
          } else if (rating >= 1900) {
            key = EAchievementKey.RatingLv2;
          } else if (rating >= 1600) {
            key = EAchievementKey.RatingLv1;
          }
          key &&
            (await this.userAchievementService.addUserAchievementAndPush(
              userId,
              key,
              detail.endAt,
            ));

          key = undefined;
          const userDetail = await this.userService.getDetail(userId);
          const ratingCount = (userDetail?.ratingHistory || []).length;
          if (ratingCount >= 20) {
            key = EAchievementKey.AttendRatingCompetitionsLv3;
          } else if (ratingCount >= 5) {
            key = EAchievementKey.AttendRatingCompetitionsLv2;
          } else if (ratingCount >= 1) {
            key = EAchievementKey.AttendRatingCompetitionsLv1;
          }
          key &&
            (await this.userAchievementService.addUserAchievementAndPush(
              userId,
              key,
              detail.endAt,
            ));
        } catch (e) {
          this.ctx.logger.error(
            `[checkCompetitionRatingAchievements ${competitionId}/${userId}] failed:`,
            e,
          );
        }
      }),
    );
    await Promise.all(queueTasks);
    this.ctx.logger.info(
      `[checkCompetitionRatingAchievements ${competitionId}] finished in ${Date.now() - _start}ms`,
    );
  }
}
