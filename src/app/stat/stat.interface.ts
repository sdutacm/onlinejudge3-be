import { IUserModel } from '../user/user.interface';
import { IProblemModel } from '../problem/problem.interface';
import { ISolutionModel } from '../solution/solution.interface';
import { EStatJudgeQueueWorkerStatus } from '@/common/enums';

export type IMStatRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export interface IMStatUserACRankPlain {
  count: number;
  rows: {
    userId: IUserModel['userId'];
    accepted: number;
  }[];
  truncated: number;
  startAt: string; // YYYY-MM-DD HH:mm:ss
  _updateEvery: number; // ms
  _updatedAt: number; // timestamp ms
}
export interface IMStatUserACRank {
  count: number;
  rows: {
    user: IMStatRelativeUser;
    accepted: number;
  }[];
  truncated: number;
  startAt: string; // YYYY-MM-DD HH:mm:ss
  _updateEvery: number; // ms
  _updatedAt: number; // timestamp ms
}

export interface IMStatUserAcceptedProblems {
  accepted: number;
  problems: Array<{
    pid: IProblemModel['problemId'];
    sid: ISolutionModel['solutionId'];
    at: number; // timestamp s
  }>;
  _updatedAt: number; // timestamp ms
}

export interface IMStatUserSubmittedProblems {
  accepted: number;
  submitted: number;
  problems: Array<{
    pid: IProblemModel['problemId'];
    s: Array<{
      sid: ISolutionModel['solutionId'];
      res: number;
      at: number; // timestamp s
    }>;
  }>;
  _updatedAt: number; // timestamp ms
}

export interface IMStatUASPRunInfo {
  lastSolutionId: ISolutionModel['solutionId'];
  _updateEvery: number; // ms
  _updatedAt: number; // timestamp ms
}

export interface IMStatJudgeQueue {
  running: number;
  waiting: number;
  queueSize: number;
  deadQueueSize: number;
  workers: {
    id: string;
    status: EStatJudgeQueueWorkerStatus;
  }[];
}

//#region service.getUserACRank
export type IMStatServiceGetUserACRankRes = IMStatUserACRank | null;
//#endregion

//#region service.getUserAcceptedProblems
export type IMStatServiceGetUserAcceptedProblemsRes = IMStatUserAcceptedProblems | null;
//#endregion

//#region service.getUserSubmittedProblems
export type IMStatServiceGetUserSubmittedProblemsRes = IMStatUserSubmittedProblems | null;
//#endregion

//#region service.getUASPRunInfo
export type IMStatServiceGetUASPRunInfoRes = IMStatUASPRunInfo | null;
//#endregion
