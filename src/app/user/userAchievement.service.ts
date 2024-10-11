import { provide, inject, Context } from 'midway';
import { IUtils } from '@/utils';
import { TUserAchievementModel } from '@/lib/models/userAchievement.model';
import { IMUserAchievementDetail } from './user.interface';
import { ILodash } from '@/utils/libs/lodash';
import { EUserAchievementStatus } from '@/common/enums';
import { CSocketBridgeEmitter } from '@/utils/socketBridgeEmitter';
import { EAchievementKey } from '@/common/configs/achievement.config';

export type CUserAchievementService = UserAchievementService;

const userAchievementLiteFields = ['userAchievementId', 'userId', 'achievementKey', 'createdAt'];

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
      return existed.userAchievementId;
    }
    const res = await this.userAchievementModel.create({
      userId,
      achievementKey,
      status: status ?? EUserAchievementStatus.created,
    });
    return res.userAchievementId;
  }

  public async addUserAchievementAndPush(userId: number, achievementKey: EAchievementKey) {
    const userAchievementId = await this.addUserAchievement(userId, achievementKey);
    await this.socketBridgeEmitter.emit('pushAchievementCompleted', {
      userId,
      achievementKeys: [achievementKey],
    });
    await this.userAchievementModel.update(
      {
        status: EUserAchievementStatus.deliveried,
      },
      {
        where: {
          userAchievementId,
          status: EUserAchievementStatus.created,
        },
      },
    );
    return userAchievementId;
  }
}
