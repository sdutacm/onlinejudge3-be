import { Application } from 'midway';
import { roomKey } from '../../config/room';

module.exports = (app: Application) => {
  class CompetitionService extends app.Service {
    readonly nsp = '/competition';

    async pushCompetitionEvent(body: { competitionId: number; userId?: number; data: any }) {
      const { competitionId, userId, data } = body;
      this.ctx.logger.info('[competition] pushCompetitionEvent:', competitionId, userId, data);
      console.info('[competition] pushCompetitionEvent:', competitionId, userId, data);
      const room = userId
        ? roomKey.competitionUser(competitionId, userId)
        : roomKey.competition(competitionId);
      this.ctx.app.io.of(this.nsp).to(room).emit('ev', data);
    }
  }

  return CompetitionService;
};
