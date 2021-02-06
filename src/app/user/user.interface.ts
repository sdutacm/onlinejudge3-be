import { IContestModel } from '../contest/contest.interface';
import { EPerm } from '@/common/configs/perm.config';

export interface IUserModelRatingHistoryItem {
  contest: {
    contestId: IContestModel['contestId'];
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
}

export type TUserModelFields = keyof IUserModel;

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
  | 'lastIp'
  | 'lastTime'
  | 'createdAt'
>;

export type IMUserLite = Pick<IUserModel, TMUserLiteFields>;
export type IMUserDetail = Pick<IUserModel, TMUserDetailFields>;
export type IMUserListPagination = defService.ServiceListOpt<TUserModelFields>;
export type IMUserFullListPagination = defService.ServiceFullListOpt<TUserModelFields>;

export interface IUserPermissionModel {
  userId: number;
  permission: EPerm;
}

export type TUserPermissionModelFields = keyof IUserPermissionModel;

export type TMUserPermissionFields = Extract<TUserPermissionModelFields, 'permission'>;

export type IMUserPermission = Pick<IUserPermissionModel, TMUserPermissionFields>;

// export interface IUserDetail {
//   userId: IUserModel['userId'];
//   username: IUserModel['username'];
//   nickname: IUserModel['nickname'];
//   permission: IUserModel['permission'];
// }

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

//#region service.getUserPermissions
export type IMUserServiceGetUserPermissionsRes = IUserPermissionModel['permission'][];
//#endregion
