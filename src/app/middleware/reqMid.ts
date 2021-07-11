import { Context } from 'midway';
import { v4 as uuidv4 } from 'uuid';

export default function (options: any, app: any) {
  return async (ctx: Context, next: any) => {
    const _start = Date.now();
    const logger = ctx.getLogger('reqLogger');
    const requestId = uuidv4().substr(0, 8);
    try {
      ctx.requestId = requestId;
      if (ctx.session?.userId) {
        try {
          const lastAccessAt = new Date(ctx.session.lastAccessAt).getTime();
          // 最少间隔 10s 记录一次最近访问
          if (Date.now() - lastAccessAt > 10 * 1000) {
            ctx.session.lastAccessIp = ctx.ip;
            ctx.session.lastAccessAt = new Date().toISOString();
          }
        } catch (e) {
          logger.error('update session err:', e);
        }
      }
      await next();
      logger.info(
        `[status: ${ctx.status}] [code: ${ctx.body?.code || 0}] [referer: ${
          ctx.header.referer
        }] [ua: ${ctx.header['user-agent']}]`,
      );
    } catch (e) {
      logger.error(`[referer: ${ctx.header.referer}] [ua: ${ctx.header['user-agent']}]`);
      throw e;
    } finally {
      ctx.set('X-Request-ID', requestId);
      ctx.set('X-Execute-time', `${Date.now() - _start}`);
    }
  };
}
