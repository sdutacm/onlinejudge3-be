import { config, provide } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class ProblemMeta implements defMeta.BaseMeta {
  module = 'problem';
  pk = 'problemId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.problemDetail;
  }
}

export type CProblemMeta = ProblemMeta;
