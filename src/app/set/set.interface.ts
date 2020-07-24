import { IUserModel } from '../user/user.interface';
import { IProblemModel } from '../problem/problem.interface';

export interface ISetProps {
  sections: {
    title: string;
    description?: string;
    problems: {
      problemId: IProblemModel['problemId'];
      title?: IProblemModel['title'];
    }[];
  }[];
}

export interface ISetModel {
  setId: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  props: ISetProps;
  createdAt: Date;
  updatedAt: Date;
  hidden: boolean;
}

export type TSetModelFields = keyof ISetModel;

export type TMSetLiteFields = Extract<
  TSetModelFields,
  'setId' | 'userId' | 'title' | 'type' | 'createdAt' | 'updatedAt' | 'hidden'
>;

export type TMSetDetailFields = Extract<
  TSetModelFields,
  | 'setId'
  | 'userId'
  | 'title'
  | 'description'
  | 'type'
  | 'props'
  | 'createdAt'
  | 'updatedAt'
  | 'hidden'
>;

export type IMSetRelativeUser = Pick<
  IUserModel,
  'userId' | 'username' | 'nickname' | 'avatar' | 'bannerImage'
>;
export type IMSetLitePlain = Pick<ISetModel, TMSetLiteFields>;
export type IMSetLite = Omit<IMSetLitePlain, 'userId'> & {
  user?: IMSetRelativeUser;
};
export type IMSetDetailPlain = Pick<ISetModel, TMSetDetailFields>;
export type IMSetDetail = Omit<IMSetDetailPlain, 'userId'> & {
  user?: IMSetRelativeUser;
};
export type IMSetListPagination = defService.ServiceListOpt<TSetModelFields>;

//#region service.getList
export interface IMSetServiceGetListOpt {
  setId?: ISetModel['setId'];
  userId?: ISetModel['userId'];
  title?: ISetModel['title'];
  type?: ISetModel['type'];
}

export type IMSetServiceGetListRes = defModel.ListModelRes<IMSetLite>;
//#endregion

//#region service.getDetail
export type IMSetServiceGetDetailRes = defModel.DetailModelRes<IMSetDetail>;
//#endregion

//#region service.getRelative
export type IMSetServiceGetRelativeRes = Record<ISetModel['setId'], IMSetDetail>;
//#endregion

//#region service.findOne
export type IMSetServiceFindOneOpt = Partial<ISetModel>;
export type IMSetServiceFindOneRes = defModel.DetailModelRes<IMSetDetailPlain>;
//#endregion

//#region service.isExists
export type IMSetServiceIsExistsOpt = Partial<ISetModel>;
//#endregion

//#region service.create
export interface IMSetServiceCreateOpt {
  userId: ISetModel['userId'];
  title: ISetModel['title'];
  description: ISetModel['description'];
  type: ISetModel['type'];
  props: ISetModel['props'];
  hidden?: ISetModel['hidden'];
}

export type IMSetServiceCreateRes = ISetModel['setId'];
//#endregion

//#region service.update
export interface IMSetServiceUpdateOpt {
  userId?: ISetModel['userId'];
  title?: ISetModel['title'];
  description?: ISetModel['description'];
  type?: ISetModel['type'];
  props?: ISetModel['props'];
  hidden?: ISetModel['hidden'];
}

export type IMSetServiceUpdateRes = boolean;
//#endregion
