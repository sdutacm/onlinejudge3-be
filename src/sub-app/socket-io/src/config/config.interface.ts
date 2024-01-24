import { EggAppConfig, PowerPartial } from 'midway';

export interface IAppConfig extends PowerPartial<EggAppConfig> {
  emitAuthKey?: string;
}
