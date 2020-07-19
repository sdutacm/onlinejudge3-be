import { provide, config } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class TopicMeta implements defMeta.BaseMeta {
  module = 'topic';
  pk = 'topicId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.topicDetail;
  }
}

export type CTopicMeta = TopicMeta;
