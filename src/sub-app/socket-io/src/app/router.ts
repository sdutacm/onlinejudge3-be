import { Application } from 'midway';

module.exports = (app: Application) => {
  app.router.get('/socketBridge/healthCheck', app.io.controller.emit.healthCheck);
  app.router.post('/socketBridge/emit/:action', app.io.controller.emit.innerHttpEmit);

  // for socket.io health check, test by http "/socket.io/?transport=polling"
  app.io.of('/judger').route('subscribe', app.io.controller.judger.subscribe);
  app.io.of('/competition').route('subscribe', app.io.controller.competition.subscribe);
};
