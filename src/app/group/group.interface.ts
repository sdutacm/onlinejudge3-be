import { EGroupJoinChannel, EGroupMemberPermission, EGroupMemberStatus } from '@/common/enums';

//#region contest model
export interface IGroupModel {
  groupId: number;
  name: string;
  avatar: string;
  intro: string;
  verified: boolean;
  private: boolean;
  joinChannel: EGroupJoinChannel;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export type TGroupModelFields = keyof IGroupModel;

export type TMGroupLiteFields = Extract<
  TGroupModelFields,
  | 'groupId'
  | 'name'
  | 'avatar'
  | 'intro'
  | 'verified'
  | 'private'
  | 'joinChannel'
  | 'membersCount'
  | 'createdAt'
  | 'updatedAt'
  | 'deleted'
>;

export type TMGroupDetailFields = Extract<
  TGroupModelFields,
  | 'groupId'
  | 'name'
  | 'avatar'
  | 'intro'
  | 'verified'
  | 'private'
  | 'joinChannel'
  | 'membersCount'
  | 'createdAt'
  | 'updatedAt'
  | 'deleted'
>;

export type IMGroupLite = Pick<IGroupModel, TMGroupLiteFields>;
export type IMGroupDetail = Pick<IGroupModel, TMGroupDetailFields>;
export type IMGroupListPagination = defService.ServiceListOpt<TGroupModelFields>;
//#endregion

//#region group member model
export interface IGroupMemberModel {
  groupMemberId: number;
  groupId: number;
  userId: number;
  permission: EGroupMemberPermission;
  status: EGroupMemberStatus;
  joinedAt: Date;
}

export type TGroupMemberModelFields = keyof IGroupMemberModel;

export type TMGroupMemberLiteFields = Extract<
  TGroupMemberModelFields,
  'groupMemberId' | 'groupId' | 'userId' | 'permission' | 'status' | 'joinedAt'
>;

export type TMGroupMemberDetailFields = Extract<
  TGroupMemberModelFields,
  'groupMemberId' | 'groupId' | 'userId' | 'permission' | 'status' | 'joinedAt'
>;
//#endregion
