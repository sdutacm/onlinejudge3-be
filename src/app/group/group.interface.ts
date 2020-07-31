import { EGroupJoinChannel, EGroupMemberPermission, EGroupMemberStatus } from '@/common/enums';
import { IUserModel } from '../user/user.interface';

//#region group model
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

export type IMGroupMemberRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export type IMGroupMemberDetailPlain = Pick<IGroupMemberModel, TMGroupMemberDetailFields>;
export type IMGroupMemberDetail = Omit<IMGroupMemberDetailPlain, 'userId'> & {
  user: IMGroupMemberRelativeUser;
};
//#endregion

//#region service.getList
export interface IMGroupServiceGetListOpt {
  groupId?: IGroupModel['groupId'];
  name?: IGroupModel['name'];
  verified?: IGroupModel['verified'];
  private?: IGroupModel['private'];
}

export type IMGroupServiceGetListRes = defModel.ListModelRes<IMGroupLite>;
//#endregion

//#region service.getDetail
export type IMGroupServiceGetDetailRes = defModel.DetailModelRes<IMGroupDetail>;
//#endregion

//#region service.getRelative
export type IMGroupServiceGetRelativeRes = Record<IGroupModel['groupId'], IMGroupDetail>;
//#endregion

//#region service.findOne
export type IMGroupServiceFindOneOpt = Partial<IGroupModel>;
export type IMGroupServiceFindOneRes = defModel.DetailModelRes<IMGroupDetail>;
//#endregion

//#region service.isExists
export type IMGroupServiceIsExistsOpt = Partial<IGroupModel>;
//#endregion

//#region service.create
export interface IMGroupServiceCreateOpt {
  name: IGroupModel['name'];
  avatar?: IGroupModel['avatar'];
  intro: IGroupModel['intro'];
  verified?: IGroupModel['verified'];
  private: IGroupModel['private'];
  joinChannel: IGroupModel['joinChannel'];
}

export type IMGroupServiceCreateRes = IGroupModel['groupId'];
//#endregion

//#region service.update
export interface IMGroupServiceUpdateOpt {
  name?: IGroupModel['name'];
  avatar?: IGroupModel['avatar'];
  intro: IGroupModel['intro'];
  verified?: IGroupModel['verified'];
  private?: IGroupModel['private'];
  joinChannel?: IGroupModel['joinChannel'];
  membersCount?: IGroupModel['membersCount'];
  deleted?: IGroupModel['deleted'];
}

export type IMGroupServiceUpdateRes = boolean;
//#endregion

//#region service.getGroupMemberList
export type IMGroupServiceGetGroupMemberListRes = defModel.ListModelRes<IMGroupMemberDetail>;
//#endregion

//#region service.getUserGroups
export type IMGroupServiceGetUserGroupsRes = defModel.ListModelRes<IMGroupDetail>;
//#endregion

//#region service.findOneGroupMember
export type IMGroupServiceFindOneGroupMemberOpt = Partial<IGroupMemberModel>;
export type IMGroupServiceFindOneGroupMemberRes = defModel.DetailModelRes<IMGroupMemberDetail>;
//#endregion

//#region service.isGroupMemberExists
export type IMGroupServiceIsGroupMemberExistsOpt = Partial<IGroupMemberModel>;
//#endregion

//#region service.batchCreateGroupMember
export type IMGroupServiceBatchCreateGroupMemberOpt = Array<{
  userId: IGroupMemberModel['userId'];
  permission?: IGroupMemberModel['permission'];
  status?: IGroupMemberModel['status'];
}>;
//#endregion

//#region service.updateGroupMember
export interface IMGroupServiceUpdateGroupMemberOpt {
  permission?: IGroupMemberModel['permission'];
  status?: IGroupMemberModel['status'];
}

export type IMGroupServiceUpdateGroupMemberRes = boolean;
//#endregion

//#region service.deleteGroupMember
export type IMGroupServiceDeleteGroupMemberRes = boolean;
//#endregion

//#region service.deleteAllGroupMembers
export type IMGroupServiceDeleteAllGroupMembersRes = number;
//#endregion
