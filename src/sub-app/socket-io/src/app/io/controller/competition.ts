import { Application } from 'midway';
import { checkEmitAuth } from '../utils/auth';

module.exports = (app: Application) => {
  class CompetitionController extends app.Controller {
    async subscribe() {
      const [competitionId, userId] = this.ctx.args;
      if (!(competitionId > 0 && userId > 0)) {
        return;
      }
      console.log(`[competition] client subscribe: ${competitionId} ${userId}`);
      const room = `competition:${competitionId}_${userId}`;
      this.ctx.socket.join(room);
      this.ctx.socket.emit('res', 'subscribed');
    }

    async innerHttpAcceptPushData() {
      if (!checkEmitAuth(this.ctx, this.config)) {
        this.ctx.status = 403;
        this.ctx.body = {
          success: false,
          code: -1,
          msg: '403',
        };
        return;
      }

      const { competitionId, userId, data } = this.ctx.request.body as {
        competitionId: number;
        userId: number;
        data: any;
      };
      this.ctx.logger.info('[competition] innerHttpAcceptPushData:', competitionId, userId, data);
      this.ctx.app.io
        .of('/competition')
        .to(`competition:${competitionId}_${userId}`)
        .emit('d', data);
      this.ctx.body = {
        success: true,
        data: {},
      };
    }
  }

  return CompetitionController;
};
