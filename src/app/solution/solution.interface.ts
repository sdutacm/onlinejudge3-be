import { IUserModel } from '../user/user.interface';
import { IProblemModel } from '../problem/problem.interface';
import { IContestModel } from '../contest/contest.interface';
import { ICompetitionModel, ICompetitionSettingModel } from '../competition/competition.interface';
import { ESolutionResult } from '@/common/enums';

export interface ISolutionModel {
  solutionId: number;
  problemId: number;
  userId: number;
  contestId: number;
  competitionId: number | null;
  judgeInfoId: number | null;
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

interface IJudgeInfoDetailCase {
  result: number;
  time: number;
  memory: number;
  compileInfo?: string;
  errMsg?: string;
  outMsg?: string;
}

interface IJudgeInfoDetail {
  cases: IJudgeInfoDetailCase[];
}

export interface IJudgeInfoModel {
  judgeInfoId: number;
  solutionId: number;
  problemRevision: number | null;
  result: ESolutionResult;
  time: number;
  memory: number;
  lastCase: number;
  totalCase: number;
  detail: IJudgeInfoDetail | null;
  createdAt: Date;
  finishedAt: Date | null;
}

export type TSolutionModelFields = keyof ISolutionModel;

export type TMSolutionLiteFields = Extract<
  TSolutionModelFields,
  | 'solutionId'
  | 'problemId'
  | 'userId'
  | 'contestId'
  | 'competitionId'
  | 'judgeInfoId'
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
  | 'competitionId'
  | 'judgeInfoId'
  | 'result'
  | 'time'
  | 'memory'
  | 'language'
  | 'codeLength'
  | 'shared'
  | 'isContestUser'
  | 'createdAt'
>;

export type TJudgeInfoModelFields = keyof IJudgeInfoModel;
export type TMJudgeInfoFields = Extract<
  TJudgeInfoModelFields,
  | 'judgeInfoId'
  | 'solutionId'
  | 'problemRevision'
  | 'result'
  | 'time'
  | 'memory'
  | 'lastCase'
  | 'totalCase'
  | 'detail'
  | 'createdAt'
  | 'finishedAt'
>;

export type IMSolutionJudgeInfo = Pick<
  IJudgeInfoModel,
  | 'problemRevision'
  | 'result'
  | 'time'
  | 'memory'
  | 'lastCase'
  | 'totalCase'
  | 'detail'
  | 'createdAt'
  | 'finishedAt'
>;
export type IMSolutionJudgeInfoFull = Pick<
  IJudgeInfoModel,
  | 'judgeInfoId'
  | 'solutionId'
  | 'problemRevision'
  | 'result'
  | 'time'
  | 'memory'
  | 'lastCase'
  | 'totalCase'
  | 'detail'
  | 'createdAt'
  | 'finishedAt'
>;

export type IMSolutionRelativeProblem = Pick<
  IProblemModel,
  'problemId' | 'title' | 'timeLimit' | 'memoryLimit' | 'spj'
>;
export type IMSolutionRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage' | 'rating'
>;
export type IMSolutionRelativeContest = Pick<
  IContestModel,
  'contestId' | 'title' | 'type' | 'startAt' | 'endAt' | 'ended' | 'frozenLength'
>;
export type IMSolutionRelativeCompetition = Pick<
  ICompetitionModel,
  'competitionId' | 'title' | 'rule' | 'isTeam' | 'isRating' | 'ended' | 'startAt' | 'endAt'
> & {
  settings: Omit<
    ICompetitionSettingModel,
    'competitionId' | 'joinPassword' | 'createdAt' | 'updatedAt'
  >;
};

export type IMSolutionLitePlain = Pick<ISolutionModel, TMSolutionLiteFields>;
export type IMSolutionLite = Omit<
  Pick<ISolutionModel, TMSolutionLiteFields>,
  'problemId' | 'userId' | 'contestId' | 'competitionId' | 'judgeInfoId'
> & {
  problem: IMSolutionRelativeProblem;
} & {
  user: IMSolutionRelativeUser;
} & {
  contest?: IMSolutionRelativeContest;
} & {
  competition?: IMSolutionRelativeCompetition;
} & {
  judgeInfo?: IMSolutionJudgeInfo;
};
export type IMSolutionDetailPlain = Pick<ISolutionModel, TMSolutionDetailFields>;
export type IMSolutionDetailPlainFull = Pick<ISolutionModel, TMSolutionDetailFields> & {
  compileInfo: string;
  code: string;
};
export type IMSolutionDetail = Omit<
  Pick<ISolutionModel, TMSolutionDetailFields>,
  'problemId' | 'userId' | 'contestId' | 'competitionId' | 'judgeInfoId'
> & {
  problem: IMSolutionRelativeProblem;
} & {
  user: IMSolutionRelativeUser;
} & {
  contest?: IMSolutionRelativeContest;
} & {
  competition?: IMSolutionRelativeCompetition;
} & {
  judgeInfo?: IMSolutionJudgeInfo;
} & {
  compileInfo: string;
  code: string;
};
export interface IMSolutionListPagination {
  lt?: number | null;
  gt?: number;
  limit?: number;
  order: Array<[TSolutionModelFields, 'ASC' | 'DESC']>;
}

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

/**
 * 评测状态（仅在提交被评测期间存在）
 */
export interface IMSolutionJudgeStatus {
  solutionId: number;
  judgerId: string;
  status: 'ready' | 'running';
  eventTimestampUs: number; // microsecond
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
  competitionId?: ISolutionModel['competitionId'];
  result?: ISolutionModel['result'];
  language?: ISolutionModel['language'];
}

export type IMSolutionServiceGetListRes = IMSolutionLite[];
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

//#region service.getRelativeJudgeInfo
export type IMSolutionServiceGetRelativeJudgeInfoRes = Record<
  ISolutionModel['solutionId'],
  IMSolutionJudgeInfo
>;
//#endregion

//#region service.create
export interface IMSolutionServiceCreateOpt {
  problemId: ISolutionModel['problemId'];
  userId: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  competitionId?: ISolutionModel['competitionId'];
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
  judgeInfoId?: ISolutionModel['judgeInfoId'];
  result?: ISolutionModel['result'];
  time?: ISolutionModel['time'];
  memory?: ISolutionModel['time'];
  shared?: ISolutionModel['shared'];
  compileInfo?: string | null;
}

export type IMSolutionServiceUpdateRes = boolean;
//#endregion

//#region service.getContestProblemSolutionStats
export type IMSolutionServiceGetContestProblemSolutionStatsRes = IMSolutionContestProblemSolutionStats;
//#endregion

//#region service.getCompetitionProblemSolutionStats
export type IMSolutionServiceGetCompetitionProblemSolutionStatsRes = IMSolutionContestProblemSolutionStats;
//#endregion

//#region service.getUserSolutionCalendar
export type IMSolutionServiceGetUserSolutionCalendarRes = IMSolutionCalendar;
//#endregion

//#region service.getAllContestSolutionList
export type IMSolutionServiceGetAllContestSolutionListRes = IMSolutionLitePlain[];
//#endregion

//#region service.getAllCompetitionSolutionList
export type IMSolutionServiceGetAllCompetitionSolutionListRes = IMSolutionLitePlain[];
//#endregion

//#region service.getAllCompetitionSolutionListByUserId
export type IMSolutionServiceGetAllCompetitionSolutionListByUserIdRes = IMSolutionLitePlain[];
//#endregion

//#region service.findAllSolutionIds
export interface IMSolutionServiceFindAllSolutionIdsOpt {
  solutionId?: ISolutionModel['solutionId'];
  problemId?: ISolutionModel['problemId'];
  userId?: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  competitionId?: ISolutionModel['competitionId'];
  result?: ISolutionModel['result'];
}

export type IMSolutionServiceFindAllSolutionIdsRes = ISolutionModel['solutionId'][];
//#endregion

//#region service.findAllSolutionWithIds
export interface IMSolutionServiceFindAllSolutionWithIdsOpt {
  solutionId?: ISolutionModel['solutionId'];
  problemId?: ISolutionModel['problemId'];
  userId?: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  competitionId?: ISolutionModel['competitionId'];
  result?: ISolutionModel['result'];
}

export type IMSolutionServiceFindAllSolutionWithIdsRes = Pick<
  ISolutionModel,
  'solutionId' | 'problemId' | 'userId' | 'contestId' | 'competitionId' | 'judgeInfoId' | 'language'
>[];
//#endregion

//#region service.getPendingSolutions
export type IMSolutionServiceGetPendingSolutionsRes = Array<{
  solutionId: ISolutionModel['solutionId'];
  problemId: ISolutionModel['problemId'];
  userId: ISolutionModel['userId'];
}>;
//#endregion

//#region service.createJudgeInfo
export interface IMSolutionServiceCreateJudgeInfoOpt {
  problemRevision: IJudgeInfoModel['problemRevision'];
  result?: IJudgeInfoModel['result'];
}
//#endregion

//#region service.updateJudgeInfo
export interface IMSolutionServiceUpdateJudgeInfoOpt {
  result: IJudgeInfoModel['result'];
  time?: IJudgeInfoModel['time'];
  memory?: IJudgeInfoModel['memory'];
  lastCase?: IJudgeInfoModel['lastCase'];
  totalCase?: IJudgeInfoModel['totalCase'];
  detail?: IJudgeInfoDetail;
  finishedAt: IJudgeInfoModel['finishedAt'];
}
//#endregion

//#region service.judge
export interface IMSolutionServiceJudgeOpt {
  judgeInfoId: number;
  solutionId: ISolutionModel['solutionId'];
  problemId: ISolutionModel['problemId'];
  timeLimit: IProblemModel['timeLimit'];
  memoryLimit: IProblemModel['memoryLimit'];
  userId: ISolutionModel['userId'];
  language: string;
  code: string;
  spj?: boolean;
}

export type IMSolutionServiceJudgeRes = void;
//#endregion

//#region service.getLiteSolutionSlice
export interface IMSolutionServiceGetLiteSolutionSliceOpt {
  problemId?: ISolutionModel['problemId'];
  userId?: ISolutionModel['userId'];
  contestId?: ISolutionModel['contestId'];
  competitionId?: ISolutionModel['competitionId'];
}

export interface IMSolutionServiceLiteSolution {
  solutionId: ISolutionModel['solutionId'];
  problemId: ISolutionModel['problemId'];
  userId: ISolutionModel['userId'];
  contestId: ISolutionModel['contestId'];
  competitionId: ISolutionModel['competitionId'];
  result: ISolutionModel['result'];
  language: ISolutionModel['language'];
  createdAt: ISolutionModel['createdAt'];
}

export type IMSolutionServiceGetLiteSolutionSliceRes = IMSolutionServiceLiteSolution[];
//#endregion
