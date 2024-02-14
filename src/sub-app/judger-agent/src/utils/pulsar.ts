import Pulsar from 'pulsar-client';
import config from '../config';

export type IPulsarClient = Pulsar.Client;
export type IPulsarConsumer = Pulsar.Consumer;

export function getPulsarClient() {
  return new Pulsar.Client({
    serviceUrl: config.pulsar.serviceUrl,
  });
}
