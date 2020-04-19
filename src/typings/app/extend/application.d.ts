import 'egg';
import ExtendIApplication from '@/app/extend/application';
import { RedisClient } from 'redis';

declare module 'egg' {
  type ExtendIApplicationType = typeof ExtendIApplication;
  interface Application extends ExtendIApplicationType {
    redis: RedisClient;
  }
}
