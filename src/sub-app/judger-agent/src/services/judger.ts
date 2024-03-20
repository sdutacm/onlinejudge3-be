import * as path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { river } from '../proto/river';

const PROTO_PATH = path.join(__dirname, '../proto/river/river.proto');
const DEBUG = false;

const log = {
  info(...args: any[]) {
    DEBUG && console.info(...args);
  },
  error(...args: any[]) {
    DEBUG && console.error(...args);
  },
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: Number,
  defaults: true,
  oneofs: true,
});
const riverDef = grpc.loadPackageDefinition(packageDefinition).river;

export interface IJudgerOptions {
  address: string;
}

export class Judger {
  private client: any;

  constructor(opts: IJudgerOptions) {
    // @ts-ignore
    this.client = new riverDef.River(opts.address, grpc.credentials.createInsecure(), {
      'grpc.service_config': JSON.stringify({
        loadBalancingConfig: [{ round_robin: {} }],
      }),
    });
  }

  public getLanguageConfig(): Promise<river.ILanguageItem[]> {
    return new Promise((rs, rj) => {
      this.client.languageConfig({}, function (err: Error, resp: river.ILanguageConfigResponse) {
        if (err) {
          rj(err);
          return;
        }
        // console.log('getLanguageConfig resp', JSON.stringify(resp));
        rs(resp.languages!);
      });
    });
  }

  public getCases(problemId: number): Promise<river.ILsCase[]> {
    return new Promise((rs, rj) => {
      this.client.ls({ pid: problemId }, function (err: Error, resp: river.ILsResponse) {
        if (err) {
          rj(err);
          return;
        }
        // console.log('getCases resp', JSON.stringify(resp));
        rs(resp.cases!);
      });
    });
  }

  public getJudgeCall(opts: IJudgerCallOptions) {
    const call = this.client.judge();
    return new JudgerCall(this, call, opts);
  }
}

export interface IJudgerCallOptions {
  /** 题目数据目录。相对于 `config.judgerData.dataDir` */
  dataDir: string;
  problemId: number;
  language: string;
  code: string;
  timeLimit: number;
  memoryLimit: number;
  judgeType: river.JudgeType;
  spjFile?: string;
  /**
   * 测试点
   * @example [{ in: 'data1.in', out: 'data1.out' }]
   */
  cases?: Array<{ in: string; out: string }>;

  /**
   * 当评测（编译阶段）开始
   */
  onStart?(): void;

  /**
   * 当测试点开始运行评测
   * @param runningCase 当前正要运行的测试点 index
   * @param totalCases 测试点总数量
   */
  onJudgeCaseStart?(runningCase: number, totalCases: number): void;

  /**
   * 当测试点开始评测完成
   * @param doneCase 当前运行结束的测试点 index
   * @param totalCases 测试点总数量
   * @param res 当前测试点评测结果
   * @returns 是否继续评测下一个测试点（当已最后一组时无效）
   */
  onJudgeCaseDone?(doneCase: number, totalCases: number, res: river.IJudgeResult): boolean;

  // /**
  //  * 当评测完成并关闭连接
  //  * @param msg/res 评测机返回
  //  */
  // onFinish?(type: 'CompileError', msg: string): void;
  // onFinish?(type: 'SystemError', msg: string): void;
  // onFinish?(type: 'Done', res: any): void;

  // /**
  //  * 当评测连接异常
  //  * @param err
  //  */
  // onError?(err: Error): void;
}

export class JudgerCall {
  private judger: Judger;
  private call: any;
  private opts: IJudgerCallOptions;
  private judgeResults: river.IJudgeResult[];
  public ended: boolean;

  constructor(judger: Judger, call: any, opts: IJudgerCallOptions) {
    this.judger = judger;
    this.call = call;
    this.opts = opts;
    this.judgeResults = [];
    this.ended = false;
  }

  private end() {
    try {
      this.call.end();
      this.ended = true;
    } catch (e) {
      console.error('End call err:', e);
    }
  }

