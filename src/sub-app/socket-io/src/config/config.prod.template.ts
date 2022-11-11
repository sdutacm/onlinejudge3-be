import { EggAppInfo } from 'midway';
import { formatLoggerHelper } from './config.default';

export default (appInfo: EggAppInfo) => {
  const config = {} as any;

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

  //#region socket.io

  //#endregion

  //#region alinode

  //#endregion

  return config;
};
