type IFavoriteTarget =
  | { problemId: number }
  | { contestId: number }
  | { setId: number }
  | { groupId: number };

export interface IFavoriteModel {
  favoriteId: number;
  userId: number;
  type: string;
  target: IFavoriteTarget | null;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export type TFavoriteModelFields = keyof IFavoriteModel;

export type TMFavoriteLiteFields = Extract<
  TFavoriteModelFields,
  'favoriteId' | 'userId' | 'type' | 'target' | 'note' | 'createdAt' | 'updatedAt' | 'deleted'
>;

export type TMFavoriteDetailFields = Extract<
  TFavoriteModelFields,
  'favoriteId' | 'userId' | 'type' | 'target' | 'note' | 'createdAt' | 'updatedAt' | 'deleted'
>;

export type IMFavoriteLite = Pick<IFavoriteModel, TMFavoriteLiteFields>;
export type IMFavoriteDetail = Pick<IFavoriteModel, TMFavoriteDetailFields>;
export type IMFavoriteListPagination = defService.ServiceListOpt<TFavoriteModelFields>;
export type IMFavoriteFullListPagination = defService.ServiceFullListOpt<TFavoriteModelFields>;

//#region service.getList
export interface IMFavoriteServiceGetListOpt {
  userId?: IFavoriteModel['userId'];
  type?: IFavoriteModel['type'];
  note?: IFavoriteModel['note'];
}

export type IMFavoriteServiceGetListRes = defModel.ListModelRes<IMFavoriteLite>;
//#endregion

//#region service.getDetail
export type IMFavoriteServiceGetDetailRes = defModel.DetailModelRes<IMFavoriteDetail>;
//#endregion

//#region service.findOne
export type IMFavoriteServiceFindOneOpt = Partial<IFavoriteModel>;
export type IMFavoriteServiceFindOneRes = defModel.DetailModelRes<IMFavoriteDetail>;
//#endregion

//#region service.isExists
export type IMFavoriteServiceIsExistsOpt = Partial<IFavoriteModel>;
//#endregion

//#region service.create
export interface IMFavoriteServiceCreateOpt {
  userId: IFavoriteModel['userId'];
  type: IFavoriteModel['type'];
  target: IFavoriteModel['target'];
  note: IFavoriteModel['note'];
}

export type IMFavoriteServiceCreateRes = IFavoriteModel['favoriteId'];
//#endregion

//#region service.update
export interface IMFavoriteServiceUpdateOpt {
  type?: IFavoriteModel['type'];
  target?: IFavoriteModel['target'];
  note?: IFavoriteModel['note'];
  deleted?: IFavoriteModel['deleted'];
}

export type IMFavoriteServiceUpdateRes = boolean;
//#endregion
