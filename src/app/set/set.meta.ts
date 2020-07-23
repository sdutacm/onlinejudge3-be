import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class SetMeta implements defMeta.BaseMeta {
  module = 'set';
  pk = 'setId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.setDetail;
  }
}

export type CSetMeta = SetMeta;
