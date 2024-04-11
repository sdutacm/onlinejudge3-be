import Pulsar, { LogLevel } from 'pulsar-client';
import config from '../config';
import { pulsarLogger } from './logger';

export type IPulsarClient = Pulsar.Client;
export type IPulsarConsumer = Pulsar.Consumer;

export function getPulsarClient() {
  const pulsarOptions: Pulsar.ClientConfig = {
    serviceUrl: config.pulsar.serviceUrl,
    log: (level, file, line, message) => {
      let m = pulsarLogger.info;
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          m = pulsarLogger.info;
          break;
        case LogLevel.WARN:
          m = pulsarLogger.warn;
          break;
        case LogLevel.ERROR:
          m = pulsarLogger.error;
          break;
      }
      m.bind(pulsarLogger)(`${file}:${line}`, message);
    },
  };
  if (config.pulsar.authenticationToken) {
    pulsarOptions.authentication = new Pulsar.AuthenticationToken({
      token: config.pulsar.authenticationToken,
    });
  }
  return new Pulsar.Client(pulsarOptions);
}
