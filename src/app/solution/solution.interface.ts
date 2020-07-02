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
  | 'createdAt'
>;

export type IMSolutionRelativeProblem = Pick<IProblemModel, 'problemId' | 'title' | 'timeLimit'>;
export type IMSolutionRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage' | 'rating'
>;
export type IMSolutionRelativeContest = Pick<IContestModel, 'contestId' | 'title' | 'type'>;

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
export type IMSolutionDetail = Omit<
  Pick<ISolutionModel, TMSolutionDetailFields>,
  'problemId' | 'userId' | 'contestId'
> & {
  problem: IMSolutionRelativeProblem;
} & {
  user: IMSolutionRelativeUser;
} & {
  contest?: IMSolutionRelativeContest;
};

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

//#region service.findOne
export type IMSolutionServiceFindOneOpt = Partial<ISolutionModel>;
export type IMSolutionServiceFindOneRes = defModel.DetailModelRes<IMSolutionDetail>;
//#endregion

//#region service.isExists
export type IMSolutionServiceIsExistsOpt = Partial<ISolutionModel>;
//#endregion
