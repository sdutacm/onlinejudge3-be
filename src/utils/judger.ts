import { ESolutionResult } from '@/common/enums';
import { river } from '@/proto/river';

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
      return null;
    default:
      return language;
  }
}
