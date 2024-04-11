import os from 'os';
import { padEnd } from 'lodash';
import dayjs from 'dayjs';

export class Logger {
  public constructor(private readonly type: string, private readonly id: string) {}

  public info(...args: any[]) {
    console.log(this.getPrefix('info'), ...args);
  }

  public warn(...args: any[]) {
    console.warn(this.getPrefix('warn'), ...args);
  }

  public error(...args: any[]) {
    console.error(this.getPrefix('error'), ...args);
  }

  private getPrefix(level: string) {
    return `[${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}] ${padEnd(
      `[${level.toUpperCase()}]`,
      7,
    )} [${this.type}:${os.hostname()}:${this.id}]`;
  }
}

export const judgerAgentLogger = new Logger('JudgerAgent', `${process.pid}`);
export const dataManagerLogger = new Logger('DataManager', `${process.pid}`);
export const pulsarLogger = new Logger('Pulsar', `${process.pid}`);
