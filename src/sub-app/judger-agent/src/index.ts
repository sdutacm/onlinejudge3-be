import os from 'os';
import config from './config';
import { judgerAgentLogger as logger } from './utils/logger';
import { decodeJudgeQueueMessage } from './utils';
import { IRedisClient, getRedisClient } from './utils/redis';
import { IDbPool, getPool } from './utils/mysql';
import { IPulsarClient, getPulsarClient, IPulsarConsumer } from './utils/pulsar';
import { JudgerService } from './services';

const EXIT_TIMEOUT = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class JudgerAgent {
  private dbPool: IDbPool;
  private redis: IRedisClient;
  private pulsarClient: IPulsarClient;
  private consumer: IPulsarConsumer;
  private closing = false;

  public async beforeReady() {
    this.dbPool = getPool();
    this.redis = getRedisClient();
    this.pulsarClient = getPulsarClient();
    this.consumer = await this.pulsarClient.subscribe({
      topic: `persistent://${config.pulsar.tenant}/${config.pulsar.namespace}/${config.pulsar.judgeQueueTopic}`,
      consumerName: `judger-agent-${os.hostname()}-${process.pid}`,
      subscription: config.pulsar.judgeSubscription,
      subscriptionType: 'Shared',
      receiverQueueSize: 0,
      nAckRedeliverTimeoutMs: 30 * 1000,
      deadLetterPolicy: {
        maxRedeliverCount: 2,
        deadLetterTopic: `persistent://${config.pulsar.tenant}/${config.pulsar.namespace}/${config.pulsar.judgeDeadTopic}`,
      },
    });
    process.on('SIGINT', this.handleExit.bind(this));
    process.on('SIGTERM', this.handleExit.bind(this));
  }

  public async beforeClose() {
    await this.dbPool.end?.().catch((e) => logger.warn('Ignored error while closing mysql:', e));
    await this.redis.quit().catch((e) => logger.warn('Ignored error while closing redis:', e));
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

    while (true) {
      let msg = null;
      const start = Date.now();
      try {
        msg = await this.consumer.receive();

        // logic
        try {
          const options = decodeJudgeQueueMessage(msg.getData());
          logger.info(`Received:`, msg.getMessageId().toString(), options);

          const judgerService = new JudgerService(this.dbPool, this.redis);
          await judgerService.judge({
            judgeInfoId: options.judgeInfoId,
            solutionId: options.solutionId,
            problemId: options.problemId,
            language: options.language,
            userId: options.userId,
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
