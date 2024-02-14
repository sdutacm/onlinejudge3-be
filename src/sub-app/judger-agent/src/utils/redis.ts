import Redis from 'ioredis';
import config from '../config';

export type IRedisClient = Redis.Redis;

export function getRedisClient() {
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  });
  return redis;
}
