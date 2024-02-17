import http from 'http';
import os from 'os';
import util from 'util';
import EventEmitter from 'events';
import Axios from 'axios';
import PQueue from 'p-queue';
import PCancelable from 'p-cancelable';
import config from '../config';
import { judgerAgentLogger } from '../utils/logger';
import { river } from '../proto/river';
import { IDbPool } from '../utils/mysql';
import { IRedisClient } from '../utils/redis';
import { Judger } from './judger';
import { ESolutionResult } from '../enums';
import { convertRiverResultToOJ } from '../utils';

const logger = judgerAgentLogger;

const httpAgent = new http.Agent({ keepAlive: true });

const axiosSocketBrideInstance = Axios.create({
  baseURL: config.judgerSocketBridge.baseUrl,
  httpAgent,
  timeout: 5000,
  headers: {
    'x-emit-auth': config.judgerSocketBridge.emitAuthKey,
  },
});

export interface IJudgeStatus {
  hostname: string;
  pid: number;
  status: 'pending' | 'running';
  createdAt: number; // s
  updatedAt: number; // s
  current?: number; // 当前运行的测试点
  total?: number; // 总测试点数量
}

export interface IJudgeOptions {
  judgeInfoId: number;
  solutionId: number;
  problemId: number;
  userId: number;
  language: string;
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
  private readonly pushJudgeStatusQueue = new PQueue({ concurrency: 1 });
  private aborted = false;

  public constructor(private readonly dbPool: IDbPool, private readonly redis: IRedisClient) {
    super();
  }

  /**
   * 获取评测状态。
   * 如果未找到，则返回 `null`
   * @param judgeInfoId judgeInfoId
   */
  public async getSolutionJudgeStatus(judgeInfoId: number): Promise<IJudgeStatus | null> {
    const res = await this.redis.get(util.format(config.redisKey.judgeStatus, judgeInfoId));
    if (!res) {
      return null;
    }
    return JSON.parse(res) as IJudgeStatus;
  }

  /**
   * 设置评测状态。
   * @param judgeInfoId judgeInfoId
   * @param data 数据
   */
  public async setSolutionJudgeStatus(judgeInfoId: number, data: IJudgeStatus): Promise<void> {
    await this.redis.set(
      util.format(config.redisKey.judgeStatus, judgeInfoId),
      JSON.stringify(data),
    );
  }

  /**
   * 删除评测状态。
   * @param judgeInfoId judgeInfoId
   */
  public async delSolutionJudgeStatus(judgeInfoId: number): Promise<void> {
    await this.redis.del(util.format(config.redisKey.judgeStatus, judgeInfoId));
  }

  /**
   * 推送评测状态到所有订阅的客户端。
   * @param solutionId
   * @param statusFormArray
   */
  public pushJudgeStatus(solutionId: number, statusFormArray: any[]) {
    const start = Date.now();
    this.pushJudgeStatusQueue.add(() =>
      axiosSocketBrideInstance
        .post('/pushJudgeStatus', statusFormArray)
        .then(() => {
          // logger.info(`pushJudgeStatus(${Date.now() - start}ms) succ, solutionId: ${solutionId}`);
        })
        .catch((e) => {
          logger.error(
            `pushJudgeStatus(${Date.now() - start}ms) fail, solutionId: ${solutionId}, err:`,
            e.message,
          );
        }),
    );
  }

  /**
   * 清除提交详情缓存。
   * @param solutionId solutionId
   */
  async clearSolutionCache(solutionId: number): Promise<void> {
    await this.redis.del(util.format(config.redisKey.solutionDetail, solutionId));
  }

  async clearSolutionJudgeInfoCache(judgeInfoId: number): Promise<void> {
    await this.redis.del(util.format(config.redisKey.solutionJudgeInfo, judgeInfoId));
  }

  onAbortPoint() {
    if (this.aborted) {
      throw new AbortError('Aborted');
    }
  }

