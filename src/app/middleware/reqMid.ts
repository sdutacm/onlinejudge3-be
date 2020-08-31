import { Context } from 'midway';

export default function (options: any, app: any) {
  return async (ctx: Context, next: any) => {
    const _start = Date.now();
    const logger = ctx.getLogger('reqLogger');
    try {
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
      ctx.set('X-Execute-time', `${Date.now() - _start}`);
    }
  };
}
