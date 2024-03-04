import { compress } from 'fflate';
import { ESolutionResult } from '@/common/enums';
import { river } from '@/proto/river';
import { judge } from '@/proto/judge';
import { ISolutionModel } from '@/app/solution/solution.interface';
import { IProblemModel } from '@/app/problem/problem.interface';
import { IUserModel } from '@/app/user/user.interface';
import { ICompetitionModel } from '@/app/competition/competition.interface';

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

export function convertOJLanguageToRiver(language: string) {
  switch (language) {
    case 'gcc':
      return 'C';
    case 'g++':
      return 'C++';
    case 'java':
      return 'Java';
    case 'python2':
      return null;
    case 'python3':
      return 'Python';
    case 'c#':
      return 'C#';
    case 'go':
      return 'Go';
    default:
      return language;
  }
}

export async function encodeJudgeQueueMessage(options: {
  judgeInfoId: number;
  solutionId: ISolutionModel['solutionId'];
  problem: Required<
    Pick<IProblemModel, 'problemId' | 'revision' | 'timeLimit' | 'memoryLimit' | 'spj'>
  >;
  user: Required<Pick<IUserModel, 'userId'>>;
  competition?: Required<Pick<ICompetitionModel, 'competitionId'>>;
  language: string;
  code: string;
}) {
  const { judgeInfoId, solutionId, problem, user, language, code } = options;
  const gzipPromise = (data: Uint8Array) =>
    new Promise<Uint8Array>((resolve, reject) => {
      compress(data, { level: 9 }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  const codeCompressed = await gzipPromise(new TextEncoder().encode(code));
  const bytes = judge.JudgeTask.encode({
    judgeInfoId,
    solutionId,
    problem,
    user,
    language,
    codeEncoding: judge.CodeEncodingEnum.GZIP,
    code: codeCompressed,
  }).finish();
  return bytes;
}

/**
 * 编码评测状态。
 * @param solutionId
 * @param type 评测类型
 * @param result 评测结果
 * @param current 当前运行评测点
 * @param total 总评测点数量
 */
export function encodeJudgeStatusBuffer(
  solutionId: ISolutionModel['solutionId'],
  type: river.JudgeType,
  result: ESolutionResult,
  current?: number,
  total?: number,
) {
  const buffer = new ArrayBuffer(8);
  const dv = new DataView(buffer);
  dv.setUint32(0, solutionId);
  dv.setUint8(4, type);
  dv.setUint8(5, result);
  dv.setUint8(6, current || 0);
  dv.setUint8(7, total || 0);
  return buffer;
}