  private compile(): Promise<river.IJudgeResult> {
    const req: river.IJudgeRequest = {
      compileData: {
        language: this.opts.language,
        code: this.opts.code,
      },
    };
    const onStart = this.opts.onStart;
    return new Promise<river.IJudgeResult>((rs, rj) => {
      log.info('req', req);
      this.call.write(req);
      const onData = function (res: river.IJudgeResponse) {
        log.info('compile data', res);
        if (res.status === river.JudgeStatus.Running) {
          onStart?.();
        }
        if (res.result) {
          rs(res.result);
        }
      };
      const onEnd = function () {
        log.info('compile end');
        rj(new Error('Server ended connection'));
      };
      const onError = function (e: Error) {
        log.error('judge error', e);
        rj(e);
        // An error has occurred and the stream has been closed.
      };
      this.call.on('data', onData);
      this.call.on('end', onEnd);
      this.call.on('error', onError);
    }).finally(() => {
      this.call.removeAllListeners();
    });
  }

  private judge(inFile: string, outFile: string): Promise<river.IJudgeResult> {
    const req: river.IJudgeRequest = {
      judgeData: {
        inFile: `${this.opts.dataDir}/${inFile}`,
        outFile: `${this.opts.dataDir}/${outFile}`,
        timeLimit: this.opts.timeLimit,
        memoryLimit: this.opts.memoryLimit,
        judgeType: this.opts.judgeType,
        spjFile: `${this.opts.dataDir}/${this.opts.spjFile}`,
      },
    };
    return new Promise<river.IJudgeResult>((rs, rj) => {
      log.info('req', req);
      this.call.write(req);
      const onData = function (res: river.IJudgeResponse) {
        log.info('judge data', res);
        if (res.result) {
          rs(res.result);
        }
      };
      const onEnd = function () {
        log.info('judge end');
        rj(new Error('Server ended'));
        // The server has finished sending
      };
      const onError = function (e: Error) {
        log.error('judge error', e);
        rj(e);
        // An error has occurred and the stream has been closed.
      };
      this.call.on('data', onData);
      this.call.on('end', onEnd);
      this.call.on('error', onError);
    }).finally(() => {
      this.call.removeAllListeners();
    });
  }

  public async run(): Promise<
    | { type: 'CompileError'; res: string }
    | { type: 'SystemError'; res: string }
    | { type: 'Done'; res: river.IJudgeResult[]; last: number; total: number }
  > {
    try {
      // 编译
      const compileRes = await this.compile();
      if (compileRes.result === river.JudgeResultEnum.CompileError) {
        return {
          type: 'CompileError',
          res: compileRes.errmsg!,
        };
      }
      if (compileRes.result === river.JudgeResultEnum.SystemError) {
        return {
          type: 'SystemError',
          res: compileRes.errmsg!,
        };
      }
      // 评测
      const judgeCases = this.opts.cases ?? (await this.judger.getCases(this.opts.problemId));
      if (!judgeCases?.length) {
        throw new Error(
          `No judge cases for problem ${
            this.opts.problemId
          } (getCases resp: ${typeof judgeCases} ${JSON.stringify(judgeCases)})`,
        );
      }
      let index: number;
      for (index = 0; index < judgeCases.length; ++index) {
        const judgeCase = judgeCases[index];
        this.opts.onJudgeCaseStart?.(index + 1, judgeCases.length);
        const judgeRes = await this.judge(judgeCase.in!, judgeCase.out!);
        this.judgeResults.push(judgeRes);
        const judgeNext = this.opts.onJudgeCaseDone
          ? this.opts.onJudgeCaseDone(index + 1, judgeCases.length, judgeRes)
          : true;
        if (judgeRes.result === river.JudgeResultEnum.SystemError) {
          return {
            type: 'SystemError',
            res: judgeRes.errmsg!,
          };
        }
        if (!judgeNext) {
          break;
        }
        if (index === judgeCases.length - 1) {
          break;
        }
      }
      return {
        type: 'Done',
        res: this.judgeResults,
        last: index + 1,
        total: judgeCases.length,
      };
    } finally {
      this.end();
    }
  }
}
