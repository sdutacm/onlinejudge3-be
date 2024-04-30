import { IUserModel, IUserModelRatingHistory } from '../user/user.interface';
import { IMProblemDetail } from '../problem/problem.interface';
import { ECompetitionUserRole, ECompetitionUserStatus, EContestRatingStatus } from '@/common/enums';
import { ICompetitionUserInfo } from '@/common/interfaces/competition';
import { ECompetitionLogAction, ECompetitionEvent } from './competition.enum';
import { IMContestRatingContestDetail } from '../contest/contest.interface';

export interface ICompetitionSession {
  userId: number;
  nickname: string;
  subname: string;
  role: ECompetitionUserRole;
}

//#region competition model
export interface ICompetitionModel {
  competitionId: number;
  title: string;
  introduction: string;
  announcement: string;
  startAt: Date;
  endAt: Date;
  rule: string;
  ended: boolean;
  isTeam: boolean;
  isRating: boolean;
  registerStartAt: Date | null;
  registerEndAt: Date | null;
  createdBy: number;
  hidden: boolean;
  deleted: boolean;
  spConfig: any;
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
  | 'rule'
  | 'isTeam'
  | 'isRating'
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
  | 'announcement'
  | 'startAt'
  | 'endAt'
  | 'ended'
  | 'rule'
  | 'isTeam'
  | 'isRating'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'createdBy'
  | 'hidden'
  | 'spConfig'
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
  alias: string;
  balloonAlias: string;
  balloonColor: string;
  score: number | null;
  varScoreExpression: string;
}

export type TCompetitionProblemModelFields = keyof ICompetitionProblemModel;

export type TMCompetitionProblemDetailFields = Extract<
  TCompetitionProblemModelFields,
  'problemId' | 'title' | 'alias' | 'balloonAlias' | 'balloonColor' | 'score' | 'varScoreExpression'
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

