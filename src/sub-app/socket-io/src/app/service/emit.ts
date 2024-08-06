import { Application } from 'midway';

module.exports = (app: Application) => {
  class EmitService extends app.Service {
    pushJudgeStatus(data: any) {
      return this.ctx.service.judger.pushJudgeStatus(data);
    }

    pushCompetitionEvent(data: any) {
      return this.ctx.service.competition.pushCompetitionEvent(data);
    }

    pushAchievementCompleted(data: any) {
      return this.ctx.service.achievement.pushAchievementCompleted(data);
    }
  }

  return EmitService;
};
