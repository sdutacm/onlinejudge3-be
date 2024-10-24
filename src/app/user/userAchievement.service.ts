import { provide, inject, Context } from 'midway';
import { IUtils } from '@/utils';
import { TUserAchievementModel } from '@/lib/models/userAchievement.model';
import { IMUserAchievementDetail } from './user.interface';
import { ILodash } from '@/utils/libs/lodash';
import { EUserAchievementStatus } from '@/common/enums';
import { CSocketBridgeEmitter } from '@/utils/socketBridgeEmitter';
import { EAchievementKey } from '@/common/configs/achievement.config';

export type CUserAchievementService = UserAchievementService;

const userAchievementLiteFields = [
  'userAchievementId',
  'userId',
  'achievementKey',
  'status',
  'createdAt',
];

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

  public async getUserAchievements(
    userId: number,
  ): Promise<Omit<IMUserAchievementDetail, 'userId'>[]> {
    const res = await this.userAchievementModel
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
    return res;
  }

  public async addUserAchievement(
    userId: number,
    achievementKey: EAchievementKey,
    status?: EUserAchievementStatus,
  ) {
    const existed = await this.userAchievementModel.findOne({
      where: {
        userId,
        achievementKey,
      },
    });
    if (existed) {
      return {
        userAchievementId: existed.userAchievementId,
        status: existed.status,
        existed: true,
      };
    }
    const res = await this.userAchievementModel.create({
      userId,
      achievementKey,
      status: status ?? EUserAchievementStatus.created,
      createdAt: new Date(),
    });
    return {
      userAchievementId: res.userAchievementId,
    };
  }

  public async pushAchievementAchieved(userId: number, achievementKey: EAchievementKey) {
    await this.socketBridgeEmitter.emit('pushAchievementAchieved', {
      userId,
      achievementKeys: [achievementKey],
    });
  }

  public async addUserAchievementAndPush(userId: number, achievementKey: EAchievementKey) {
    const { userAchievementId, existed, status } = await this.addUserAchievement(
      userId,
      achievementKey,
    );
    if (existed && status !== EUserAchievementStatus.created) {
      return { userAchievementId };
    }
    await this.pushAchievementAchieved(userId, achievementKey);
    return { userAchievementId };
  }

  public async isAchievementAchieved(userId: number, achievementKey: EAchievementKey) {
    const res = await this.userAchievementModel.findOne({
      where: {
        userId,
        achievementKey,
      },
    });
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
    return res[0] > 0;
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
    return res[0] > 0;
  }
}
