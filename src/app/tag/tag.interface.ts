import { IProblemModel } from '../problem/problem.interface';

export interface ITagModel {
  tagId: number;
  nameEn: string;
  nameZhHans: string;
  nameZhHant: string;
  hidden: boolean;
  createdAt: Date;
}

export type TTagModelFields = keyof ITagModel;

export type TMTagDetailFields = Extract<
  TTagModelFields,
  'tagId' | 'nameEn' | 'nameZhHans' | 'nameZhHant' | 'hidden' | 'createdAt'
>;

export type IMTagDetail = Pick<ITagModel, TMTagDetailFields>;
export type IMTagFullListPagination = defService.ServiceFullListOpt<TTagModelFields>;

//#region service.getFullList
export interface IMTagServiceGetFullListOpt {}
export type IMTagServiceGetFullListRes = defModel.FullListModelRes<IMTagDetail>;
//#endregion

//#region service.getDetail
export type IMTagServiceGetDetailRes = defModel.DetailModelRes<IMTagDetail>;
//#endregion

//#region service.create
export interface IMTagServiceCreateOpt {
  nameEn: ITagModel['nameEn'];
  nameZhHans: ITagModel['nameZhHans'];
  nameZhHant: ITagModel['nameZhHant'];
  hidden?: ITagModel['hidden'];
}

export type IMTagServiceCreateRes = ITagModel['tagId'];
//#endregion

//#region service.update
export interface IMTagServiceUpdateOpt {
  nameEn?: ITagModel['nameEn'];
  nameZhHans?: ITagModel['nameZhHans'];
  nameZhHant?: ITagModel['nameZhHant'];
  hidden?: ITagModel['hidden'];
}

export type IMTagServiceUpdateRes = boolean;
//#endregion

//#region service.getRelativeProblemIds
export type IMTagServiceGetRelativeProblemIdsRes = IProblemModel['problemId'][];
//#endregion
