import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class GroupMeta implements defMeta.BaseMeta {
  module = 'group';
  pk = 'groupId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.groupDetail;
  }
}

export type CGroupMeta = GroupMeta;