  public judge(options: IJudgeOptions) {
    return new PCancelable<void>((resolve, reject, onCancel) => {
      onCancel(() => {
        this.aborted = true;
      });

      const logic = async () => {
        this.onAbortPoint();
        const { judgeInfoId, solutionId, problemId, userId, language } = options;
        let judgeType = river.JudgeType.Standard;

        logger.info('Acquire DB connection');
        const connection = await this.dbPool.getConnection();
        this.onAbortPoint();

        try {
          const createdAt = Math.floor(Date.now() / 1000);
          logger.info(`[${judgeInfoId}/${solutionId}/${problemId}/${userId}] start`);

          if (!language) {
            throw new InvalidSolutionError(`Invalid language "${options.language}"`);
          }
          if (!problemId) {
            throw new InvalidSolutionError(`No problem specified`);
          }
          this.onAbortPoint();

          const [currentSolutionRes] = await connection.query<any[]>(
            'SELECT judge_info_id FROM solution WHERE solution_id=?',
            [solutionId],
          );
          this.onAbortPoint();
          if (currentSolutionRes[0]?.judge_info_id !== judgeInfoId) {
            logger.info(
              `Solution judgeInfoId does not match (current=${currentSolutionRes[0]?.judge_info_id}, request=${judgeInfoId}), skip`,
            );
            return;
          }

          const [codeRes] = await connection.query<any[]>(
            'SELECT code_content FROM code WHERE solution_id=?',
            [solutionId],
          );
          this.onAbortPoint();
          const code = codeRes[0]?.code_content as string;
          if (!code) {
            throw new InvalidSolutionError(`No code`);
          }

          const [problemRes] = await connection.query<any[]>(
            'SELECT time_limit, memory_limit, is_special_judge FROM problem WHERE problem_id=?',
            [problemId],
          );
          this.onAbortPoint();
          if (!problemRes[0]) {
            throw new InvalidSolutionError(`No such problem`);
          }
          const { time_limit: timeLimit, memory_limit: memoryLimit } = problemRes[0];
          const isSpj = problemRes[0].is_special_judge === 1;
          judgeType = isSpj ? river.JudgeType.Special : river.JudgeType.Standard;

          await this.setSolutionJudgeStatus(judgeInfoId, {
            hostname: os.hostname(),
            pid: process.pid,
            status: 'pending',
            createdAt,
            updatedAt: createdAt,
          });
          await connection.query(
            'UPDATE solution SET result=? WHERE solution_id=? AND judge_info_id=?',
            [ESolutionResult.RPD, solutionId, judgeInfoId],
          );
          await this.clearSolutionCache(solutionId);
          this.onAbortPoint();
          this.emit('active');

          const spjFile = isSpj ? 'spj' : undefined;
          logger.info(
            `[${judgeInfoId}/${solutionId}/${problemId}/${userId}] getJudgeCall`,
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
              logger.info(`[${judgeInfoId}/${solutionId}/${problemId}/${userId}] onStart`);
              this.pushJudgeStatus(solutionId, [solutionId, judgeType, ESolutionResult.JG]);
              this.emit('active');
            },
            onJudgeCaseStart: (current, total) => {
              this.onAbortPoint();
              logger.info(
                `[${judgeInfoId}/${solutionId}/${problemId}/${userId}] onJudgeCaseStart ${current}/${total}`,
              );

              this.setSolutionJudgeStatus(judgeInfoId, {
                hostname: os.hostname(),
                pid: process.pid,
                status: 'running',
                createdAt,
                updatedAt: Math.floor(Date.now() / 1000),
                current,
                total,
              });
              this.pushJudgeStatus(solutionId, [
                solutionId,
                judgeType,
                ESolutionResult.JG,
                current,
                total,
              ]);
              this.emit('active');
            },
            onJudgeCaseDone: (current, total, res) => {
              this.onAbortPoint();
              logger.info(
                `[${judgeInfoId}/${solutionId}/${problemId}/${userId}] onJudgeCaseDone ${current}/${total}`,
              );
              this.emit('active');
              return res.result === river.JudgeResultEnum.Accepted;
            },
          });

          const jResult = await call.run();
          this.onAbortPoint();
          logger.info(
            `[${judgeInfoId}/${solutionId}/${problemId}/${userId}] done`,
            JSON.stringify(jResult),
          );
          this.emit('active');

          switch (jResult.type) {
            case 'CompileError': {
              const result = ESolutionResult.CE;
              const compileInfo = jResult.res;
              // find compile info or insert one
              const [compileInfoRes] = await connection.query<any[]>(
                'SELECT compile_id FROM compile_info WHERE solution_id=? LIMIT 1',
                [solutionId],
              );
              if (compileInfoRes[0]) {
                await connection.query(
                  'UPDATE compile_info SET compile_info=? WHERE solution_id=?',
                  [compileInfo, solutionId],
                );
              } else {
                await connection.query(
                  'INSERT INTO compile_info (solution_id, compile_info) VALUES (?, ?)',
                  [solutionId, compileInfo],
                );
              }
              await connection.query(
                'UPDATE solution SET result=? WHERE solution_id=? AND judge_info_id=?',
                [result, solutionId, judgeInfoId],
              );
              await this.clearSolutionCache(solutionId);
              this.pushJudgeStatus(solutionId, [solutionId, judgeType, result]);
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
              // 更新评测信息
              await connection.query(
                'UPDATE judge_info SET result=?, take_time=?, take_memory=?, last_case=?, total_case=?, detail=?, finished_at=? WHERE id=?',
                [
                  result,
                  maxTimeUsed,
                  maxMemoryUsed,
                  jResult.last,
                  jResult.total,
                  JSON.stringify({
                    cases: jResult.res.map((r) => ({
                      result: convertRiverResultToOJ(r.result!),
                      // @ts-ignore
                      time: r.timeUsed as number,
                      // @ts-ignore
                      memory: r.memoryUsed as number,
                      errMsg: (r.errmsg || undefined) as string | undefined,
                      outMsg: (r.outmsg || undefined) as string | undefined,
                    })),
                  }),
                  new Date(),
                  judgeInfoId,
                ],
              );
              await this.clearSolutionJudgeInfoCache(judgeInfoId);
              // 更新提交
              await connection.query(
                'UPDATE solution SET result=?, take_time=?, take_memory=? WHERE solution_id=? AND judge_info_id=?',
                [result, maxTimeUsed, maxMemoryUsed, solutionId, judgeInfoId],
              );
              await this.clearSolutionCache(solutionId);
              // 推送完成状态
              this.pushJudgeStatus(solutionId, [
                solutionId,
                judgeType,
                result,
                jResult.last,
                jResult.total,
              ]);
              // 需要更新计数，让异步定时任务去处理
              await Promise.all([
                this.redis.sadd(config.redisKey.asyncSolutionProblemStatsTasks, `${problemId}`),
                this.redis.sadd(config.redisKey.asyncSolutionUserStatsTasks, `${userId}`),
              ]);
              logger.info(`[${judgeInfoId}/${solutionId}/${problemId}/${userId}] Judge all ok`);
            }
          }
        } catch (e) {
          const result = ESolutionResult.SE;
          await connection.query(
            'UPDATE solution SET result=? WHERE solution_id=? AND judge_info_id=?',
            [result, solutionId, judgeInfoId],
          );
          await this.clearSolutionCache(solutionId);
          this.pushJudgeStatus(solutionId, [solutionId, judgeType, result]);
          if (e instanceof InvalidSolutionError) {
            logger.warn(`[${solutionId}/${problemId}/${userId}]`, e);
          } else if (e instanceof JudgerSystemError) {
            logger.error(`[${solutionId}/${problemId}/${userId}]`, e);
            throw e;
          } else if (e instanceof AbortError) {
            logger.error(`[${solutionId}/${problemId}/${userId}]`, e);
            throw e;
          } else {
            logger.error(`[${solutionId}/${problemId}/${userId}] Caught error:`, e);
            throw e;
          }
        } finally {
          connection.release();
          await this.delSolutionJudgeStatus(judgeInfoId);
          await this.pushJudgeStatusQueue.onIdle();
        }
      };

      logic().then(resolve).catch(reject);
    });
  }
}
