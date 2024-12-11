import EventEmitter from 'events';
import type { AxiosInstance } from 'axios';
import PCancelable from 'p-cancelable';
import PQueue from 'p-queue';
import microtime from 'microtime';
import debug from 'debug';
import config from '../config';
import { judgerAgentLogger } from '../utils/logger';
import { river } from '../proto/river';
import { Judger } from './judger';
import { ESolutionResult } from '../enums';
import { convertRiverResultToOJ } from '../utils';
import { getProblemDataResult } from '../utils/judger';

const logger = judgerAgentLogger;
const dbg = debug('onlinejudge3:judger-agent:JudgeTask');

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
  competition?: {
    competitionId: number;
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

export class JudgeTask extends EventEmitter {
  public options: IJudgeOptions;
  private redundant: { userId: number; problemId: number; competitionId?: number };
  private aborted = false;
  private callbackBuffer: { data: any; eventTimestampUs: number }[] = [];
  private callbackQueue = new PQueue({ concurrency: 1 });

  constructor(
    options: IJudgeOptions,
    public readonly judgerId: string,
    private readonly judger: Judger,
    private readonly ojApiInstance: AxiosInstance,
  ) {
    super();
    this.options = options;
    const { problemId } = this.options.problem;
    const { userId } = this.options.user || {};
    const { competitionId } = this.options.competition || {};
    this.redundant = { userId, problemId, competitionId };
  }

  private onAbortPoint() {
    if (this.aborted) {
      throw new AbortError('Aborted');
    }
  }

  private pushCallbackJudge(data: any) {
    this.callbackBuffer.push({
      data,
      eventTimestampUs: microtime.now(),
    });
  }

  private async flushCallbackJudgeBuffer() {
    if (this.callbackBuffer.length === 0) {
      return;
    }
    const lockedSize = this.callbackBuffer.length;
    try {
      dbg('flush callback buffer: %d, %O', lockedSize, this.callbackBuffer);
      const req = {
        judgeInfoId: this.options.judgeInfoId,
        solutionId: this.options.solutionId,
        judgerId: this.judgerId,
        userId: this.redundant.userId,
        problemId: this.redundant.problemId,
        competitionId: this.redundant.competitionId,
        batchData: this.callbackBuffer,
      };
      dbg('callback judge: %O', req);
      const res = await this.ojApiInstance.post('/callbackJudge', req);
      const success = !!res.data.success;
      if (success) {
        this.callbackBuffer.splice(0, lockedSize);
      }
      return success;
    } catch (e) {
      logger.warn(
        'callback judge error:',
        this.options.judgeInfoId,
        JSON.stringify(this.callbackBuffer),
        e.message,
      );
      return false;
    }
  }

  private async callbackJudge(data) {
    this.pushCallbackJudge(data);
    return this.callbackQueue.add(() => this.flushCallbackJudgeBuffer());
  }

  public run() {
    return new PCancelable<void>((resolve, reject, onCancel) => {
      onCancel(() => {
        this.aborted = true;
      });

      const logic = async () => {
        this.onAbortPoint();
        const { judgeInfoId, solutionId, problem, language, code } = this.options;
        const { revision, problemId, timeLimit, memoryLimit, spj = false } = problem;
        const judgeType = spj ? river.JudgeType.Special : river.JudgeType.Standard;
        const loggerPrefix = `[${judgeInfoId}/${solutionId}/${problemId}/${revision}]`;

        try {
          logger.info(`${loggerPrefix} start`);

          if (!language) {
            throw new InvalidSolutionError(`Invalid language "${this.options.language}"`);
          }
          if (!problemId || !timeLimit || !memoryLimit) {
            throw new InvalidSolutionError(`No problem specified`);
          }
          if (!code) {
            throw new InvalidSolutionError(`No code`);
          }
          this.onAbortPoint();

          await this.callbackJudge({
            type: 'start',
          });
          this.onAbortPoint();
          this.emit('active');

          let dataDir = `${problemId}`;
          let dataCases;
          if (config.judgerData.useRemoteDataRelease) {
            logger.info('Preparing remote data');
            const dataResult = await getProblemDataResult(problemId, revision);
            dataDir = `${problemId}/${dataResult.extraHash}`;
            dataCases = dataResult.cases;
          }

          // TODO compile spj
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
            dataDir,
            problemId,
            language,
            code,
            timeLimit: timeLimit,
            memoryLimit: memoryLimit,
            cases: dataCases,
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
              this.callbackJudge({
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
          dbg('judge result: %O', jResult);
          this.onAbortPoint();
          logger.info(`${loggerPrefix} done`, JSON.stringify(jResult));
          this.emit('active');

          switch (jResult.type) {
            case 'CompileError': {
              await this.callbackJudge({
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
              await this.callbackJudge({
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

          await this.callbackQueue.onIdle();
        } catch (e) {
          await this.callbackJudge({
            type: 'finish',
            resultType: 'SystemError',
            detail: {
              error: e.message,
            },
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
