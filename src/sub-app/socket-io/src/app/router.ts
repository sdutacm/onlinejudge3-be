import { Application } from 'midway';

module.exports = (app: Application) => {
  // or app.io.of('/').route('r', app.io.controller.x.y);
  // app.io.route('judger', app.io.controller.judger.subscribe);
  app.io.of('/judger').route('subscribe', app.io.controller.judger.subscribe);
  app.router.post(
    '/socketBridge/pushJudgeStatus',
    app.io.controller.judger.innerHttpAcceptPushStatus,
  );

  app.io.of('/competition').route('subscribe', app.io.controller.competition.subscribe);
  app.router.post(
    '/socketBridge/pushCompetitionData',
    app.io.controller.competition.innerHttpAcceptPushData,
  );
};
