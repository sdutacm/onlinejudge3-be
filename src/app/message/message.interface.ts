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

export type IMMessageLite = Pick<IMessageModel, TMMessageLiteFields>;
export type IMMessageDetail = Pick<IMessageModel, TMMessageDetailFields>;
export type IMMessageListPagination = defService.ServiceListOpt<TMessageModelFields>;
export type IMMessageFullListPagination = defService.ServiceFullListOpt<TMessageModelFields>;
