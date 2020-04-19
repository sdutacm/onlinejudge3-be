import { EggAppInfo, Context } from 'midway';
import { DefaultConfig } from './config.interface';
import { Codes } from '@/common/codes';
import { formatLoggerHelper } from '@/utils/misc';

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_onlinejudge3_n20)pc9vq&z8s';

  // add your config here
  config.middleware = [];

  config.welcomeMsg = 'Hello midwayjs!';

  config.security = {
    csrf: false,
  };

  config.sequelize = {
    host: '127.0.0.1',
    port: 3306,
    username: 'blue',
    password: '>_<.test',
    database: 'oj',
    dialect: 'mysql',
    pool: {
      max: 2,
    },
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
      ctx.body = ctx.helper.rFail(Codes.GENERAL_INTERNAL_SERVER_ERROR);
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
  };

  config.logger = {
    // @ts-ignore
    formatter(meta: any) {
      return formatLoggerHelper(meta);
    },
    contextFormatter(meta: any) {
      return formatLoggerHelper(meta, `${meta.paddingMessage}`);
    },
    consoleLevel: 'DEBUG',
  };

  return config;
};
