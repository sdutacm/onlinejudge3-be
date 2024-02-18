import Pulsar from 'pulsar-client';
import config from '../config';

export type IPulsarClient = Pulsar.Client;
export type IPulsarConsumer = Pulsar.Consumer;

export function getPulsarClient() {
  const pulsarOptions: Pulsar.ClientConfig = {
    serviceUrl: config.pulsar.serviceUrl,
  };
  if (config.pulsar.authenticationToken) {
    pulsarOptions.authentication = new Pulsar.AuthenticationToken({
      token: config.pulsar.authenticationToken,
    });
  }
  return new Pulsar.Client(pulsarOptions);
}
