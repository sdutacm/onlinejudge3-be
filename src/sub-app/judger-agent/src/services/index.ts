import http from 'http';
import https from 'https';
import EventEmitter from 'events';
import Axios from 'axios';
import type { AxiosInstance } from 'axios';
import PCancelable from 'p-cancelable';
import microtime from 'microtime';
import config from '../config';
import { judgerAgentLogger } from '../utils/logger';
import { river } from '../proto/river';
import { Judger } from './judger';
import { ESolutionResult } from '../enums';
import { convertRiverResultToOJ } from '../utils';

const logger = judgerAgentLogger;

export interface IJudgeOptions {
  judgeInfoId: number;
  solutionId: number;
  problem: {
    problemId: number;
    revision: number;
    timeLimit: number;
    memoryLimit: number;
    spj: boolean;
  };
  user: {
    userId: number;
  };
  language: string;
  code: string;
}

class InvalidSolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSolutionError';
    Error.captureStackTrace(this, this.constructor);
  }
}

class JudgerSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JudgerSystemError';
    Error.captureStackTrace(this, this.constructor);
  }
}

class AbortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AbortError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class JudgerService extends EventEmitter {
  private readonly judger = new Judger({
    address: config.judgerGrpc.address,
  });
  private readonly ojApiInstance: AxiosInstance;
  private aborted = false;

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

  onAbortPoint() {
    if (this.aborted) {
      throw new AbortError('Aborted');
    }
  }

  private async callbackJudge(judgeInfoId: number, solutionId: number, data: any) {
    try {
      const res = await this.ojApiInstance.post('/callbackJudge', {
        judgeInfoId,
        solutionId,
        judgerId: this.judgerId,
        eventTimestampUs: microtime.now(),
        data,
      });
      return !!res.data.success;
    } catch (e) {
      logger.warn('callback judge error:', judgeInfoId, JSON.stringify(data), e.message);
      return false;
    }
  }

  public judge(options: IJudgeOptions) {
    return new PCancelable<void>((resolve, reject, onCancel) => {
      onCancel(() => {
        this.aborted = true;
      });

      const logic = async () => {
        this.onAbortPoint();
        const { judgeInfoId, solutionId, problem, user, language, code } = options;
        const { revision, problemId, timeLimit, memoryLimit, spj = false } = problem;
        const { userId } = user;
        const judgeType = spj ? river.JudgeType.Special : river.JudgeType.Standard;
        const loggerPrefix = `[${judgeInfoId}/${solutionId}/${problemId}/${revision}]`;

        try {
          logger.info(`${loggerPrefix} start`);

          if (!language) {
            throw new InvalidSolutionError(`Invalid language "${options.language}"`);
          }
          if (!problemId || !timeLimit || !memoryLimit) {
            throw new InvalidSolutionError(`No problem specified`);
          }
          if (!code) {
            throw new InvalidSolutionError(`No code`);
          }
          this.onAbortPoint();

          await this.callbackJudge(judgeInfoId, solutionId, {
            type: 'start',
          });
          this.onAbortPoint();
          this.emit('active');

          const spjFile = spj ? 'spj' : undefined;
          logger.info(
            `${loggerPrefix} getJudgeCall`,
            JSON.stringify({
              problemId,
              language,
              code: `string(${code.length})`,
              timeLimit: timeLimit,
              memoryLimit: memoryLimit,
              judgeType,
              spjFile,
            }),
          );

          const call = this.judger.getJudgeCall({
            problemId,
            language,
            code,
            timeLimit: timeLimit,
            memoryLimit: memoryLimit,
            judgeType,
            spjFile,
            onStart: () => {
              this.onAbortPoint();
              logger.info(`${loggerPrefix} onStart`);
              this.emit('active');
            },
            onJudgeCaseStart: (current, total) => {
              this.onAbortPoint();
              logger.info(`${loggerPrefix} onJudgeCaseStart ${current}/${total}`);
              this.callbackJudge(judgeInfoId, solutionId, {
                type: 'progress',
                current,
                total,
              });
              this.emit('active');
            },
            onJudgeCaseDone: (current, total, res) => {
              this.onAbortPoint();
              logger.info(`${loggerPrefix} onJudgeCaseDone ${current}/${total}`);
              this.emit('active');
              return res.result === river.JudgeResultEnum.Accepted;
            },
          });

          const jResult = await call.run();
          this.onAbortPoint();
          logger.info(`${loggerPrefix} done`, JSON.stringify(jResult));
          this.emit('active');

          switch (jResult.type) {
            case 'CompileError': {
              await this.callbackJudge(judgeInfoId, solutionId, {
                type: 'finish',
                resultType: 'CompileError',
                detail: {
                  compileInfo: jResult.res,
                },
              });
              break;
            }
            case 'SystemError': {
              throw new JudgerSystemError(jResult.res);
            }
            case 'Done': {
              const result: ESolutionResult = convertRiverResultToOJ(
                jResult.res[jResult.res.length - 1].result!,
              );
              let maxTimeUsed = 0;
              let maxMemoryUsed = 0;
              jResult.res.forEach((r) => {
                // @ts-ignore
                maxTimeUsed = Math.max(maxTimeUsed, r.timeUsed);
                // @ts-ignore
                maxMemoryUsed = Math.max(maxMemoryUsed, r.memoryUsed);
              });
              const lastCaseNumber = jResult.last;
              const totalCaseNumber = jResult.total;
              const cases = jResult.res.map((r) => ({
                result: convertRiverResultToOJ(r.result!),
                time: r.timeUsed,
                memory: r.memoryUsed,
                errMsg: r.errmsg || undefined,
                outMsg: r.outmsg || undefined,
              }));
              await this.callbackJudge(judgeInfoId, solutionId, {
                type: 'finish',
                resultType: 'Done',
                detail: {
                  result,
                  maxTimeUsed,
                  maxMemoryUsed,
                  lastCaseNumber,
                  totalCaseNumber,
                  cases,
                },
              });
              logger.info(`${loggerPrefix} Judge all ok`);
            }
          }
        } catch (e) {
          await this.callbackJudge(judgeInfoId, solutionId, {
            type: 'finish',
            resultType: 'SystemError',
            detail: {},
          });
          if (e instanceof InvalidSolutionError) {
            logger.warn(loggerPrefix, e);
          } else if (e instanceof JudgerSystemError) {
            logger.error(loggerPrefix, e);
            throw e;
          } else if (e instanceof AbortError) {
            logger.error(loggerPrefix, e);
            throw e;
          } else {
            logger.error(`${loggerPrefix} Caught error:`, e);
            throw e;
          }
        }
      };

      logic().then(resolve).catch(reject);
    });
  }
}
