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
  //   logging: false,
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

  // const basePath = path.join(__dirname, '../app/public/sf/');
  // config.staticPath = {
  //   avatar: path.join(basePath, 'avatars/'),
  //   bannerImage: path.join(basePath, 'banner_images/'),
  //   media: path.join(basePath, 'media/'),
  // };

  // config.mail = {
  //   accessKeyId: '',
  //   accessSecret: '',
  //   accountName: 'no-reply@notice.sdutacm.cn',
  //   fromAlias: 'SDUTACM',
  //   tagName: 'SDUTACM',
  //   regionId: 'cn-hangzhou',
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
