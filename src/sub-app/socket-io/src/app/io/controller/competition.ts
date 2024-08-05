import { roomKey } from '../../../config/room';
import { Application } from 'midway';

module.exports = (app: Application) => {
  class CompetitionController extends app.Controller {
    async subscribe() {
      const [competitionId] = this.ctx.args;
      if (!(competitionId > 0)) {
        return;
      }
      const userId = this.ctx.session.userId;
      const session = this.ctx.session.competitions?.[competitionId];
      if (!session) {
        this.ctx.socket.emit('res', 'no permission', competitionId);
        return;
      }
      console.log(`[competition] client subscribe: ${competitionId} ${userId}`);
      this.ctx.socket.join(roomKey.competition(competitionId));
      this.ctx.socket.join(roomKey.competitionUser(competitionId, userId));
      this.ctx.socket.emit('res', 'subscribed', competitionId);
    }
  }

  return CompetitionController;
};
