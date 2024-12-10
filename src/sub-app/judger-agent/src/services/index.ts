import http from 'http';
import https from 'https';
import EventEmitter from 'events';
import Axios from 'axios';
import type { AxiosInstance } from 'axios';
import config from '../config';
import { Judger } from './judger';
import { JudgeTask, IJudgeOptions } from './task';

export class JudgerService extends EventEmitter {
  private readonly judger = new Judger({
    address: config.judgerGrpc.address,
  });
  private readonly ojApiInstance: AxiosInstance;

  constructor(public readonly judgerId: string) {
    super();
    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true });
    this.ojApiInstance = Axios.create({
      baseURL: config.oj.apiBaseUrl,
      httpAgent,
      httpsAgent,
      timeout: 30 * 1000,
      headers: {
        'x-system-request-auth': config.oj.apiSystemAuthKey,
      },
    });
  }

  public judge(options: IJudgeOptions) {
    const task = new JudgeTask(options, this.judgerId, this.judger, this.ojApiInstance);
    task.on('active', () => {
      this.emit('active');
    });
    return task.run();
  }
}
