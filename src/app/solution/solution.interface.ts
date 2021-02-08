import { IUserModel } from '../user/user.interface';
import { IProblemModel } from '../problem/problem.interface';
import { IContestModel } from '../contest/contest.interface';

export interface ISolutionModel {
  solutionId: number;
  problemId: number;
  userId: number;
  contestId: number;
  result: number;
  time: number;
  memory: number;
  language: string;
  codeLength: number;
  username: string;
  ip: string;
  shared: boolean;
  isContestUser: boolean;
  createdAt: Date;
}

export type TSolutionModelFields = keyof ISolutionModel;

export type TMSolutionLiteFields = Extract<
  TSolutionModelFields,
  | 'solutionId'
  | 'problemId'
  | 'userId'
  | 'contestId'
  | 'result'
  | 'time'
  | 'memory'
  | 'language'
  | 'codeLength'
  | 'shared'
  | 'isContestUser'
  | 'createdAt'
>;

export type TMSolutionDetailFields = Extract<
  TSolutionModelFields,
  | 'solutionId'
  | 'problemId'
  | 'userId'
  | 'contestId'
  | 'result'
  | 'time'
  | 'memory'
  | 'language'
  | 'codeLength'
  | 'shared'
  | 'isContestUser'
  | 'createdAt'
>;

export type IMSolutionRelativeProblem = Pick<
  IProblemModel,
  'problemId' | 'title' | 'timeLimit' | 'memoryLimit'
>;
export type IMSolutionRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage' | 'rating'
>;
export type IMSolutionRelativeContest = Pick<
  IContestModel,
  'contestId' | 'title' | 'type' | 'startAt' | 'endAt'
>;

export type IMSolutionLitePlain = Pick<ISolutionModel, TMSolutionLiteFields>;
export type IMSolutionLite = Omit<
  Pick<ISolutionModel, TMSolutionLiteFields>,
  'problemId' | 'userId' | 'contestId'
> & {
  problem: IMSolutionRelativeProblem;
} & {
  user: IMSolutionRelativeUser;
} & {
  contest?: IMSolutionRelativeContest;
};
export type IMSolutionDetailPlain = Pick<ISolutionModel, TMSolutionDetailFields>;
export type IMSolutionDetailPlainFull = Pick<ISolutionModel, TMSolutionDetailFields> & {
  compileInfo: string;
  code: string;
};
export type IMSolutionDetail = Omit<
  Pick<ISolutionModel, TMSolutionDetailFields>,
  'problemId' | 'userId' | 'contestId'
> & {
  problem: IMSolutionRelativeProblem;
} & {
  user: IMSolutionRelativeUser;
} & {
  contest?: IMSolutionRelativeContest;
} & {
  compileInfo: string;
  code: string;
};
export type IMSolutionListPagination = defService.ServiceListOpt<TSolutionModelFields>;

export interface IMSolutionUserProblemResultStats {
  acceptedProblemIds: ISolutionModel['problemId'][];
  attemptedProblemIds: ISolutionModel['problemId'][];
}

export type IMSolutionContestProblemSolutionStats = Record<
  number,
  { accepted: number; submitted: number }
>;

export interface IMSolutionCalendarItem {
  date: string; // YYYY-MM-DD
  count: number;
}

export type IMSolutionCalendar = Array<IMSolutionCalendarItem>;

export interface IMSolutionJudgeStatus {
  hostname: string;
  pid: number;
  status: 'pending' | 'running';
  current?: number; // 当前运行的测试点
  total?: number; // 总测试点数量
}

//#region service.getList
export interface IMSolutionServiceGetListOpt {
  solutionId?: ISolutionModel['solutionId'];
  solutionIds?: ISolutionModel['solutionId'][];
  problemId?: ISolutionModel['problemId'];
  userId?: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  result?: ISolutionModel['result'];
  language?: ISolutionModel['language'];
}

export type IMSolutionServiceGetListRes = defModel.ListModelRes<IMSolutionLite>;
//#endregion

//#region service.getDetail
export type IMSolutionServiceGetDetailRes = defModel.DetailModelRes<IMSolutionDetail>;
//#endregion

//#region service.getRelative
export type IMSolutionServiceGetRelativeRes = Record<
  ISolutionModel['solutionId'],
  IMSolutionDetail
>;
//#endregion

//#region service.create
export interface IMSolutionServiceCreateOpt {
  problemId: ISolutionModel['problemId'];
  userId: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  result?: ISolutionModel['result'];
  time?: ISolutionModel['time'];
  memory?: ISolutionModel['time'];
  language: ISolutionModel['language'];
  codeLength: ISolutionModel['codeLength'];
  username: ISolutionModel['username'];
  ip: ISolutionModel['ip'];
  shared?: ISolutionModel['shared'];
  isContestUser?: ISolutionModel['isContestUser'];
  code: string;
}

export type IMSolutionServiceCreateRes = ISolutionModel['solutionId'];
//#endregion

//#region service.update
export interface IMSolutionServiceUpdateOpt {
  result?: ISolutionModel['result'];
  time?: ISolutionModel['time'];
  memory?: ISolutionModel['time'];
  shared?: ISolutionModel['shared'];
  compileInfo?: string;
}

export type IMSolutionServiceUpdateRes = boolean;
//#endregion

//#region service.getContestProblemSolutionStats
export type IMSolutionServiceGetContestProblemSolutionStatsRes = IMSolutionContestProblemSolutionStats;
//#endregion

//#region service.getUserSolutionCalendar
export type IMSolutionServiceGetUserSolutionCalendarRes = IMSolutionCalendar;
//#endregion

//#region service.getAllContestSolutionList
export type IMSolutionServiceGetAllContestSolutionListRes = IMSolutionLitePlain[];
//#endregion

//#region service.findAllSolutionIds
export interface IMSolutionServiceFindAllSolutionIdsOpt {
  solutionId?: ISolutionModel['solutionId'];
  problemId?: ISolutionModel['problemId'];
  userId?: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  result?: ISolutionModel['result'];
}

export type IMSolutionServiceFindAllSolutionIdsRes = ISolutionModel['solutionId'][];
//#endregion

//#region service.getPendingSolutions
export type IMSolutionServiceGetPendingSolutionsRes = Array<{
  solutionId: ISolutionModel['solutionId'];
  problemId: ISolutionModel['problemId'];
  userId: ISolutionModel['userId'];
}>;
//#endregion

//#region service.judge
export interface IMSolutionServiceJudgeOpt {
  solutionId: ISolutionModel['solutionId'];
  problemId: ISolutionModel['problemId'];
  timeLimit: IProblemModel['timeLimit'];
  memoryLimit: IProblemModel['memoryLimit'];
  userId: ISolutionModel['userId'];
  language: string;
  code: string;
}

export type IMSolutionServiceJudgeRes = void;
//#endregion
