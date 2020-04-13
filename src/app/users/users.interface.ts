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
  ratingHistory: string;
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

export interface IMUserServiceGetListOpts extends IServiceListOpts<TUserModelFields> {
  userId?: IUserModel['userId'];
  username?: IUserModel['username'];
  nickname?: IUserModel['nickname'];
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
}

export interface IMUserServiceCreateOpts {
  username: IUserModel['username'];
  nickname: IUserModel['nickname'];
  password: IUserModel['password'];
  email?: IUserModel['email'];
}

export interface IMUserServiceUpdateOpts {
  school?: IUserModel['school'];
  college?: IUserModel['college'];
  major?: IUserModel['major'];
  class?: IUserModel['class'];
  site?: IUserModel['site'];
}
