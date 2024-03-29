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

export type TMFavoriteDetailFields = Extract<
  TFavoriteModelFields,
  'favoriteId' | 'userId' | 'type' | 'target' | 'note' | 'createdAt' | 'updatedAt' | 'deleted'
>;

export type IMFavoriteDetailPlain = Pick<IFavoriteModel, TMFavoriteDetailFields>;
export type IMFavoriteDetailTypeProblem = Omit<IMFavoriteDetailPlain, 'type' | 'target'> & {
  type: 'problem';
  target: {
    problemId: number;
    title: string;
  };
};
export type IMFavoriteDetailTypeContest = Omit<IMFavoriteDetailPlain, 'type' | 'target'> & {
  type: 'contest';
  target: {
    contestId: number;
    title: string;
  };
};
export type IMFavoriteDetailTypeSet = Omit<IMFavoriteDetailPlain, 'type' | 'target'> & {
  type: 'set';
  target: {
    setId: number;
    title: string;
  };
};
export type IMFavoriteDetailTypeGroup = Omit<IMFavoriteDetailPlain, 'type' | 'target'> & {
  type: 'group';
  target: {
    groupId: number;
    title: string;
    name: string;
    verified: boolean;
  };
};

export type IMFavoriteDetail =
  | IMFavoriteDetailTypeProblem
  | IMFavoriteDetailTypeContest
  | IMFavoriteDetailTypeSet
  | IMFavoriteDetailTypeGroup;
export type IMFavoriteListPagination = defService.ServiceListOpt<TFavoriteModelFields>;
export type IMFavoriteFullListPagination = defService.ServiceFullListOpt<TFavoriteModelFields>;

//#region service.getFullList
export interface IMFavoriteServiceGetFullListOpt {
  userId?: IFavoriteModel['userId'];
  type?: IFavoriteModel['type'];
  note?: IFavoriteModel['note'];
}

export type IMFavoriteServiceGetFullListRes = defModel.ListModelRes<IMFavoriteDetail>;
//#endregion

//#region service.getDetail
export type IMFavoriteServiceGetDetailRes = defModel.DetailModelRes<IMFavoriteDetail>;
//#endregion

//#region service.findOne
export type IMFavoriteServiceFindOneOpt = Partial<IFavoriteModel>;
export type IMFavoriteServiceFindOneRes = defModel.DetailModelRes<IMFavoriteDetailPlain>;
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
