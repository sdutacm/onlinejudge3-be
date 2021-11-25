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
  // oj3-test
  // config.alinode = {
  //   server: 'wss://agentserver.node.aliyun.com:8080',
  //   appid: '86070',
  //   secret: '2cc82865fed4dfed2d45145ed723119d324f44fb',
  // };
  // oj3;
  // config.alinode = {
  //   server: 'wss://agentserver.node.aliyun.com:8080',
  //   appid: '86073',
  //   secret: '88591eee081839bd190a66b0a7bad5b3ab663205',
  // };
  //#endregion

  return config;
};
