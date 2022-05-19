import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class BalloonMeta implements defMeta.BaseMeta {
  module = 'balloon';
  pk = 'balloonId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.balloonDetail;
  }
}

export type CBalloonMeta = BalloonMeta;
