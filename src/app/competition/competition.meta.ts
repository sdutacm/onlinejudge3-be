import { config, provide } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class CompetitionMeta implements defMeta.BaseMeta {
  module = 'competition';
  pk = 'competitionId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.competitionDetail;
  }
}

export type CCompetitionMeta = CompetitionMeta;
