import { IUserModel } from '../user/user.interface';
import { EContestType, EContestCategory, EContestMode } from '@/common/enums';
import { IMProblemDetail } from '../problem/problem.interface';

export interface IContestModel {
  contestId: number;
  title: string;
  description: string;
  intro: string;
  type: EContestType;
  category: EContestCategory;
  mode: EContestMode;
  password: string;
  author: number;
  startAt: Date;
  endAt: Date;
  frozenLength: number;
  registerStartAt: Date | null;
  registerEndAt: Date | null;
  team: boolean;
  ended: boolean;
  hidden: boolean;
}

export type TContestModelFields = keyof IContestModel;

export type TMContestLiteFields = Extract<
  TContestModelFields,
  | 'contestId'
  | 'title'
  | 'type'
  | 'category'
  | 'mode'
  | 'startAt'
  | 'endAt'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'team'
  | 'hidden'
>;

export type TMContestDetailFields = Extract<
  TContestModelFields,
  | 'contestId'
  | 'title'
  | 'type'
  | 'category'
  | 'mode'
  | 'intro'
  | 'description'
  | 'password'
  | 'startAt'
  | 'endAt'
  | 'frozenLength'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'team'
  | 'ended'
  | 'hidden'
>;

export type IMContestLite = Pick<IContestModel, TMContestLiteFields>;
export type IMContestDetail = Pick<IContestModel, TMContestDetailFields>;
export type IMContestListPagination = defService.ServiceListOpt<TContestModelFields>;

export interface IContestProblemModel {
  contestId: number;
  problemId: number;
  title: string;
  index: number;
}

export type TContestProblemModelFields = keyof IContestProblemModel;

export type TMContestProblemDetailFields = Extract<
  TContestProblemModelFields,
  'problemId' | 'title'
>;

export type IMContestProblemLite = Pick<IContestProblemModel, TMContestProblemDetailFields>;

export type IMContestProblemDetail = Pick<IContestProblemModel, TMContestProblemDetailFields> &
  Omit<IMProblemDetail, 'tags'>;

//#region service.getList
export interface IMContestServiceGetListOpt {
  contestId?: IContestModel['contestId'];
  contestIds?: IContestModel['contestId'][];
  title?: IContestModel['title'];
  type?: IContestModel['type'];
  category?: IContestModel['category'];
  mode?: IContestModel['mode'];
  hidden?: IContestModel['hidden'];
  userId?: IUserModel['userId'];
}

export type IMContestServiceGetListRes = defModel.ListModelRes<IMContestLite>;
//#endregion

//#region service.getDetail
export type IMContestServiceGetDetailRes = defModel.DetailModelRes<IMContestDetail>;
//#endregion

//#region service.getRelative
export type IMContestServiceGetRelativeRes = Record<IContestModel['contestId'], IMContestDetail>;
//#endregion

//#region service.findOne
export type IMContestServiceFindOneOpt = Partial<IContestModel>;
export type IMContestServiceFindOneRes = defModel.DetailModelRes<IMContestDetail>;
//#endregion

//#region service.isExists
export type IMContestServiceIsExistsOpt = Partial<IContestModel>;
//#endregion

//#region service.create
export interface IMContestServiceCreateOpt {
  title: IContestModel['title'];
  description: IContestModel['description'];
  intro?: IContestModel['intro'];
  type: IContestModel['type'];
  category: IContestModel['category'];
  mode: IContestModel['mode'];
  password?: IContestModel['password'];
  author: IContestModel['author'];
  startAt: IContestModel['startAt'];
  endAt: IContestModel['endAt'];
  frozenLength?: IContestModel['frozenLength'];
  registerStartAt?: IContestModel['registerStartAt'];
  registerEndAt?: IContestModel['registerEndAt'];
  team?: IContestModel['team'];
  hidden?: IContestModel['hidden'];
}

export type IMContestServiceCreateRes = IContestModel['contestId'];
//#endregion

//#region service.update
export interface IMContestServiceUpdateOpt {
  title?: IContestModel['title'];
  description?: IContestModel['description'];
  intro?: IContestModel['intro'];
  type?: IContestModel['type'];
  category?: IContestModel['category'];
  mode?: IContestModel['mode'];
  password?: IContestModel['password'];
  author?: IContestModel['author'];
  startAt?: IContestModel['startAt'];
  endAt?: IContestModel['endAt'];
  frozenLength?: IContestModel['frozenLength'];
  registerStartAt?: IContestModel['registerStartAt'];
  registerEndAt?: IContestModel['registerEndAt'];
  team?: IContestModel['team'];
  hidden?: IContestModel['hidden'];
}

export type IMContestServiceUpdateRes = boolean;
//#endregion

//#region service.getUserContests
export type IMContestServiceGetUserContestsRes = defModel.FullListModelRes<
  IContestModel['contestId']
>;
//#endregion

//#region service.getContestProblems
export type IMContestServiceGetContestProblemsRes = defModel.FullListModelRes<
  IMContestProblemDetail
>;
//#endregion
