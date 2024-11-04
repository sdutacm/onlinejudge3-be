import { provide, inject, Context, config } from 'midway';
import { fn, col } from 'sequelize';
import { IUtils } from '@/utils';
import { TUserAchievementModel } from '@/lib/models/userAchievement.model';
import { IMUserAchievementDetail, IUserModel } from './user.interface';
import { ILodash } from '@/utils/libs/lodash';
import { EUserAchievementStatus } from '@/common/enums';
import { CSocketBridgeEmitter } from '@/utils/socketBridgeEmitter';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IDurationsConfig } from '@/config/durations.config';
import { IAchievementRateItem } from '../achievement/achievement.interface';

export type CUserAchievementService = UserAchievementService;

const userAchievementLiteFields = [
  'userAchievementId',
  'userId',
  'achievementKey',
  'status',
  'createdAt',
];

type IUserAchievement = Omit<IMUserAchievementDetail, 'userId'>;

@provide()
export default class UserAchievementService {
  @inject()
  userAchievementModel: TUserAchievementModel;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @inject()
  socketBridgeEmitter: CSocketBridgeEmitter;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;

  /**
   * 获取用户成就列表缓存。
   * 如果未找到缓存，则返回 `null`
   * @param userId userId
   */
  private async _getUserAchievementsCache(
    userId: IUserModel['userId'],
  ): Promise<IUserAchievement[] | null> {
    return this.ctx.helper
      .redisGet<IUserAchievement[]>(this.redisKey.userAchievements, [userId])
      .then((res) => {
        if (!Array.isArray(res)) {
          return null;
        }
        return res.map((d) => ({ ...d, createdAt: new Date(d.createdAt) }));
      });
  }

  /**
   * 设置用户成就列表缓存。
   * @param userId userId
   * @param data
   */
  private async _setUserAchievementsCache(
    userId: IUserModel['userId'],
    data: IUserAchievement[],
  ): Promise<void> {
    if (!data) {
      return;
    }
    return this.ctx.helper.redisSet(
      this.redisKey.userAchievements,
      [userId],
      data,
      this.durations.cacheFullList,
    );
  }

  /**
   * 获取成就达成率缓存。
   * 如果未找到缓存，则返回 `null`
   */
  private async _getAchievementRateCache(): Promise<IAchievementRateItem[] | null> {
    return this.ctx.helper.redisGet<IAchievementRateItem[]>(this.redisKey.achievementRate, []);
  }

  /**
   * 设置成就达成率缓存。
   * @param data 成就达成率数据
   */
  private async _setAchievementRateCache(data: IAchievementRateItem[]): Promise<void> {
    return this.ctx.helper.redisSet(
      this.redisKey.achievementRate,
      [],
      data,
      this.durations.cacheFullList,
    );
  }

  /**
   * 清除用户成就列表缓存。
   * @param userId userId
   */
  async clearUserAchievementsCache(userId: IUserModel['userId']): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.userAchievements, [userId]);
  }

  /**
   * 清除成就达成率缓存。
   */
  async clearAchievementRateCache(): Promise<void> {
    return this.ctx.helper.redisDel(this.redisKey.achievementRate, []);
  }

  public async getUserAchievements(userId: number): Promise<IUserAchievement[]> {
    let res: IUserAchievement[];
    const cached = await this._getUserAchievementsCache(userId);
    if (cached) {
      res = cached;
    } else {
      res = await this.userAchievementModel
        .findAll({
          where: {
            userId,
          },
          attributes: userAchievementLiteFields,
          order: [['userAchievementId', 'ASC']],
        })
        .then((r) =>
          this.lodash
            .uniqBy(r, 'achievementKey')
            .map((d) =>
              this.lodash.omit(d.get({ plain: true }) as IMUserAchievementDetail, ['userId']),
            ),
        );
      await this._setUserAchievementsCache(userId, res);
    }
    return res;
  }

  private async createUserAchievement(
    userId: number,
    achievementKey: EAchievementKey,
    status?: EUserAchievementStatus,
  ) {
    const res = await this.userAchievementModel.create({
      userId,
      achievementKey,
      status: status ?? EUserAchievementStatus.created,
      createdAt: new Date(),
    });
    await Promise.all([this.clearUserAchievementsCache(userId), this.clearAchievementRateCache()]);
    return {
      userAchievementId: res.userAchievementId,
    };
  }

  private async getOneUserAchievement(userId: number, achievementKey: EAchievementKey) {
    const fullCached = await this._getUserAchievementsCache(userId);
    let res: IUserAchievement | null;
    if (fullCached) {
      res = fullCached.find((d) => d.achievementKey === achievementKey) || null;
    } else {
      res = await this.userAchievementModel
        .findOne({
          where: {
            userId,
            achievementKey,
          },
          attributes: userAchievementLiteFields,
        })
        .then(
          (r) =>
            r && this.lodash.omit(r.get({ plain: true }) as IMUserAchievementDetail, ['userId']),
        );
    }
    return res;
  }

  public async pushAchievementAchieved(userId: number, achievementKey: EAchievementKey) {
    await this.socketBridgeEmitter.emit('pushAchievementAchieved', {
      userId,
      achievementKeys: [achievementKey],
    });
  }

  public async addUserAchievementAndPush(userId: number, achievementKey: EAchievementKey) {
    if (!userId || !achievementKey) {
      return;
    }
    const existed = await this.getOneUserAchievement(userId, achievementKey);
    if (existed && existed.status !== EUserAchievementStatus.created) {
      return;
    } else if (!existed) {
      this.ctx.logger.info(`[achievement ${userId}] +${achievementKey}`);
      await this.createUserAchievement(userId, achievementKey);
    }
    await this.pushAchievementAchieved(userId, achievementKey);
  }

  public async isAchievementAchieved(userId: number, achievementKey: EAchievementKey) {
    const res = await this.getOneUserAchievement(userId, achievementKey);
    return !!res;
  }

  public async confirmAchievementDeliveried(userId: number, achievementKey: EAchievementKey) {
    const res = await this.userAchievementModel.update(
      {
        status: EUserAchievementStatus.deliveried,
      },
      {
        where: {
          userId,
          achievementKey,
          status: EUserAchievementStatus.created,
        },
      },
    );
    const updated = res[0] > 0;
    if (updated) {
      await Promise.all([
        this.clearUserAchievementsCache(userId),
        this.clearAchievementRateCache(),
      ]);
    }
    return updated;
  }

  public async receiveAchievement(userId: number, achievementKey: EAchievementKey) {
    const res = await this.userAchievementModel.update(
      {
        status: EUserAchievementStatus.received,
      },
      {
        where: {
          userId,
          achievementKey,
        },
      },
    );
    const updated = res[0] > 0;
    if (updated) {
      await Promise.all([
        this.clearUserAchievementsCache(userId),
        this.clearAchievementRateCache(),
      ]);
    }
    return updated;
  }

  /**
   * 获取成就达成率。
   */
  async getAchievementRate(): Promise<IAchievementRateItem[]> {
    let res: IAchievementRateItem[];
    const cached = await this._getAchievementRateCache();
    if (cached) {
      res = cached;
    } else {
      const dbRes = await this.userAchievementModel.findAll({
        attributes: [
          'achievementKey',
          [fn('COUNT', fn('DISTINCT', col('user_id'))), 'achievedUserCount'],
        ],
        group: ['achievementKey'],
      });
      res = dbRes.map((d) => ({
        achievementKey: d.achievementKey,
        achievedUserCount: d.get('achievedUserCount') as number,
      }));
      await this._setAchievementRateCache(res);
    }
    return res;
  }
}
