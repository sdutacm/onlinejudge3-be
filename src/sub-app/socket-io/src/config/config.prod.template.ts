import { EggAppInfo } from 'midway';
import { formatLoggerHelper } from './config.default';
import { IAppConfig } from './config.interface';

export default (appInfo: EggAppInfo) => {
  const config = {} as IAppConfig;

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

  //#region custom config

  //#endregion

  //#region socket.io

  //#endregion

  //#region alinode

  //#endregion

  return config;
};
