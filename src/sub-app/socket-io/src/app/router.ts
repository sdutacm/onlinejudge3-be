import { Application } from 'midway';

module.exports = (app: Application) => {
  app.router.post('/socketBridge/emit/:action', app.io.controller.emit.innerHttpEmit);

  app.io.of('/judger').route('subscribe', app.io.controller.judger.subscribe);
  app.io.of('/competition').route('subscribe', app.io.controller.competition.subscribe);
};
