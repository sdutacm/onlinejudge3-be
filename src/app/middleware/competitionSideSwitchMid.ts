import { Context } from 'midway';
import { routesBe } from '@/common/routes';
import { Codes } from '@/common/codes';

export default function (options: any, app: any) {
  return async (ctx: Context, next: any) => {
    if (process.env.COMPETITION_SIDE === '1') {
      const possibleRouteName = (ctx.path || '').split('/').pop();
      if (
        !possibleRouteName ||
        // @ts-ignore
        !routesBe[possibleRouteName] ||
        // @ts-ignore
        !routesBe[possibleRouteName].competitionSide
      ) {
        ctx.status = 451;
        ctx.body = ctx.helper.rFail(Codes.GENERAL_FEATURE_NOT_AVAILABLE);
        const logger = ctx.getLogger('reqLogger');
        logger.info(
          `[status: ${ctx.status}] [code: -] [referer: ${ctx.header.referer}] [ua: ${ctx.header['user-agent']}] COMPETITION_SIDE limited: ${ctx.path} ${ctx.url}`,
        );
        return;
      }
    }
    return next();
  };
}
