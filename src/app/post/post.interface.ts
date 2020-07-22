import { IUserModel } from '../user/user.interface';

export interface IPostModel {
  postId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
  display: boolean;
}

export type TPostModelFields = keyof IPostModel;

export type TMPostLiteFields = Extract<
  TPostModelFields,
  'postId' | 'userId' | 'title' | 'createdAt' | 'display'
>;

export type TMPostDetailFields = Extract<
  TPostModelFields,
  'postId' | 'userId' | 'title' | 'content' | 'createdAt' | 'display'
>;

export type IMPostRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export type IMPostLitePlain = Pick<IPostModel, TMPostLiteFields>;
export type IMPostLite = Omit<IMPostLitePlain, 'userId'> & {
  user?: IMPostRelativeUser;
};
export type IMPostDetailPlain = Pick<IPostModel, TMPostDetailFields>;
export type IMPostDetail = Omit<IMPostDetailPlain, 'userId'> & {
  user?: IMPostRelativeUser;
};
export type IMPostListPagination = defService.ServiceListOpt<TPostModelFields>;

//#region service.getList
export interface IMPostServiceGetListOpt {
  postId?: IPostModel['postId'];
  userId?: IPostModel['userId'];
  title?: IPostModel['title'];
}

export type IMPostServiceGetListRes = defModel.ListModelRes<IMPostLite>;
//#endregion

//#region service.getDetail
export type IMPostServiceGetDetailRes = defModel.DetailModelRes<IMPostDetail>;
//#endregion

//#region service.findOne
export type IMPostServiceFindOneOpt = Partial<IPostModel>;
export type IMPostServiceFindOneRes = defModel.DetailModelRes<IMPostDetailPlain>;
//#endregion

//#region service.isExists
export type IMPostServiceIsExistsOpt = Partial<IPostModel>;
//#endregion

//#region service.create
export interface IMPostServiceCreateOpt {
  userId: IPostModel['userId'];
  title: IPostModel['title'];
  content: IPostModel['content'];
  display?: IPostModel['display'];
}

export type IMPostServiceCreateRes = IPostModel['postId'];
//#endregion

//#region service.update
export interface IMPostServiceUpdateOpt {
  userId?: IPostModel['userId'];
  title?: IPostModel['title'];
  content?: IPostModel['content'];
  display?: IPostModel['display'];
}

export type IMPostServiceUpdateRes = boolean;
//#endregion
