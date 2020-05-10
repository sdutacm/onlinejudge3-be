import { EggAppConfig, PowerPartial } from 'midway';
import 'egg-sequelize/index';
import 'egg-redis/index';
import { IRedisKeyConfig } from './redisKey.config';
import { IDurationsConfig } from './durations.config';

export interface DefaultConfig extends PowerPartial<EggAppConfig> {
  welcomeMsg: string;
  redisKey: IRedisKeyConfig;
  durations: IDurationsConfig;
}
