import { provide, inject, Context } from 'midway';
import { IUtils } from '@/utils';
import { TUserAchievementModel } from '@/lib/models/userAchievement.model';
import { IMUserAchievementDetail } from './user.interface';
import { ILodash } from '@/utils/libs/lodash';
import { EUserAchievementStatus } from '@/common/enums';

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

  public async addUserAchievement(userId: number, achievementKey: string) {
    const res = await this.userAchievementModel.create({
      userId,
      achievementKey,
      status: EUserAchievementStatus.created,
    });
    return res.userAchievementId;
  }
}
