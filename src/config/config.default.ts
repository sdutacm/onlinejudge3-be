import { EggAppInfo, Context } from 'midway';

import { DefaultConfig } from './config.interface';

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_onlinejudge3_n20)pc9vq&z8s';

  // add your config here
  config.middleware = [];

  config.welcomeMsg = 'Hello midwayjs!';

  config.sequelize = {
    host: '127.0.0.1',
    port: 3306,
    username: 'blue',
    password: 'test',
    database: 'oj',
    dialect: 'mysql',
  };

  config.redis = {
    client: {
      host: '127.0.0.1',
      port: 6379,
      // @ts-ignore
      password: null,
      db: 0,
    },
  };

  config.onerror = {
    html(_err: Error, ctx: Context) {
      ctx.body = 'Internal Server Error';
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
    json(_err: Error, ctx: Context) {
      ctx.body = { success: false, msg: 'Internal Server Error' };
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
  };

  return config;
};
