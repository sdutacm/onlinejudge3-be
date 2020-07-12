import { IUserModel } from '../user/user.interface';

export interface IMessageModel {
  messageId: number;
  fromUserId: number;
  toUserId: number;
  title: string;
  content: string;
  read: boolean;
  anonymous: boolean;
  createdAt: Date | null;
}

export type TMessageModelFields = keyof IMessageModel;

export type TMMessageLiteFields = Extract<
  TMessageModelFields,
  'messageId' | 'fromUserId' | 'toUserId' | 'title' | 'content' | 'read' | 'anonymous' | 'createdAt'
>;

export type TMMessageDetailFields = Extract<
  TMessageModelFields,
  'messageId' | 'fromUserId' | 'toUserId' | 'title' | 'content' | 'read' | 'anonymous' | 'createdAt'
>;

export type IMMessageRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export type IMMessageLitePlain = Pick<IMessageModel, TMMessageLiteFields>;
export type IMMessageLite = Omit<
  Pick<IMessageModel, TMMessageLiteFields>,
  'fromUserId' | 'toUserId'
> & {
  from?: IMMessageRelativeUser;
} & {
  to: IMMessageRelativeUser;
};
export type IMMessageDetailPlain = Pick<IMessageModel, TMMessageDetailFields>;
export type IMMessageDetail = Omit<
  Pick<IMessageModel, TMMessageDetailFields>,
  'fromUserId' | 'toUserId'
> & {
  from?: IMMessageRelativeUser;
} & {
  to: IMMessageRelativeUser;
};
export type IMMessageListPagination = defService.ServiceListOpt<TMessageModelFields>;
export type IMMessageFullListPagination = defService.ServiceFullListOpt<TMessageModelFields>;

//#region service.getList
export interface IMMessageServiceGetListOpt {
  fromUserId?: IMessageModel['fromUserId'];
  toUserId?: IMessageModel['toUserId'];
  read?: IMessageModel['read'];
}

export type IMMessageServiceGetListRes = defModel.ListModelRes<IMMessageLite>;
//#endregion

//#region service.getDetail
export type IMMessageServiceGetDetailRes = defModel.DetailModelRes<IMMessageDetail>;
//#endregion
