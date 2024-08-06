import { Application } from 'midway';
import { roomKey } from '../../config/room';

module.exports = (app: Application) => {
  class AchievementService extends app.Service {
    readonly nsp = '/general';

    async pushAchievementCompleted(body: string[]) {
      const achievementKeys = body;
      const userId = this.ctx.session.userId;
      this.ctx.logger.info('[achievement] pushAchievementCompleted:', userId, achievementKeys);
      this.ctx.app.io
        .of(this.nsp)
        .to(roomKey.user(userId))
        .emit('achievementCompleted', achievementKeys);
    }
  }

  return AchievementService;
};
