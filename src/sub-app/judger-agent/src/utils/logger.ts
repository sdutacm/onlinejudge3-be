import os from 'os';
import { padEnd } from 'lodash';
import dayjs from 'dayjs';

export class JudgerAgentLogger {
  public constructor(private readonly id: string) {}

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
    )} [JudgerAgent:${os.hostname()}:${this.id}]`;
  }
}

export const judgerAgentLogger = new JudgerAgentLogger(`${process.pid}`);
