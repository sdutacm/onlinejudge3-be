import { EggAppInfo } from 'midway';
import { formatLoggerHelper } from './config.default';
import { IAppConfig } from './config.interface';
// @ts-ignore
import configDynamic from './config.dynamic';
import _ from 'lodash';

export default (appInfo: EggAppInfo) => {
  let config = {} as IAppConfig;

  config.proxy = true;
  config.maxIpsCount = 1;

  config.logger = {
    // @ts-ignore
    formatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}]`);
    },
    contextFormatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}] ${meta.paddingMessage}`);
    },
  };

  config = _.merge(config, configDynamic);

  return config;
};
