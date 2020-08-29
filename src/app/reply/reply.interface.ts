import { IUserModel } from '../user/user.interface';
import { ITopicModel } from '../topic/topic.interface';

export interface IReplyModel {
  replyId: number;
  topicId: number;
  userId: number;
  content: string;
  createdAt: Date;
  deleted: boolean;
}

export type TReplyModelFields = keyof IReplyModel;

export type TMReplyLiteFields = Extract<
  TReplyModelFields,
  'replyId' | 'topicId' | 'userId' | 'content' | 'createdAt' | 'deleted'
>;

export type TMReplyDetailFields = Extract<
  TReplyModelFields,
  'replyId' | 'topicId' | 'userId' | 'content' | 'createdAt' | 'deleted'
>;

export type IMReplyRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export type IMReplyRelativeTopic = Pick<ITopicModel, 'topicId' | 'title' | 'replyCount'>;
export type IMReplyLitePlain = Pick<IReplyModel, TMReplyLiteFields>;
export type IMReplyLite = Omit<IMReplyLitePlain, 'topicId' | 'userId'> & {
  topic?: IMReplyRelativeTopic;
} & {
  user: IMReplyRelativeUser;
};
export type IMReplyDetailPlain = Pick<IReplyModel, TMReplyDetailFields>;
export type IMReplyDetail = Omit<IMReplyDetailPlain, 'topicId' | 'userId'> & {
  topic?: IMReplyRelativeTopic;
} & {
  user: IMReplyRelativeUser;
};
export type IMReplyListPagination = defService.ServiceListOpt<TReplyModelFields>;

//#region service.getList
export interface IMReplyServiceGetListOpt {
  replyId?: IReplyModel['replyId'];
  topicId?: IReplyModel['topicId'];
  userId?: IReplyModel['userId'];
}

export type IMReplyServiceGetListRes = defModel.ListModelRes<IMReplyLite>;
//#endregion

//#region service.getDetail
export type IMReplyServiceGetDetailRes = defModel.DetailModelRes<IMReplyDetail>;
//#endregion

//#region service.findOne
export type IMReplyServiceFindOneOpt = Partial<IReplyModel>;
export type IMReplyServiceFindOneRes = defModel.DetailModelRes<IMReplyDetailPlain>;
//#endregion

//#region service.isExists
export type IMReplyServiceIsExistsOpt = Partial<IReplyModel>;
//#endregion

//#region service.create
export interface IMReplyServiceCreateOpt {
  topicId: IReplyModel['topicId'];
  userId: IReplyModel['userId'];
  content: IReplyModel['content'];
  createdAt?: IReplyModel['createdAt'];
}

export type IMReplyServiceCreateRes = IReplyModel['replyId'];
//#endregion

//#region service.update
export interface IMReplyServiceUpdateOpt {
  topicId?: IReplyModel['topicId'];
  userId?: IReplyModel['userId'];
  content?: IReplyModel['content'];
  deleted?: IReplyModel['deleted'];
}

export type IMReplyServiceUpdateRes = boolean;
//#endregion

//#region service.countTopicReplies
export type IMReplyServiceCountTopicRepliesRes = number;
//#endregion
