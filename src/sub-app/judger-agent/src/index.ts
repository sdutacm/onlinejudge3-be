import { omit, cloneDeep } from 'lodash';
import config from './config';
import { judgerAgentLogger as logger } from './utils/logger';
import { decodeJudgeQueueMessage, getSystemInfo } from './utils';
import { IPulsarClient, getPulsarClient, IPulsarConsumer } from './utils/pulsar';
import { JudgerService } from './services';

const EXIT_TIMEOUT = 5000;
const MAX_ACTIVE_TIMEOUT = 300 * 1000;
const MAX_TIMEOUT_COUNT = 5;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class JudgerAgent {
  public id: string;
  private pulsarClient: IPulsarClient;
  private consumer: IPulsarConsumer;
  private closing = false;
  private sysInfo = getSystemInfo();

  constructor() {
    this.id =
      'JudgerAgent-' +
      [
        this.sysInfo.hostname,
        process.pid,
        this.sysInfo.platform,
        this.sysInfo.arch,
        this.sysInfo.cpuModel,
      ].join('|');
  }

  public async beforeReady() {
    this.pulsarClient = getPulsarClient();
    this.consumer = await this.pulsarClient.subscribe({
      topic: `persistent://${config.pulsar.tenant}/${config.pulsar.namespace}/${config.pulsar.judgeQueueTopic}`,
      consumerName: this.id,
      subscription: config.pulsar.judgeSubscription,
      subscriptionType: 'Shared',
      receiverQueueSize: 0,
      nAckRedeliverTimeoutMs: 30 * 1000,
      deadLetterPolicy: {
        maxRedeliverCount: 1,
        deadLetterTopic: `persistent://${config.pulsar.tenant}/${config.pulsar.namespace}/${config.pulsar.judgeDeadTopic}`,
        initialSubscriptionName: config.pulsar.judgeDeadSubscription,
      },
    });
    process.on('SIGINT', this.handleExit.bind(this));
    process.on('SIGTERM', this.handleExit.bind(this));
  }

  public async beforeClose() {
    await this.consumer
      .close()
      ?.catch((e) => logger.warn('Ignored error while closing pulsar consumer:', e));
    await this.pulsarClient
      .close()
      ?.catch((e) => logger.warn('Ignored error while closing pulsar client:', e));
    logger.info('All resources closed');
  }

  public handleExit(signal: string) {
    logger.info(`Received ${signal}. Graceful shutdown start`);

    if (this.closing) {
      return;
    }

    const timeout = setTimeout(() => {
      logger.error('Could not finish operations in time, forcefully shutting down');
      process.exit(1);
    }, EXIT_TIMEOUT);

    this.closing = true;

    this.beforeClose()
      .then(() => {
        clearTimeout(timeout);
        logger.info('All tasks finished, shutting down');
        process.exit(0);
      })
      .catch((e) => {
        clearTimeout(timeout);
        logger.error('Error occurred while closing:', e);
        process.exit(1);
      });
  }

  public async run() {
    logger.info('Ready to receive messages');

    let timeoutCount = 0;
    while (true) {
      if (timeoutCount >= MAX_TIMEOUT_COUNT) {
        logger.error('Exceeded max timeout count, exit after 36s...'); // nAckRedeliverTimeoutMs + 6s
        await sleep(36000);
        process.exit(1);
      }
      let msg = null;
      try {
        msg = await this.consumer.receive();
        const start = Date.now();

        // logic
        try {
          const options = await decodeJudgeQueueMessage(msg.getData());
          logger.info(
            `Received:`,
            msg.getMessageId().toString(),
            JSON.stringify({
              ...omit(options, 'code'),
              code: `string(${options.code.length})`,
            }),
          );

          const judgerService = new JudgerService(this.id);
          const jsPromise = judgerService.judge({
            judgeInfoId: options.judgeInfoId,
            solutionId: options.solutionId,
            problem: options.problem,
            user: options.user,
            language: options.language,
            code: options.code,
          });

          const abortReason = `Aborted: No active event within ${MAX_ACTIVE_TIMEOUT}ms`;
          let activeTimeout = setTimeout(() => {
            jsPromise.cancel(abortReason);
            timeoutCount++;
          }, MAX_ACTIVE_TIMEOUT);
          judgerService.on('active', () => {
            clearTimeout(activeTimeout);
            activeTimeout = setTimeout(() => {
              jsPromise.cancel(abortReason);
              timeoutCount++;
            }, MAX_ACTIVE_TIMEOUT);
          });

          await jsPromise.finally(() => {
            clearTimeout(activeTimeout);
          });
          await this.consumer.acknowledge(msg);
          logger.info(`Acked ${msg.getMessageId().toString()} in ${Date.now() - start}ms`);
        } catch (e) {
          logger.error(
            `Error occurred ${msg.getMessageId().toString()} in ${Date.now() - start}ms`,
            e,
          );
          this.consumer.negativeAcknowledge(msg);
        }
      } catch (e) {
        logger.error(
          'Fatal error occurred while receiving the message:',
          msg?.getMessageId()?.toString() || 'undefined',
          e,
        );
        await sleep(2000);
      }
    }
  }
}

(async () => {
  const judgerAgent = new JudgerAgent();
  await judgerAgent.beforeReady();
  await judgerAgent.run();
})();
