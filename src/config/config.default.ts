import { EggAppInfo, Context } from 'midway';
import { DefaultConfig } from './config.interface';
import { Codes, codeMsgs } from '@/common/codes';
import { formatLoggerHelper } from '@/utils/misc';
import redisKey from './redisKey.config';
import durations from './durations.config';

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
    password: 'test',
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
    html(err: Error, ctx: Context) {
      switch (err.message) {
        case 'invalid csrf token':
          ctx.body = codeMsgs[Codes.GENERAL_ILLEGAL_REQUEST];
          ctx.status = 403;
          return;
      }
      ctx.body = 'Internal Server Error';
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
    json(err: Error, ctx: Context) {
      switch (err.message) {
        case 'invalid csrf token':
          ctx.body = ctx.helper.rFail(Codes.GENERAL_ILLEGAL_REQUEST, { reason: err.message });
          ctx.status = 403;
          return;
      }
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

  // #region custom config
  config.redisKey = redisKey;

  config.durations = durations;
  // #endregion

  return config;
};
