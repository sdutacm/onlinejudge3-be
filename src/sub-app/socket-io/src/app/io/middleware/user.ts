import { Application, Context } from 'midway';
import { roomKey } from '../../../config/room';

module.exports = (app: Application) => {
  return async (ctx: Context, next: Function) => {
    if (!ctx.session?.userId) {
      ctx.socket.disconnect();
      return;
    }
    ctx.socket.join(roomKey.user(ctx.session.userId));
    ctx.logger.info(`[user] ${ctx.session.userId} joined`);
    await next();
    ctx.logger.info(`[user] ${ctx.session.userId} exited`);
  };
};
