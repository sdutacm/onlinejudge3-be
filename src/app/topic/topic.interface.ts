import { IUserModel } from '../user/user.interface';
import { IProblemModel } from '../problem/problem.interface';

export interface ITopicModel {
  topicId: number;
  userId: number;
  problemId: number;
  title: string;
  content: string;
  replyCount: number;
  createdAt: Date;
  lastTime: Date;
  lastUserId: number;
  deleted: boolean;
}

export type TTopicModelFields = keyof ITopicModel;

export type TMTopicLiteFields = Extract<
  TTopicModelFields,
  | 'topicId'
  | 'userId'
  | 'problemId'
  | 'title'
  | 'replyCount'
  | 'createdAt'
  // | 'lastTime'
  // | 'lastUserId'
  | 'deleted'
>;

export type TMTopicDetailFields = Extract<
  TTopicModelFields,
  | 'topicId'
  | 'userId'
  | 'problemId'
  | 'title'
  | 'content'
  | 'replyCount'
  | 'createdAt'
  // | 'lastTime'
  // | 'lastUserId'
  | 'deleted'
>;

export type IMTopicRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export type IMTopicRelativeProblem = Pick<IProblemModel, 'problemId' | 'title'>;
export type IMTopicLitePlain = Pick<ITopicModel, TMTopicLiteFields>;
export type IMTopicLite = Omit<IMTopicLitePlain, 'userId' | 'problemId'> & {
  user: IMTopicRelativeUser;
} & {
  problem?: IMTopicRelativeProblem;
};
export type IMTopicDetailPlain = Pick<ITopicModel, TMTopicDetailFields>;
export type IMTopicDetail = Omit<IMTopicDetailPlain, 'userId' | 'problemId'> & {
  user: IMTopicRelativeUser;
} & {
  problem?: IMTopicRelativeProblem;
};
export type IMTopicListPagination = defService.ServiceListOpt<TTopicModelFields>;

//#region service.getList
export interface IMTopicServiceGetListOpt {
  topicId?: ITopicModel['topicId'];
  userId?: ITopicModel['userId'];
  problemId?: ITopicModel['problemId'];
  title?: ITopicModel['title'];
}

export type IMTopicServiceGetListRes = defModel.ListModelRes<IMTopicLite>;
//#endregion

//#region service.getDetail
export type IMTopicServiceGetDetailRes = defModel.DetailModelRes<IMTopicDetail>;
//#endregion

//#region service.getRelative
export type IMTopicServiceGetRelativeRes = Record<ITopicModel['topicId'], IMTopicDetail>;
//#endregion

//#region service.findOne
export type IMTopicServiceFindOneOpt = Partial<ITopicModel>;
export type IMTopicServiceFindOneRes = defModel.DetailModelRes<IMTopicDetailPlain>;
//#endregion

//#region service.isExists
export type IMTopicServiceIsExistsOpt = Partial<ITopicModel>;
//#endregion

//#region service.create
export interface IMTopicServiceCreateOpt {
  userId: ITopicModel['userId'];
  problemId?: ITopicModel['problemId'];
  title: ITopicModel['title'];
  content: ITopicModel['content'];
}

export type IMTopicServiceCreateRes = ITopicModel['topicId'];
//#endregion

//#region service.update
export interface IMTopicServiceUpdateOpt {
  userId?: ITopicModel['userId'];
  problemId?: ITopicModel['problemId'];
  title?: ITopicModel['title'];
  content?: ITopicModel['content'];
  replyCount?: ITopicModel['replyCount'];
  lastTime?: ITopicModel['lastTime'];
  lastUserId?: ITopicModel['lastUserId'];
  deleted?: ITopicModel['deleted'];
}

export type IMTopicServiceUpdateRes = boolean;
//#endregion
