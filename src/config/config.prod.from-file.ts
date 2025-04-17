import { EggAppInfo } from 'midway';
import { IAppConfig } from './config.interface';
import { formatLoggerHelper } from '@/utils/format';
import { routesBe, IRouteBeConfig } from '@/common/routes';
// @ts-ignore
import configDynamic from './config.dynamic';
import _ from 'lodash';

const csrfRoutes = Object.keys(routesBe)
  .map(
    (k) =>
      // @ts-ignore
      routesBe[k] as IRouteBeConfig,
  )
  .filter((route) => route.csrf);

export default (appInfo: EggAppInfo) => {
  let config = {} as IAppConfig;

  config.proxy = true;
  config.maxIpsCount = 1;

  config.security = {
    csrf: {
      enable: true,
      headerName: 'x-csrf-token',
      match: csrfRoutes.map((r) => r.url),
    },
  };

  config.logger = {
    // @ts-ignore
    formatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}]`);
    },
    contextFormatter(meta: any) {
      if (meta?.ctx?.requestId) {
        meta.requestId = meta.ctx.requestId;
      }
      return formatLoggerHelper(
        meta,
        `[${meta.hostname}:${meta.pid}] [${meta.requestId}] ${meta.paddingMessage}`,
      );
    },
  };

  config = _.merge(config, configDynamic);

  return config;
};
