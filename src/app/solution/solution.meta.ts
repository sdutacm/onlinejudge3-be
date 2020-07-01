import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class SolutionMeta implements defMeta.BaseMeta {
  module = 'solution';
  pk = 'solutionId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.solutionDetail;
  }
}

export type CSolutionMeta = SolutionMeta;
