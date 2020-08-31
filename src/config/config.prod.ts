import { EggAppInfo } from 'midway';
import { IAppConfig } from './config.interface';
import { formatLoggerHelper } from '@/utils/format';
import judgerConfig from './judger.config';
import path from 'path';

export default (appInfo: EggAppInfo) => {
  const config = {} as IAppConfig;

  config.proxy = true;
  config.maxIpsCount = 1;

  config.security = {
    csrf: {
      enable: true,
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

  //#region custom config

  //#endregion

  //#region sequelize

  //#endregion

  //#region redis

  //#endregion

  //#region staticPath

  //#endregion

  //#region mail

  //#endregion

  //#region scripts

  //#endregion

  //#region alinode

  //#endregion

  return config;
};
