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
        ctx.status = 404;
        ctx.body = ctx.helper.rFail(Codes.GENERAL_FEATURE_NOT_AVAILABLE);
        return;
      }
    }
    return next();
  };
}
