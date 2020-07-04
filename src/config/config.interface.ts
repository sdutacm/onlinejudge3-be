import { EggAppConfig, PowerPartial } from 'midway';
import 'egg-sequelize/index';
import 'egg-redis/index';
import { IRedisKeyConfig } from './redisKey.config';
import { IDurationsConfig } from './durations.config';
import { IJudgerConfig } from './judger.config';

export interface IAppConfig extends PowerPartial<EggAppConfig> {
  welcomeMsg: string;
  siteName: string;
  siteTeam: string;
  redisKey: IRedisKeyConfig;
  durations: IDurationsConfig;
  judger: IJudgerConfig;
  staticPath: {
    avatar: string;
    bannerImage: string;
    media: string;
  };
  uploadLimit: {
    avatar: number; // B
    bannerImage: number; // B
    media: number; // B
  };
  mail: {
    accessKeyId: string;
    accessSecret: string;
    accountName: string;
    fromAlias: string;
    tagName: string;
    regionId: 'cn-hangzhou';
  };
}
