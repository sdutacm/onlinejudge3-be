interface IUserModelRatingHistoryItem {
  contest: {
    contestId: number;
    title: string;
  };
  rank: number;
  rating: number;
  ratingChange: number;
  date: string;
}

type IUserModelRatingHistory = IUserModelRatingHistoryItem[];

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
  | 'accepted'
  | 'submitted'
  | 'rating'
  | 'ratingHistory'
  | 'defaultLanguage'
  | 'settings'
  | 'coin'
  | 'verified'
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

// #region service.getList
export interface IMUserServiceGetListOpt {
  userId?: IUserModel['userId'];
  username?: IUserModel['username'];
  nickname?: IUserModel['nickname'];
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
  grade?: IUserModel['grade'];
}

export type IMUserServiceGetListRes = defModel.ListModelRes<IMUserLite>;
// #endregion

// #region service.getDetail
export type IMUserServiceGetDetailRes = defModel.DetailModelRes<IMUserDetail>;
// #endregion

// #region service.getRelative
export type IMUserServiceGetRelativeRes = Record<IUserModel['userId'], IMUserDetail>;
// #endregion

// #region service.findOne
export type IMUserServiceFindOneOpt = Partial<IUserModel>;
export type IMUserServiceFindOneRes = defModel.DetailModelRes<IMUserDetail>;
// #endregion

// #region service.isExists
export type IMUserServiceIsExistsOpt = Partial<IUserModel>;
// #endregion

// #region service.create
export interface IMUserServiceCreateOpt {
  username: IUserModel['username'];
  nickname: IUserModel['nickname'];
  password: IUserModel['password'];
  email: IUserModel['email'];
  verified: IUserModel['verified'];
}

export type IMUserServiceCreateRes = IUserModel['userId'];
// #endregion

// #region service.update
export interface IMUserServiceUpdateOpt {
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
// #endregion
