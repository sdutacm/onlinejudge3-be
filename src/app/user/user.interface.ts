import { IContestModel } from '../contest/contest.interface';
import { ICompetitionModel } from '../competition/competition.interface';
import { EUserAchievementStatus, EUserMemberStatus, EUserType, EUserStatus } from '@/common/enums';

export interface IUserModelRatingHistoryItem {
  contest?: {
    contestId: IContestModel['contestId'];
    title: string;
  };
  competition?: {
    competitionId: ICompetitionModel['competitionId'];
    title: string;
  };
  rank: number;
  rating: number;
  ratingChange: number;
  date: string; // YYYY-MM-DD
}

export type IUserModelRatingHistory = IUserModelRatingHistoryItem[];

interface IUserSettings {}

export interface IUserModel {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  verified: boolean;
  password: string;
  school: string;
  createdAt: Date;
  submitted: number;
  accepted: number;
  defaultLanguage: string;
  lastIp: string;
  lastTime: Date | null;
  permission: number;
  forbidden: number;
  avatar: string | null;
  college: string;
  major: string;
  grade: string;
  class: string;
  site: string;
  bannerImage: string;
  settings: IUserSettings | null;
  coin: number;
  rating: number;
  ratingHistory: IUserModelRatingHistory | null;
  type: EUserType;
  status: EUserStatus;
}

export type TUserModelFields = keyof IUserModel;

export interface IUserAchievementModel {
  userAchievementId: number;
  userId: number;
  achievementKey: string;
  status: EUserAchievementStatus;
  createdAt: Date;
}

export type TUserAchievementModelFields = keyof IUserAchievementModel;

export type IMUserAchievementDetail = Pick<IUserAchievementModel, TUserAchievementModelFields>;

export type TMUserLiteFields = Extract<
  TUserModelFields,
  | 'userId'
  | 'username'
  | 'nickname'
  | 'avatar'
  | 'bannerImage'
  | 'rating'
  | 'accepted'
  | 'submitted'
  | 'grade'
  | 'forbidden'
  | 'permission'
  | 'verified'
  | 'type'
  | 'status'
  | 'lastIp'
  | 'lastTime'
  | 'createdAt'
>;

export type TMUserDetailFields = Extract<
  TUserModelFields,
  | 'userId'
  | 'username'
  | 'nickname'
  | 'permission'
  | 'email'
  | 'avatar'
  | 'bannerImage'
  | 'school'
  | 'college'
  | 'major'
  | 'class'
  | 'grade'
  | 'forbidden'
  | 'accepted'
  | 'submitted'
  | 'rating'
  | 'ratingHistory'
  | 'site'
  | 'defaultLanguage'
  | 'settings'
  | 'coin'
  | 'verified'
  | 'type'
  | 'status'
  | 'lastIp'
  | 'lastTime'
  | 'createdAt'
>;

export type IMUserLite = Pick<IUserModel, TMUserLiteFields>;
export type IMUserDetail = Pick<IUserModel, TMUserDetailFields>;
export type IMUserListPagination = defService.ServiceListOpt<TUserModelFields>;
export type IMUserFullListPagination = defService.ServiceFullListOpt<TUserModelFields>;

// export interface IUserDetail {
//   userId: IUserModel['userId'];
//   username: IUserModel['username'];
//   nickname: IUserModel['nickname'];
//   permission: IUserModel['permission'];
// }

export interface IUserMemberLite {
  userId: IUserModel['userId']; // memberUserId
  status: EUserMemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserMemberDetail = IUserMemberLite & {
  username: IUserModel['username'];
  nickname: IUserModel['nickname'];
  avatar: IUserModel['avatar'];
  bannerImage: IUserModel['bannerImage'];
  accepted: IUserModel['accepted'];
  submitted: IUserModel['submitted'];
  rating: IUserModel['rating'];
  verified: IUserModel['verified'];
};

//#region service.getList
export interface IMUserServiceGetListOpt {
  userId?: IUserModel['userId'];
  username?: IUserModel['username'];
  nickname?: IUserModel['nickname'];
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
  grade?: IUserModel['grade'];
  forbidden?: IUserModel['forbidden'];
  permission?: IUserModel['permission'];
  verified?: IUserModel['verified'];
  type?: IUserModel['type'];
  status?: IUserModel['status'];
}

export type IMUserServiceGetListRes = defModel.ListModelRes<IMUserLite>;
//#endregion

//#region service.getDetail
export type IMUserServiceGetDetailRes = defModel.DetailModelRes<IMUserDetail>;
//#endregion

//#region service.getRelative
export type IMUserServiceGetRelativeRes = Record<IUserModel['userId'], IMUserDetail>;
//#endregion

//#region service.findOne
export type IMUserServiceFindOneOpt = Partial<IUserModel>;
export type IMUserServiceFindOneRes = defModel.DetailModelRes<IMUserDetail>;
//#endregion

//#region service.isExists
export type IMUserServiceIsExistsOpt = Partial<IUserModel>;
//#endregion

//#region service.create
export interface IMUserServiceCreateOpt {
  username: IUserModel['username'];
  nickname: IUserModel['nickname'];
  password: IUserModel['password'];
  email: IUserModel['email'];
  verified: IUserModel['verified'];
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
  grade?: IUserModel['grade'];
  type?: IUserModel['type'];
}

export type IMUserServiceCreateRes = IUserModel['userId'];
//#endregion

//#region service.update
export interface IMUserServiceUpdateOpt {
  nickname?: IUserModel['nickname'];
  verified?: IUserModel['verified'];
  password?: IUserModel['password'];
  email?: IUserModel['email'];
  permission?: IUserModel['permission'];
  avatar?: IUserModel['avatar'];
  bannerImage?: IUserModel['bannerImage'];
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
  grade?: IUserModel['grade'];
  site?: IUserModel['site'];
  accepted?: IUserModel['accepted'];
  submitted?: IUserModel['submitted'];
  rating?: IUserModel['rating'];
  ratingHistory?: IUserModel['ratingHistory'];
  forbidden?: IUserModel['forbidden'];
  lastIp?: IUserModel['lastIp'];
  lastTime?: IUserModel['lastTime'];
  status?: IUserModel['status'];
}

export type IMUserServiceUpdateRes = boolean;
//#endregion

//#region service.getUserIdsByUsernames
export type IMUserServiceGetUserIdsByUsernamesRes = Record<
  IUserModel['username'],
  IUserModel['userId']
>;
//#endregion

//#region service.updateUserLastStatus
export interface IMUserServiceUpdateUserLastStatusOpt {
  lastIp: IUserModel['lastIp'];
}
//#endregion

//#region service.getUserAcceptedAndSubmittedCount
export type IMUserServiceGetUserAcceptedAndSubmittedCountRes = {
  accepted: IUserModel['accepted'];
  submitted: IUserModel['submitted'];
} | null;
//#endregion
