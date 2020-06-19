import { config, provide } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class ContestMeta implements defMeta.BaseMeta {
  module = 'contest';
  pk = 'contestId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.contestDetail;
  }
}

export type CContestMeta = ContestMeta;
