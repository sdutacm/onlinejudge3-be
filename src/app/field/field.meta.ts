import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class FieldMeta implements defMeta.BaseMeta {
  module = 'field';
  pk = 'fieldId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.fieldDetail;
  }
}

export type CFieldMeta = FieldMeta;
