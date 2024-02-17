import { river } from '../proto/river';
import { ESolutionResult } from '../enums';

export function decodeJudgeQueueMessage(
  message: Buffer,
): {
  judgeInfoId: number;
  solutionId: number;
  problemId: number;
  userId: number;
  language: string;
} {
  const str = message.toString();
  const obj = JSON.parse(str);
  if (
    !(obj.judgeInfoId > 0) ||
    !(obj.solutionId > 0) ||
    !(obj.problemId > 0) ||
    !(obj.userId > 0)
  ) {
    throw new Error('Invalid message: ' + str);
  }
  return {
    judgeInfoId: obj.judgeInfoId,
    solutionId: obj.solutionId,
    problemId: obj.problemId,
    userId: obj.userId,
    language: obj.language,
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
