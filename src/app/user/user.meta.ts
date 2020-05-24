import { config, provide } from 'midway';
import { IRedisKeyConfig } from '@/config/redisKey.config';

// export const factory = () => userMeta;
// providerWrapper([
//   {
//     id: 'userMeta',
//     provider: factory,
//   },
// ]);

// const userMeta: defMeta.BaseMeta = {
//   module: 'user',
//   pk: 'userId',
//   detailCacheKey: '',
// };

@provide()
export default class UserMeta implements defMeta.BaseMeta {
  module = 'user';
  pk = 'userId';
  detailCacheKey: string;

  constructor(@config('redisKey') redisKey: IRedisKeyConfig) {
    this.detailCacheKey = redisKey.userDetail;
  }
}

export type CUserMeta = UserMeta;
