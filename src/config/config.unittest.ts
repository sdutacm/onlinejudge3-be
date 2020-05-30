import { EggAppInfo } from 'midway';
import { DefaultConfig } from './config.interface';

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  config.sequelize = {
    host: '127.0.0.1',
    port: 3306,
    username: 'blue',
    password: 'test',
    database: 'oj_test',
    dialect: 'mysql',
    pool: {
      max: 2,
    },
    logging: false,
  };

  config.redis = {
    client: {
      host: '127.0.0.1',
      port: 6379,
      // @ts-ignore
      password: null,
      db: 1,
    },
  };

  return config;
};
