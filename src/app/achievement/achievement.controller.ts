import { Context, controller, inject, provide } from 'midway';
import md5 from 'crypto-js/md5';
import { route, login } from '@/lib/decorators/controller.decorator';
import { CAchievementMeta } from './achievement.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import { CUserService } from '../user/user.service';
import { IGetAchievementRateResp } from '@/common/contracts/achievement';
import { CUserAchievementService } from '../user/userAchievement.service';

@provide()
@controller('/')
export default class AchievementController {
  @inject('achievementMeta')
  meta: CAchievementMeta;

  @inject()
  userAchievementService: CUserAchievementService;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  async [routesBe.getAchievementRate.i](ctx: Context): Promise<IGetAchievementRateResp> {
    const achievementRate = await this.userAchievementService.getAchievementRate();
    const userCount = await this.userService.getUserCount();
    const achievementRateList = achievementRate.map((r) => {
      return {
        hashKey: md5(`achievementKey:${r.achievementKey}`).toString(),
        count: r.achievedUserCount,
        rate: r.achievedUserCount ? this.lodash.floor(r.achievedUserCount / userCount, 4) : 0,
      };
    });
    return {
      count: achievementRateList.length,
      rows: achievementRateList,
    };
  }

  @route()
  @login()
  async [routesBe.requestAchievementPush.i](ctx: Context): Promise<void> {
    await this.userAchievementService.pushAllUndeliveredAchievements(ctx.session.userId);
  }
}
