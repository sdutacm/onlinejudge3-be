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
  settings: string;
  coin: number;
  rating: number;
  ratingHistory: IUserModelRatingHistory | null;
}

export type TUserModelFields = keyof IUserModel;

export type TMUserLiteFields = Extract<
  TUserModelFields,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage' | 'rating'
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
  | 'accepted'
  | 'submitted'
  | 'rating'
  | 'ratingHistory'
  | 'createdAt'
>;

export type IMUserLite = Pick<IUserModel, TMUserLiteFields>;
export type IMUserDetail = Pick<IUserModel, TMUserDetailFields>;

// export interface IUserDetail {
//   userId: IUserModel['userId'];
//   username: IUserModel['username'];
//   nickname: IUserModel['nickname'];
//   permission: IUserModel['permission'];
// }

// #region service.getList
export interface IMUserServiceGetListOpt extends IServiceListOpt<TUserModelFields> {
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

// #region service.create
export interface IMUserServiceCreateOpt {
  username: IUserModel['username'];
  nickname: IUserModel['nickname'];
  password: IUserModel['password'];
  email?: IUserModel['email'];
}

export type IMUserServiceCreateRes = IUserModel['userId'];
// #endregion

// #region service.update
export interface IMUserServiceUpdateOpt {
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
  site?: IUserModel['site'];
}

export type IMUserServiceUpdateRes = boolean;
// #endregion
