import 'egg';
import ExtendIApplication from '@/app/extend/application';
import { RedisClient } from 'redis';
import Pulsar from 'pulsar-client';
import { Judger } from '@/lib/services/judger';

declare module 'egg' {
  type ExtendIApplicationType = typeof ExtendIApplication;
  interface Application extends ExtendIApplicationType {
    redis: RedisClient;
    judger: Judger;
    pulsarClient?: Pulsar.Client;
    judgerMqProducer?: Pulsar.Producer;
  }
}
