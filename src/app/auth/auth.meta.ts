import { config, provide } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

@provide()
export default class AuthMeta implements defMeta.BaseMeta {
  module = 'auth';
  permissionsCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.permissionsCacheKey = redisKey.userPermissions;
  }
}

export type CAuthMeta = AuthMeta;
