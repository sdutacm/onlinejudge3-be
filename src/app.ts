import DB from '@/lib/models/db';
import { Application, IBoot } from 'midway';
import fs from 'fs-extra';
import Pulsar from 'pulsar-client';
import { Judger } from '@/lib/services/judger';

class AppBootHook implements IBoot {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async willReady() {
    // @ts-ignore
    const launchMsg = `App start... (NODE_ENV: ${process.env.NODE_ENV}, EGG_SERVER_ENV: ${process.env.EGG_SERVER_ENV}, node: ${process.versions.node}, alinode: ${process.versions.alinode})`;
    this.logInfo(launchMsg);

    const staticPath = this.app.getConfig('staticPath');
    Object.keys(staticPath).forEach((key) => {
      fs.ensureDirSync(staticPath[key]);
    });
    await DB.initDB(this.app.config.sequelize);

    this.app.judger = new Judger({
      address: this.app.config.judger.address,
    });

    if (this.app.config.pulsar.enable) {
      this.app.pulsarClient = new Pulsar.Client({
        serviceUrl: this.app.config.pulsar.serviceUrl,
      });
      this.app.judgerMqProducer = await this.app.pulsarClient.createProducer({
        topic: `persistent://${this.app.config.pulsar.tenant}/${this.app.config.pulsar.namespace}/${this.app.config.judger.mqJudgeQueueTopic}`,
      });
    }

    this.logInfo('✅ App launched');
  }

  async beforeClose() {
    this.logInfo('App before close...');

    await DB.closeDB();

    if (this.app.config.pulsar.enable) {
      await this.app.judgerMqProducer.flush();
      await this.app.judgerMqProducer.close();
      await this.app.pulsarClient.close();
    }

    this.logInfo('App closed');
  }

  private logInfo(...msgs: string[]) {
    if (this.app.logger?.info) {
      this.app.logger.info(...msgs);
    } else {
      console.info(...msgs);
    }
  }
}

module.exports = AppBootHook;
