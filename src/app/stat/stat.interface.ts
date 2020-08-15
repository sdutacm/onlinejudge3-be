import { IUserModel } from '../user/user.interface';

export type IMStatRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export interface IMStatUserACRankPlain {
  count: number;
  rows: {
    userId: IUserModel['userId'];
    accepted: number;
  }[];
  truncated: number;
  startAt: string; // YYYY-MM-DD HH:mm:ss
  _updateEvery: number; // ms
  _updatedAt: number; // timestamp ms
}
export interface IMStatUserACRank {
  count: number;
  rows: {
    user: IMStatRelativeUser;
    accepted: number;
  }[];
  truncated: number;
  startAt: string; // YYYY-MM-DD HH:mm:ss
  _updateEvery: number; // ms
  _updatedAt: number; // timestamp ms
}

//#region service.getUserACRank
export type IMStatServiceGetUserACRankRes = IMStatUserACRank | null;
//#endregion
