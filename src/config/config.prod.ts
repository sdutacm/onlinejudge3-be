import { EggAppInfo } from 'midway';
import { IAppConfig } from './config.interface';
import { formatLoggerHelper } from '@/utils/format';
import path from 'path';

export default (appInfo: EggAppInfo) => {
  const config = {} as IAppConfig;

  config.security = {
    csrf: {
      headerName: 'x-csrf-token',
    },
  };

  config.logger = {
    // @ts-ignore
    formatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}]`);
    },
    contextFormatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}] ${meta.paddingMessage}`);
    },
  };

  //#region custom prod config

  //#endregion

  return config;
};
