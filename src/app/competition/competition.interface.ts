import { IUserModel, IUserModelRatingHistory } from '../user/user.interface';
import { IMProblemDetail } from '../problem/problem.interface';
import { ECompetitionUserRole, ECompetitionUserStatus, EContestRatingStatus } from '@/common/enums';
import { ICompetitionUserInfo } from '@/common/interfaces/competition';

//#region competition model
export interface ICompetitionModel {
  competitionId: number;
  title: string;
  introduction: string;
  startAt: Date;
  endAt: Date;
  ended: boolean;
  isTeam: boolean;
  registerStartAt: Date | null;
  registerEndAt: Date | null;
  createdBy: number;
  hidden: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TCompetitionModelFields = keyof ICompetitionModel;

export type TMCompetitionLiteFields = Extract<
  TCompetitionModelFields,
  | 'competitionId'
  | 'title'
  | 'startAt'
  | 'endAt'
  | 'ended'
  | 'isTeam'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'createdBy'
  | 'hidden'
>;

export type TMCompetitionDetailFields = Extract<
  TCompetitionModelFields,
  | 'competitionId'
  | 'title'
  | 'introduction'
  | 'startAt'
  | 'endAt'
  | 'ended'
  | 'isTeam'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'createdBy'
  | 'hidden'
>;

export type IMCompetitionLite = Pick<ICompetitionModel, TMCompetitionLiteFields>;
export type IMCompetitionDetail = Pick<ICompetitionModel, TMCompetitionDetailFields>;
export type IMCompetitionListPagination = defService.ServiceListOpt<TCompetitionModelFields>;
export type IMCompetitionRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage' | 'rating'
>;
//#endregion

//#region competition problem model
export interface ICompetitionProblemModel {
  competitionId: number;
  problemId: number;
  index: number;
}

export type TCompetitionProblemModelFields = keyof ICompetitionProblemModel;

export type TMCompetitionProblemDetailFields = Extract<
  TCompetitionProblemModelFields,
  'problemId' | 'title'
>;

export type IMCompetitionProblemLite = Pick<
  ICompetitionProblemModel,
  TMCompetitionProblemDetailFields
>;

export type IMCompetitionProblemDetail = Pick<
  ICompetitionProblemModel,
  TMCompetitionProblemDetailFields
> &
  Omit<IMProblemDetail, 'tags'>;
//#endregion

//#region competition user model
export interface ICompetitionUserModel {
  competitionId: number;
  userId: number;
  role: ECompetitionUserRole;
  status: ECompetitionUserStatus;
  info: ICompetitionUserInfo;
  password: string | null;
  fieldShortName: string | null;
  seatNo: number | null;
  banned: boolean;
  unofficialParticipation: boolean;
  createdAt: Date | null;
}

export type TCompetitionUserModelFields = keyof ICompetitionUserModel;

export type TMCompetitionUserLiteFields = Extract<
  TCompetitionUserModelFields,
  | 'competitionId'
  | 'userId'
  | 'role'
  | 'status'
  | 'info'
  | 'password'
  | 'fieldShortName'
  | 'seatNo'
  | 'banned'
  | 'unofficialParticipation'
  | 'createdAt'
>;

export type TMCompetitionUserDetailFields = Extract<
  TCompetitionUserModelFields,
  | 'competitionId'
  | 'userId'
  | 'role'
  | 'status'
  | 'info'
  | 'password'
  | 'fieldShortName'
  | 'seatNo'
  | 'banned'
  | 'unofficialParticipation'
  | 'createdAt'
>;

export interface IMCompetitionUserLite {
  competitionId: ICompetitionUserModel['competitionId'];
  userId: ICompetitionUserModel['userId'];
  role: ICompetitionUserModel['role'];
  status: ICompetitionUserModel['status'];
  info: ICompetitionUserModel['info'];
  fieldShortName: ICompetitionUserModel['fieldShortName'];
  seatNo: ICompetitionUserModel['seatNo'];
  banned: ICompetitionUserModel['banned'];
  unofficialParticipation: ICompetitionUserModel['unofficialParticipation'];
  createdAt: ICompetitionUserModel['createdAt'];
}
export interface IMCompetitionUserDetailPlain {
  competitionId: ICompetitionUserModel['competitionId'];
  userId: ICompetitionUserModel['userId'];
  role: ICompetitionUserModel['role'];
  status: ICompetitionUserModel['status'];
  info: ICompetitionUserModel['info'];
  password: ICompetitionUserModel['password'];
  fieldShortName: ICompetitionUserModel['fieldShortName'];
  seatNo: ICompetitionUserModel['seatNo'];
  banned: ICompetitionUserModel['banned'];
  unofficialParticipation: ICompetitionUserModel['unofficialParticipation'];
  createdAt: ICompetitionUserModel['createdAt'];
}
export type IMCompetitionUserDetail = IMCompetitionUserDetailPlain & {
  rating?: IUserModel['rating'];
};
export type IMCompetitionUserListPagination = defService.ServiceListOpt<
  TCompetitionUserModelFields
>;
//#endregion

//#region competition rating model
export interface IRatingCompetitionModel {
  competitionId: number;
  ratingUntil: Record<
    IUserModel['userId'],
    {
      rating: number;
      ratingHistory: IUserModelRatingHistory;
    }
  >;
  ratingChange: Record<
    IUserModel['userId'],
    {
      oldRating: number;
      newRating: number;
      rank: number;
      ratingChange: number;
    }
  >;
  createdAt: Date;
  updatedAt: Date;
}

export type TRatingCompetitionModelFields = keyof IRatingCompetitionModel;

export type TMCompetitionRatingCompetitionDetailFields = Extract<
  TRatingCompetitionModelFields,
  'competitionId' | 'ratingUntil' | 'ratingChange' | 'createdAt' | 'updatedAt'
>;

export type IMCompetitionRatingCompetitionDetail = Pick<
  IRatingCompetitionModel,
  TMCompetitionRatingCompetitionDetailFields
>;
//#endregion

//#region ranklist
export interface IMCompetitionRanklistProblemResultStat {
  result: 'FB' | 'AC' | 'X' | '-' | '?'; // 结果。'X' 表示提交但未通过，'-' 表示未提交，'?' 表示封榜后有新提交
  attempted: number; // 尝试次数。首次 AC 的那次提交也计入
  time: number; // s
}

export interface IMCompetitionRanklistRow {
  rank: number; // 排名。solved 和 time 都相等时 rank 并列
  user: IMCompetitionRelativeUser & {
    oldRating?: number;
    newRating?: number;
  };
  solved: number;
  time: number; // s
  stats: IMCompetitionRanklistProblemResultStat[];
}

export type IMCompetitionRanklist = IMCompetitionRanklistRow[];
//#endregion

//#region rating status
export interface IMCompetitionRatingStatus {
  status: EContestRatingStatus;
  progress?: number; // 进度
  used?: number; // 完成耗时
}
//#endregion

//#region rank data
export interface IMCompetitionRankDataItem {
  rank: IMCompetitionRanklistRow['rank'];
  userId: IUserModel['userId'];
}

export type IMCompetitionRankData = IMCompetitionRankDataItem[];
//#endregion

//#region service.getList
export interface IMCompetitionServiceGetListOpt {
  competitionId?: ICompetitionModel['competitionId'];
  title?: ICompetitionModel['title'];
  isTeam?: ICompetitionModel['isTeam'];
  createdBy?: ICompetitionModel['createdBy'];
}

export type IMCompetitionServiceGetListRes = defModel.ListModelRes<IMCompetitionLite>;
//#endregion

//#region service.getDetail
export type IMCompetitionServiceGetDetailRes = defModel.DetailModelRes<IMCompetitionDetail>;
//#endregion

//#region service.getRelative
export type IMCompetitionServiceGetRelativeRes = Record<
  ICompetitionModel['competitionId'],
  IMCompetitionDetail
>;
//#endregion

//#region service.findOne
export type IMCompetitionServiceFindOneOpt = Partial<ICompetitionModel>;
export type IMCompetitionServiceFindOneRes = defModel.DetailModelRes<IMCompetitionDetail>;
//#endregion

//#region service.isExists
export type IMCompetitionServiceIsExistsOpt = Partial<ICompetitionModel>;
//#endregion

//#region service.create
export interface IMCompetitionServiceCreateOpt {
  title?: ICompetitionModel['title'];
  introduction?: ICompetitionModel['introduction'];
  startAt?: ICompetitionModel['startAt'] | string;
  endAt?: ICompetitionModel['endAt'] | string;
  isTeam?: ICompetitionModel['isTeam'];
  registerStartAt?: ICompetitionModel['registerStartAt'] | string;
  registerEndAt?: ICompetitionModel['registerEndAt'] | string;
  hidden?: ICompetitionModel['hidden'];
}

export type IMCompetitionServiceCreateRes = ICompetitionModel['competitionId'];
//#endregion

//#region service.update
export interface IMCompetitionServiceUpdateOpt {
  title?: ICompetitionModel['title'];
  introduction?: ICompetitionModel['introduction'];
  startAt?: ICompetitionModel['startAt'] | string;
  endAt?: ICompetitionModel['endAt'] | string;
  ended?: ICompetitionModel['ended'];
  isTeam?: ICompetitionModel['isTeam'];
  registerStartAt?: ICompetitionModel['registerStartAt'] | string;
  registerEndAt?: ICompetitionModel['registerEndAt'] | string;
  hidden?: ICompetitionModel['hidden'];
  deleted?: ICompetitionModel['deleted'];
}

export type IMCompetitionServiceUpdateRes = boolean;
//#endregion

//#region service.getUserCompetitions
export type IMCompetitionServiceGetUserCompetitionsRes = defModel.FullListModelRes<
  ICompetitionModel['competitionId']
>;
//#endregion

//#region service.getCompetitionProblems
export type IMCompetitionServiceGetCompetitionProblemsRes = defModel.FullListModelRes<
  IMCompetitionProblemDetail
>;
//#endregion

//#region service.getCompetitionProblemConfig
export type IMCompetitionServiceGetCompetitionProblemConfigRes = defModel.FullListModelRes<
  IMCompetitionProblemLite
>;
//#endregion

//#region service.setCompetitionProblems
export type IMCompetitionServiceSetCompetitionProblemsOpt = Array<{
  problemId: ICompetitionProblemModel['problemId'];
}>;
//#endregion

//#region service.getCompetitionUserList
export interface IMCompetitionServiceGetCompetitionUserListOpt {
  userId?: ICompetitionUserModel['userId'];
  role?: ICompetitionUserModel['role'];
  status?: ICompetitionUserModel['status'];
  banned?: ICompetitionUserModel['banned'];
  fieldShortName?: ICompetitionUserModel['fieldShortName'];
  seatNo?: ICompetitionUserModel['seatNo'];
}

export type IMCompetitionServiceGetCompetitionUserListRes = defModel.ListModelRes<
  IMCompetitionUserLite
>;
//#endregion

//#region service.getCompetitionUsers
export interface IMCompetitionServiceGetCompetitionUsersOpt {
  role?: ICompetitionUserModel['role'];
  status?: ICompetitionUserModel['status'];
  banned?: ICompetitionUserModel['banned'];
  fieldShortName?: ICompetitionUserModel['fieldShortName'];
  seatNo?: ICompetitionUserModel['seatNo'];
}

export type IMCompetitionServiceGetCompetitionUsersRes = defModel.ListModelRes<
  IMCompetitionUserDetail
>;
//#endregion

//#region service.getCompetitionUserDetail
export type IMCompetitionServiceGetCompetitionUserDetailRes = defModel.DetailModelRes<
  IMCompetitionUserDetail
>;
//#endregion

// //#region service.getRelativeCompetitionUser
// export type IMCompetitionServiceGetRelativeCompetitionUserRes = Record<
//   ICompetitionUserModel['competitionUserId'],
//   IMCompetitionUserDetail
// >;
// //#endregion

//#region service.findOneCompetitionUser
export type IMCompetitionServiceFindOneCompetitionUserOpt = Partial<ICompetitionUserModel>;
export type IMCompetitionServiceFindOneCompetitionUserRes = defModel.DetailModelRes<
  IMCompetitionUserDetail
>;
//#endregion

//#region service.isCompetitionUserExists
export type IMCompetitionServiceIsCompetitionUserExistsOpt = Partial<ICompetitionUserModel>;
//#endregion

// //#region service.createCompetitionUser
// export interface IMCompetitionServiceCreateCompetitionUserOpt {
//   username: ICompetitionUserModel['username'];
//   nickname: ICompetitionUserModel['nickname'];
//   subname?: ICompetitionUserModel['subname'];
//   status?: ICompetitionUserModel['status'];
//   sitNo?: ICompetitionUserModel['sitNo'];
//   unofficial: ICompetitionUserModel['unofficial'];
//   password: ICompetitionUserModel['password'];
//   members: Array<{
//     schoolNo: string;
//     name: string;
//     school: string;
//     college: string;
//     major: string;
//     class: string;
//     tel: string;
//     email: string;
//     clothing: string;
//   }>;
// }

// export type IMCompetitionServiceCreateCompetitionUserRes = ICompetitionUserModel['competitionUserId'];
// //#endregion

//#region service.updateCompetitionUser
export interface IMCompetitionServiceUpdateCompetitionUserOpt {
  role?: ICompetitionUserModel['role'];
  status?: ICompetitionUserModel['status'];
  info?: ICompetitionUserModel['info'];
  password?: ICompetitionUserModel['password'];
  fieldShortName?: ICompetitionUserModel['fieldShortName'];
  seatNo?: ICompetitionUserModel['seatNo'];
  banned?: ICompetitionUserModel['banned'];
  unofficialParticipation?: ICompetitionUserModel['unofficialParticipation'];
}

export type IMCompetitionServiceUpdateCompetitionUserRes = boolean;
//#endregion

// //#region service.getRanklist
// export type IMCompetitionServiceGetRanklistRes = defModel.FullListModelRes<
//   IMCompetitionRanklistRow
// >;
// //#endregion

// //#region service.getRatingStatus
// export type IMCompetitionServiceGetRatingStatusRes = IMCompetitionRatingStatus | null;
// //#endregion

// //#region service.getRatingCompetitionDetail
// export type IMCompetitionServiceGetRatingCompetitionDetailRes = IMCompetitionRatingCompetitionDetail | null;
// //#endregion
