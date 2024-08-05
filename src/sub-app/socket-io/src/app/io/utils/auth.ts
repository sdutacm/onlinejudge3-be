import { Context } from 'midway';
import type { IAppConfig } from '../../../config/config.interface';

export function checkEmitAuth(ctx: Context, config: IAppConfig) {
  if (config.emitAuthKey && config.emitAuthKey === ctx.request.headers['x-emit-auth']) {
    return true;
  }
  // if (isPrivateIp(ctx.ip)) {
  //   return true;
  // }
  return false;
}