//#region competition log model
export interface ICompetitionLogModel {
  competitionLogId: number;
  competitionId: number;
  action: ECompetitionLogAction;
  opUserId: number | null;
  userId: number | null;
  problemId: number | null;
  solutionId: number | null;
  detail: any;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

export interface IMCompetitionLogLite {
  competitionLogId: ICompetitionLogModel['competitionLogId'];
  action: ICompetitionLogModel['action'];
  opUserId: ICompetitionLogModel['opUserId'];
  userId: ICompetitionLogModel['userId'];
  problemId: ICompetitionLogModel['problemId'];
  solutionId: ICompetitionLogModel['solutionId'];
  detail: ICompetitionLogModel['detail'];
  createdAt: ICompetitionLogModel['createdAt'];
}
//#endregion

//#region competition event model
export interface ICompetitionEventModel {
  competitionEventId: number;
  competitionId: number;
  event: ECompetitionEvent;
  detail: any;
  userId: number | null;
  problemId: number | null;
  solutionId: number | null;
  judgeInfoId: number | null;
  createdAt: Date;
}

export interface IMCompetitionEventLite {
  competitionEventId: ICompetitionEventModel['competitionEventId'];
  event: ICompetitionEventModel['event'];
  detail: ICompetitionEventModel['detail'];
  userId: ICompetitionEventModel['userId'];
  problemId: ICompetitionEventModel['problemId'];
  solutionId: ICompetitionEventModel['solutionId'];
  judgeInfoId: ICompetitionEventModel['judgeInfoId'];
  createdAt: ICompetitionEventModel['createdAt'];
}
//#endregion

//#region competition setting model
export interface ICompetitionSettingModel {
  competitionId: number;
  frozenLength: number;
  allowedJoinMethods: string[]; // ECompetitionSettingAllowedJoinMethod[];
  allowedAuthMethods: string[]; // ECompetitionSettingAllowedAuthMethod[];
  allowedSolutionLanguages: string[]; // judger available languages
  allowAnyObservation: boolean;
  useOnetimePassword: boolean;
  joinPassword: string;
  externalRanklistUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TCompetitionSettingModelFields = keyof ICompetitionSettingModel;

export type TMCompetitionSettingDetailFields = Extract<
  TCompetitionSettingModelFields,
  | 'competitionId'
  | 'frozenLength'
  | 'allowedJoinMethods'
  | 'allowedAuthMethods'
  | 'allowedSolutionLanguages'
  | 'allowAnyObservation'
  | 'useOnetimePassword'
  | 'joinPassword'
  | 'externalRanklistUrl'
  | 'createdAt'
  | 'updatedAt'
>;

export interface IMCompetitionSettingDetail {
  competitionId: ICompetitionSettingModel['competitionId'];
  frozenLength: ICompetitionSettingModel['frozenLength'];
  allowedJoinMethods: ICompetitionSettingModel['allowedJoinMethods'];
  allowedAuthMethods: ICompetitionSettingModel['allowedAuthMethods'];
  allowedSolutionLanguages: ICompetitionSettingModel['allowedSolutionLanguages'];
  allowAnyObservation: ICompetitionSettingModel['allowAnyObservation'];
  useOnetimePassword: ICompetitionSettingModel['useOnetimePassword'];
  joinPassword: ICompetitionSettingModel['joinPassword'];
  externalRanklistUrl: ICompetitionSettingModel['externalRanklistUrl'];
  createdAt: ICompetitionSettingModel['createdAt'];
  updatedAt: ICompetitionSettingModel['updatedAt'];
}
//#endregion

//#region competition notification model
export interface ICompetitionNotificationModel {
  competitionNotificationId: number;
  competitionId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TCompetitionNotificationModelFields = keyof ICompetitionNotificationModel;

export type TMCompetitionNotificationDetailFields = Extract<
  TCompetitionNotificationModelFields,
  'competitionNotificationId' | 'competitionId' | 'userId' | 'content' | 'createdAt' | 'updatedAt'
>;

export interface IMCompetitionNotificationDetail {
  competitionNotificationId: ICompetitionNotificationModel['competitionNotificationId'];
  competitionId: ICompetitionNotificationModel['competitionId'];
  userId: ICompetitionNotificationModel['userId'];
  content: ICompetitionNotificationModel['content'];
  createdAt: ICompetitionNotificationModel['createdAt'];
  updatedAt: ICompetitionNotificationModel['updatedAt'];
}
//#endregion

//#region competition question model
export interface ICompetitionQuestionModel {
  competitionQuestionId: number;
  competitionId: number;
  userId: number;
  status: number;
  content: string;
  reply: string;
  repliedUserId: number | null;
  repliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TCompetitionQuestionModelFields = keyof ICompetitionQuestionModel;

export type TMCompetitionQuestionDetailFields = Extract<
  TCompetitionQuestionModelFields,
  | 'competitionQuestionId'
  | 'competitionId'
  | 'userId'
  | 'status'
  | 'content'
  | 'reply'
  | 'repliedUserId'
  | 'repliedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export interface IMCompetitionQuestionDetail {
  competitionQuestionId: ICompetitionQuestionModel['competitionQuestionId'];
  competitionId: ICompetitionQuestionModel['competitionId'];
  status: ICompetitionQuestionModel['status'];
  userId: ICompetitionQuestionModel['userId'];
  content: ICompetitionQuestionModel['content'];
  reply: ICompetitionQuestionModel['reply'];
  repliedUserId: ICompetitionQuestionModel['repliedUserId'];
  repliedAt: ICompetitionQuestionModel['repliedAt'];
  createdAt: ICompetitionQuestionModel['createdAt'];
  updatedAt: ICompetitionQuestionModel['updatedAt'];
}
//#endregion

//#region ranklist
export interface IMCompetitionRanklistProblemResultStat {
  result: 'FB' | 'AC' | 'RJ' | '?' | null; // 结果。'?' 表示封榜后有新提交，null 表示未提交
  tries: number; // 尝试次数。首次 AC 的那次提交也计入
  time: number; // AC 时的时间。单位为 s
  score?: number; // 得分
}

export interface IMCompetitionRanklistRow {
  rank: number; // 排名。score 和 time 都相等时 rank 并列
  user: IMCompetitionRelativeUser & {
    oldRating?: number;
    newRating?: number;
  };
  score: number; // 总得分
  time: number; // 总时间（部分规则下可能包含罚时时间）。单位为 s
  stats: IMCompetitionRanklistProblemResultStat[];
}

export type IMCompetitionRanklist = IMCompetitionRanklistRow[];
//#endregion

//#region rating status
export interface IMCompetitionRatingStatus {
  status: EContestRatingStatus;
  progress?: number; // 进度
  used?: number; // 完成耗时
  totalUsed?: number; // 完成总耗时（包括数据库写入等 IO）
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
  rule?: ICompetitionModel['rule'];
  isTeam?: ICompetitionModel['isTeam'];
  isRating?: ICompetitionModel['isRating'];
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
  IMCompetitionDetail & {
    settings: Omit<
      ICompetitionSettingModel,
      'competitionId' | 'joinPassword' | 'createdAt' | 'updatedAt'
    >;
  }
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
  announcement?: ICompetitionModel['announcement'];
  startAt?: ICompetitionModel['startAt'] | string;
  endAt?: ICompetitionModel['endAt'] | string;
  rule?: ICompetitionModel['rule'];
  isTeam?: ICompetitionModel['isTeam'];
  isRating?: ICompetitionModel['isRating'];
  registerStartAt?: ICompetitionModel['registerStartAt'] | string;
  registerEndAt?: ICompetitionModel['registerEndAt'] | string;
  hidden?: ICompetitionModel['hidden'];
  spConfig?: ICompetitionModel['spConfig'];
  createdBy?: ICompetitionModel['createdBy'];
}

export type IMCompetitionServiceCreateRes = ICompetitionModel['competitionId'];
//#endregion

//#region service.update
export interface IMCompetitionServiceUpdateOpt {
  title?: ICompetitionModel['title'];
  introduction?: ICompetitionModel['introduction'];
  announcement?: ICompetitionModel['announcement'];
  startAt?: ICompetitionModel['startAt'] | string;
  endAt?: ICompetitionModel['endAt'] | string;
  ended?: ICompetitionModel['ended'];
  rule?: ICompetitionModel['rule'];
  isTeam?: ICompetitionModel['isTeam'];
  isRating?: ICompetitionModel['isRating'];
  registerStartAt?: ICompetitionModel['registerStartAt'] | string;
  registerEndAt?: ICompetitionModel['registerEndAt'] | string;
  hidden?: ICompetitionModel['hidden'];
  deleted?: ICompetitionModel['deleted'];
  spConfig?: ICompetitionModel['spConfig'];
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
  alias: ICompetitionProblemModel['alias'];
  balloonAlias?: ICompetitionProblemModel['balloonAlias'];
  balloonColor?: ICompetitionProblemModel['balloonColor'];
  score?: ICompetitionProblemModel['score'];
  varScoreExpression?: ICompetitionProblemModel['varScoreExpression'];
}>;
//#endregion

//#region service.getRelativeCompetitionProblem
export type IMCompetitionServiceGetRelativeCompetitionProblemRes = Record<
  /** competitionId_problemId */ string,
  IMCompetitionProblemDetail
>;
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
// export interface IMCompetitionServiceGetCompetitionUsersOpt {
//   role?: ICompetitionUserModel['role'];
//   status?: ICompetitionUserModel['status'];
//   banned?: ICompetitionUserModel['banned'];
//   fieldShortName?: ICompetitionUserModel['fieldShortName'];
//   seatNo?: ICompetitionUserModel['seatNo'];
// }

export type IMCompetitionServiceGetCompetitionUsersRes = defModel.ListModelRes<
  IMCompetitionUserLite
>;
//#endregion

//#region service.getAllCompetitionUsers
export type IMCompetitionServiceGetAllCompetitionUsersRes = defModel.ListModelRes<
  IMCompetitionUserDetail
>;
//#endregion

//#region service.getCompetitionUserDetail
export type IMCompetitionServiceGetCompetitionUserDetailRes = defModel.DetailModelRes<
  IMCompetitionUserDetail
>;
//#endregion

//#region service.getRelativeCompetitionUser
export type IMCompetitionServiceGetRelativeCompetitionUserRes = Record<
  /** competitionId_userId */ string,
  IMCompetitionUserDetail
>;
//#endregion

//#region service.findOneCompetitionUser
export type IMCompetitionServiceFindOneCompetitionUserOpt = Partial<ICompetitionUserModel>;
export type IMCompetitionServiceFindOneCompetitionUserRes = defModel.DetailModelRes<
  IMCompetitionUserDetail
>;
//#endregion

//#region service.isCompetitionUserExists
export type IMCompetitionServiceIsCompetitionUserExistsOpt = Partial<ICompetitionUserModel>;
//#endregion

//#region service.createCompetitionUser
export interface IMCompetitionServiceCreateCompetitionUserOpt {
  role: ICompetitionUserModel['role'];
  status: ICompetitionUserModel['status'];
  info: ICompetitionUserModel['info'];
  password?: ICompetitionUserModel['password'];
  fieldShortName?: ICompetitionUserModel['fieldShortName'];
  seatNo?: ICompetitionUserModel['seatNo'];
  banned?: ICompetitionUserModel['banned'];
  unofficialParticipation?: ICompetitionUserModel['unofficialParticipation'];
}

export type IMCompetitionServiceCreateCompetitionUserRes = void;
//#endregion

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
export type IMCompetitionServiceGetRanklistRes = defModel.FullListModelRes<
  IMCompetitionRanklistRow
>;
// //#endregion

// //#region service.getRatingStatus
export type IMCompetitionServiceGetRatingStatusRes = IMCompetitionRatingStatus | null;
// //#endregion

// //#region service.getRatingCompetitionDetail
// export type IMCompetitionServiceGetRatingCompetitionDetailRes = IMCompetitionRatingCompetitionDetail | null;
// //#endregion

//#region service.getRatingContestDetail
export type IMCompetitionServiceGetRatingContestDetailRes = IMContestRatingContestDetail | null;
//#endregion

//#region service.createCompetitionSetting
export interface IMCompetitionServiceCreateCompetitionSettingOpt {
  frozenLength?: ICompetitionSettingModel['frozenLength'];
  allowedJoinMethods?: ICompetitionSettingModel['allowedJoinMethods'];
  allowedAuthMethods?: ICompetitionSettingModel['allowedAuthMethods'];
  allowedSolutionLanguages?: ICompetitionSettingModel['allowedSolutionLanguages'];
  allowAnyObservation?: ICompetitionSettingModel['allowAnyObservation'];
  useOnetimePassword?: ICompetitionSettingModel['useOnetimePassword'];
  joinPassword?: ICompetitionSettingModel['joinPassword'];
  externalRanklistUrl?: ICompetitionSettingModel['externalRanklistUrl'];
}
//#endregion

//#region service.updateCompetitionSetting
export interface IMCompetitionServiceUpdateCompetitionSettingOpt {
  frozenLength?: ICompetitionSettingModel['frozenLength'];
  allowedJoinMethods?: ICompetitionSettingModel['allowedJoinMethods'];
  allowedAuthMethods?: ICompetitionSettingModel['allowedAuthMethods'];
  allowedSolutionLanguages?: ICompetitionSettingModel['allowedSolutionLanguages'];
  allowAnyObservation?: ICompetitionSettingModel['allowAnyObservation'];
  useOnetimePassword?: ICompetitionSettingModel['useOnetimePassword'];
  joinPassword?: ICompetitionSettingModel['joinPassword'];
  externalRanklistUrl?: ICompetitionSettingModel['externalRanklistUrl'];
}

export type IMCompetitionServiceUpdateCompetitionSettingRes = boolean;
//#endregion

//#region service.createCompetitionNotification
export interface IMCompetitionServiceCreateCompetitionNotificationOpt {
  userId: ICompetitionNotificationModel['userId'];
  content: ICompetitionNotificationModel['content'];
}
//#endregion

//#region service.getCompetitionNotifications
export type IMCompetitionServiceGetCompetitionNotificationsRes = defModel.FullListModelRes<
  IMCompetitionNotificationDetail
>;
//#endregion

//#region service.getCompetitionQuestions
export interface IMCompetitionServicegetCompetitionQuestionsOpt {
  status?: ICompetitionQuestionModel['status'];
  userId?: ICompetitionQuestionModel['userId'];
  repliedUserId?: ICompetitionQuestionModel['repliedUserId'];
}
//#endregion

//#region service.createCompetitionQuestion
export interface IMCompetitionServiceCreateCompetitionQuestionOpt {
  userId: ICompetitionQuestionModel['userId'];
  content: ICompetitionQuestionModel['content'];
}
//#endregion

//#region service.updateCompetitionQuestion
export interface IMCompetitionServiceUpdateCompetitionQuestionOpt {
  status?: ICompetitionQuestionModel['status'];
  content?: ICompetitionQuestionModel['content'];
  reply?: ICompetitionQuestionModel['reply'];
  repliedUserId?: ICompetitionQuestionModel['repliedUserId'];
  repliedAt?: ICompetitionQuestionModel['repliedAt'];
}

export type IMCompetitionServiceUpdateCompetitionQuestionRes = boolean;
//#endregion
