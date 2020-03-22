import { EggAppConfig, PowerPartial } from 'midway';
import 'egg-sequelize/index';
import 'egg-redis/index';

export interface DefaultConfig extends PowerPartial<EggAppConfig> {
  welcomeMsg: string;
}
