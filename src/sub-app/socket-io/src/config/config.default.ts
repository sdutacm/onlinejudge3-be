import { EggAppInfo, Context } from 'midway';
import path from 'path';
import chalk from 'chalk';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { IAppConfig } from './config.interface';

type TLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const consoleColors: Record<TLogLevel, chalk.Chalk> = {
  DEBUG: chalk.blue,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

/**
 * 格式化 Logger。
 * @param meta formatLogger meta
 * @param customContent 自定义 message 前的额外的输出信息（如 `${meta.hostname}`）
 */
export function formatLoggerHelper(meta: any, customContent = '') {
  const level = meta.level as TLogLevel;
  const color: chalk.Chalk = consoleColors[level];
  let formattedLevel = `[${level}]`;
  if (formattedLevel.length < 7) {
    formattedLevel += ' ';
  }
  if (customContent && !customContent.endsWith('\n') && !customContent.endsWith(' ')) {
    customContent += ' ';
  }
  return (
    color(`[${meta.date.replace(',', '.')}] ${formattedLevel} ${customContent}`) + `${meta.message}`
  );
}

export default (appInfo: EggAppInfo) => {
  const config = {} as IAppConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_onlinejudge3_n20)pc9vq&z8s';

  // add your config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.emitAuthKey = '';

  config.session = {
    renew: true,
    genid: (ctx: Context) => {
      return `session:${ctx.userId || 0}:${uuidv4()}`;
    },
  };

  config.io = {
    init: {},
    namespace: {
      '/': {
        connectionMiddleware: ['auth'],
        packetMiddleware: ['filter'],
      },
      '/judger': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
      auth_pass: null,
      db: 0,
    },
  };

  config.onerror = {
    html(err: Error, ctx: Context) {
      ctx.body = 'Internal Server Error';
      ctx.status = 500;
      // ctx.helper.report(ctx, 'error', 1);
    },
    json(err: Error, ctx: Context) {
      ctx.body = ctx.helper.rFail(-1);
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

  config.customLogger = {
    reqLogger: {
      file: path.join(appInfo.root, 'logs', appInfo.name, 'req.log'),
    },
    scheduleLogger: {
      file: path.join(appInfo.root, 'logs', appInfo.name, 'schedule.log'),
    },
  };

  config.alinode = {
    appid: '',
    secret: '',
  };

  return config;
};
