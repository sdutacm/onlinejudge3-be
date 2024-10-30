import { EggAppInfo, Context } from 'midway';
import { IAppConfig } from './config.interface';
import path from 'path';
import { Codes, codeMsgs } from '@/common/codes';
import { formatLoggerHelper } from '@/utils/format';
import redisKey from './redisKey.config';
import durations from './durations.config';
import judgerConfig from './judger.config';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export default (appInfo: EggAppInfo) => {
  const config = {} as IAppConfig;

  config.container = {
    ignore: 'sub-app/**', // ignore path in midway auto scan
  };

  config.keys = appInfo.name;

  // add your config here
  config.middleware = ['competitionSideSwitchMid', 'reqMid'];

  config.siteName = 'SDUT OJ';
  config.siteTeam = 'SDUTACM Team';

  config.security = {
    csrf: {
      enable: false,
      cookieOptions: {
        path: '/onlinejudge3/',
      },
    },
  };

  config.session = {
    key: 'OJ3_SESS',
    path: '/onlinejudge3/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    renew: true,
    genid: (ctx: Context) => {
      return `session:${ctx.userId || 0}:${uuidv4()}`;
    },
  };

  config.bodyParser = {
    formLimit: '4mb',
    jsonLimit: '4mb',
  };

  config.multipart = {
    mode: 'file',
    fileSize: '64mb',
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

  config.pulsar = {
    enable: false,
    serviceUrl: 'pulsar://127.0.0.1:6650',
    tenant: 'public',
    namespace: 'oj',
    apiBase: 'http://127.0.0.1:8080',
  };

  // config.io = {
  //   init: {},
  //   namespace: {
  //     '/': {
  //       connectionMiddleware: ['auth'],
  //       packetMiddleware: ['filter'],
  //     },
  //     '/judger': {
  //       connectionMiddleware: [],
  //       packetMiddleware: [],
  //     },
  //   },
  //   redis: {
  //     host: '127.0.0.1',
  //     port: 6379,
  //     auth_pass: null,
  //     db: 0,
  //   },
  // };

  config.onerror = {
    html(err: Error, ctx: Context) {
      switch (err.message) {
        case 'missing csrf token':
        case 'invalid csrf token':
          ctx.body = codeMsgs[Codes.GENERAL_ILLEGAL_REQUEST];
          ctx.status = 403;
          return;
        case 'Reach fileSize limit':
          ctx.body = codeMsgs[Codes.GENERAL_INVALID_MEDIA_SIZE];
          return;
      }
      ctx.body = 'Internal Server Error';
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
    json(err: Error, ctx: Context) {
      const logger = ctx.getLogger('reqLogger');
      switch (err.message) {
        case 'missing csrf token':
        case 'invalid csrf token':
          ctx.body = ctx.helper.rFail(Codes.GENERAL_ILLEGAL_REQUEST, { reason: err.message });
          ctx.status = 403;
          logger.warn('Missing/Invalid csrf token');
          return;
        case 'Reach fileSize limit':
          ctx.body = ctx.helper.rFail(Codes.GENERAL_INVALID_MEDIA_SIZE);
          logger.warn('Reach file size limit');
          return;
      }
      ctx.body = ctx.helper.rFail(Codes.GENERAL_INTERNAL_SERVER_ERROR);
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
  };

  const logDir = path.join(appInfo.root, 'logs', process.env.APP_NAME || appInfo.name);

  config.logger = {
    dir: logDir,
    // @ts-ignore
    formatter(meta: any) {
      return formatLoggerHelper(meta);
    },
    contextFormatter(meta: any) {
      if (meta.ctx?.requestId) {
        meta.requestId = meta.ctx.requestId;
      }
      return formatLoggerHelper(meta, `[${meta.requestId}] ${meta.paddingMessage}`);
    },
    consoleLevel: 'DEBUG',
  };

  config.customLogger = {
    reqLogger: {
      file: path.join(logDir, 'req.log'),
    },
    redisLogger: {
      file: path.join(logDir, 'redis.log'),
    },
    scheduleLogger: {
      file: path.join(logDir, 'schedule.log'),
    },
    judgerLogger: {
      file: path.join(logDir, 'judger.log'),
    },
    contentCheckLogger: {
      file: path.join(logDir, 'content-check.log'),
    },
  };

  const staticBasePath = path.join(__dirname, '../app/public/sf/');
  config.staticPath = {
    base: staticBasePath,
    avatar: path.join(staticBasePath, 'avatars/'),
    bannerImage: path.join(staticBasePath, 'banner_images/'),
    media: path.join(staticBasePath, 'media/'),
    asset: path.join(staticBasePath, 'assets/'),
  };

  config.uploadLimit = {
    avatar: 4 * 1024 * 1024,
    bannerImage: 12 * 1024 * 1024,
    media: 8 * 1024 * 1024,
    asset: 32 * 1024 * 1024,
  };

  // #region custom config
  config.redisKey = redisKey;

  config.durations = durations;

  config.socketBridge = {
    baseUrl: 'http://127.0.0.1:7002/socketBridge/emit',
    emitAuthKey: '',
  };

  config.judger = judgerConfig;
  // #endregion

  config.mail = {
    accessKeyId: '',
    accessSecret: '',
    accountName: 'no-reply@notice.sdutacm.cn',
    fromAlias: 'SDUTACM',
    tagName: 'SDUTACM',
    regionId: 'cn-hangzhou',
  };

  // 外部 JS 脚本，可以 clone oj3-scripts 项目部署，并在此指定其路径
  // @see https://github.com/sdutacm/onlinejudge3-scripts
  // config.scripts = {
  //   dirPath: path.join(__dirname, '../../dev-scripts'),
  //   logPath: path.join(__dirname, '../../dev-scripts/logs'),
  // };

  config.alinode = {
    appid: '',
    secret: '',
  };

  // #region cloud
  config.tencentCloud = {
    secretId: '',
    secretKey: '',
  };
  // #endregion

  return config;
};
