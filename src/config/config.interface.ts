import { EggAppConfig, PowerPartial } from 'midway';
import { IRedisKeyConfig } from './redisKey.config';
import { IDurationsConfig } from './durations.config';
import { IJudgerConfig } from './judger.config';

export interface IPulsarConfig {
  enable: boolean;
  serviceUrl: string;
  tenant: string;
  namespace: string;
  authenticationToken?: string;
  apiBase: string;
}

export interface IAppConfig extends PowerPartial<EggAppConfig> {
  siteName: string;
  siteTeam: string;
  systemAuthKey?: string;
  redisKey: IRedisKeyConfig;
  durations: IDurationsConfig;
  pulsar: IPulsarConfig;
  socketBridge: {
    baseUrl: string;
    emitAuthKey: string;
  };
  judger: IJudgerConfig;
  staticPath: {
    useCloud?: 'cos';
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
    urlBase?: string;
  };
  scripts: {
    dirPath: string;
    logPath: string;
  };
  tencentCloud: {
    secretId: string;
    secretKey: string;
    cos?: {
      secretId: string;
      secretKey: string;
      bucket: string;
      region: string;
    };
  };
}
