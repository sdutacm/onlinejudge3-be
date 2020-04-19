import { EggAppInfo } from 'midway';
import { DefaultConfig } from './config.interface';
import { formatLoggerHelper } from '@/utils/misc';

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // config.sequelize = {
  //   host: '127.0.0.1',
  //   port: 3306,
  //   username: 'blue',
  //   password: 'test',
  //   database: 'oj',
  //   dialect: 'mysql',
  //   pool: {
  //     max: 2,
  //   },
  // };

  // config.redis = {
  //   client: {
  //     host: '127.0.0.1',
  //     port: 6379,
  //     // @ts-ignore
  //     password: null,
  //     db: 0,
  //   },
  // };

  config.logger = {
    // @ts-ignore
    formatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}]`);
    },
    contextFormatter(meta: any) {
      return formatLoggerHelper(meta, `[${meta.hostname}:${meta.pid}] ${meta.paddingMessage}`);
    },
  };

  return config;
};
