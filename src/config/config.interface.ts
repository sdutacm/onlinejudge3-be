import { EggAppConfig, PowerPartial } from 'midway';
import 'egg-sequelize/index';
import 'egg-redis/index';
import { IRedisKeyConfig } from './redisKey.config';
import { IDurationsConfig } from './durations.config';
import { IJudgerConfig } from './judger.config';

export interface IAppConfig extends PowerPartial<EggAppConfig> {
  siteName: string;
  siteTeam: string;
  redisKey: IRedisKeyConfig;
  durations: IDurationsConfig;
  judger: IJudgerConfig;
  staticPath: {
    base: string;
    avatar: string; // 必须在 base 下
    bannerImage: string; // 必须在 base 下
    media: string; // 必须在 base 下
    asset: string; // 必须在 base 下
  };
  uploadLimit: {
    avatar: number; // B
    bannerImage: number; // B
    media: number; // B
    asset: number; // B
  };
  mail: {
    accessKeyId: string;
    accessSecret: string;
    accountName: string;
    fromAlias: string;
    tagName: string;
    regionId: 'cn-hangzhou';
  };
  scripts: {
    dirPath: string;
    logPath: string;
  };
  tencentCloud: {
    secretId: string;
    secretKey: string;
  };
}
