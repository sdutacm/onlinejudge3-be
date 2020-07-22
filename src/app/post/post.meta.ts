import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class PostMeta implements defMeta.BaseMeta {
  module = 'post';
  pk = 'postId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.postDetail;
  }
}

export type CPostMeta = PostMeta;
