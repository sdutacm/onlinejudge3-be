export interface IFieldSeatingArrangement {
  seatMap: {
    row: number;
    col: number;
    arrangement: (number | null)[][];
  };
  seats: {
    seatNo: number;
    boundIp?: string;
    disabled?: boolean;
  }[];
}

export interface IFieldModel {
  fieldId: number;
  name: string;
  shortName: string;
  seatingArrangement: IFieldSeatingArrangement | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TFieldModelFields = keyof IFieldModel;

export type TMFieldLiteFields = Extract<
  TFieldModelFields,
  'fieldId' | 'name' | 'shortName' | 'createdAt' | 'updatedAt'
>;

export type TMFieldDetailFields = Extract<
  TFieldModelFields,
  'fieldId' | 'name' | 'shortName' | 'seatingArrangement' | 'createdAt' | 'updatedAt'
>;

export type IMFieldLitePlain = Pick<IFieldModel, TMFieldLiteFields>;
export type IMFieldLite = IMFieldLitePlain;
export type IMFieldDetailPlain = Pick<IFieldModel, TMFieldDetailFields>;
export type IMFieldDetail = IMFieldDetailPlain;
export type IMFieldListPagination = defService.ServiceListOpt<TFieldModelFields>;

//#region service.getList
export interface IMFieldServiceGetListOpt {
  fieldId?: IFieldModel['fieldId'];
  name?: IFieldModel['name'];
  shortName?: IFieldModel['shortName'];
}

export type IMFieldServiceGetListRes = defModel.ListModelRes<IMFieldLite>;
//#endregion

//#region service.getDetail
export type IMFieldServiceGetDetailRes = defModel.DetailModelRes<IMFieldDetail>;
//#endregion

//#region service.findOne
export type IMFieldServiceFindOneOpt = Partial<IFieldModel>;
export type IMFieldServiceFindOneRes = defModel.DetailModelRes<IMFieldDetailPlain>;
//#endregion

//#region service.isExists
export type IMFieldServiceIsExistsOpt = Partial<IFieldModel>;
//#endregion

//#region service.create
export interface IMFieldServiceCreateOpt {
  name: IFieldModel['name'];
  shortName: IFieldModel['shortName'];
}

export type IMFieldServiceCreateRes = IFieldModel['fieldId'];
//#endregion

//#region service.update
export interface IMFieldServiceUpdateOpt {
  name?: IFieldModel['name'];
  shortName?: IFieldModel['shortName'];
  seatingArrangement?: IFieldModel['seatingArrangement'];
  deleted?: IFieldModel['deleted'];
}

export type IMFieldServiceUpdateRes = boolean;
//#endregion
