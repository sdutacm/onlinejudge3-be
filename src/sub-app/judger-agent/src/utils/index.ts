import { omit } from 'lodash';
import { decompress } from 'fflate';
import { river } from '../proto/river';
import { judge } from '../proto/judge';
import { ESolutionResult } from '../enums';

export async function decodeJudgeQueueMessage(
  message: Buffer,
): Promise<{
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
}> {
  const obj = judge.JudgeTask.decode(message);
  if (
    !(obj.judgeInfoId > 0) ||
    !(obj.solutionId > 0) ||
    !(obj.problem?.problemId > 0) ||
    !(obj.user?.userId > 0)
  ) {
    throw new Error(
      `Invalid message: ${JSON.stringify({
        ...omit(obj, 'code'),
        code: `bytes(${obj.code.length})`,
      })}`,
    );
  }

  const decompressPromise = (data: Uint8Array, encoding: judge.CodeEncodingEnum) =>
    new Promise<string>((resolve, reject) => {
      switch (encoding) {
        case judge.CodeEncodingEnum.UTF8: {
          resolve(new TextDecoder().decode(data));
          break;
        }
        case judge.CodeEncodingEnum.GZIP: {
          decompress(data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(new TextDecoder().decode(result));
            }
          });
          break;
        }
        default:
          reject(new Error(`Invalid encoding ${obj.codeEncoding}`));
      }
    });
  const code = await decompressPromise(obj.code, obj.codeEncoding);
  return {
    judgeInfoId: obj.judgeInfoId,
    solutionId: obj.solutionId,
    problem: obj.problem as Required<judge.IProblem>,
    user: obj.user as Required<judge.IUser>,
    language: obj.language,
    code,
  };
}

export function convertRiverResultToOJ(result: number) {
  switch (result) {
    case river.JudgeResultEnum.Accepted:
      return ESolutionResult.AC;
    case river.JudgeResultEnum.TimeLimitExceeded:
      return ESolutionResult.TLE;
    case river.JudgeResultEnum.MemoryLimitExceeded:
      return ESolutionResult.MLE;
    case river.JudgeResultEnum.WrongAnswer:
      return ESolutionResult.WA;
    case river.JudgeResultEnum.RuntimeError:
      return ESolutionResult.RTE;
    case river.JudgeResultEnum.OutputLimitExceeded:
      return ESolutionResult.OLE;
    case river.JudgeResultEnum.CompileError:
      return ESolutionResult.CE;
    case river.JudgeResultEnum.PresentationError:
      return ESolutionResult.PE;
    case river.JudgeResultEnum.SystemError:
      return ESolutionResult.SE;
    default:
      return result;
  }
}
