import { Application, Context } from 'midway';

module.exports = (app: Application) => {
  return async (ctx: Context, next: Function) => {
    if (!ctx.session?.userId) {
      ctx.socket.emit('msg', 'Please login first');
      ctx.socket.disconnect();
      ctx.logger.info(`[login] no session, disconnected`);
      return;
    }
    ctx.logger.info(`[login] user ${ctx.session.userId} connected`);
    await next();
    ctx.logger.info(`[login] user ${ctx.session.userId} disconnected`);
  };
};
