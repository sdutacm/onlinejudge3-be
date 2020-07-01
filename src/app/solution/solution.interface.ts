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

export type IMSolutionLite = Pick<ISolutionModel, TMSolutionLiteFields>;
export type IMSolutionDetail = Pick<ISolutionModel, TMSolutionDetailFields>;
