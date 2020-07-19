interface INoteTarget {
  problemId?: number;
  contestId?: number;
  solutionId?: number;
  url?: string;
  location?: any;
}

export interface INoteModel {
  noteId: number;
  userId: number;
  type: string;
  target: INoteTarget | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export type TNoteModelFields = keyof INoteModel;

export type TMNoteDetailFields = Extract<
  TNoteModelFields,
  'noteId' | 'userId' | 'type' | 'target' | 'content' | 'createdAt' | 'updatedAt' | 'deleted'
>;

export type IMNoteDetailPlain = Pick<INoteModel, TMNoteDetailFields>;
export type IMNoteDetailTypeProblem = Omit<IMNoteDetailPlain, 'type' | 'target'> & {
  type: 'problem';
  target: {
    problemId: number;
    title: string;
    contest?: {
      contestId: number;
      title: string;
      problemIndex: number;
    };
  };
};
export type IMNoteDetailTypeContest = Omit<IMNoteDetailPlain, 'type' | 'target'> & {
  type: 'contest';
  target: {
    contestId: number;
    title: string;
  };
};
export type IMNoteDetailTypeSolution = Omit<IMNoteDetailPlain, 'type' | 'target'> & {
  type: 'solution';
  target: {
    solutionId: number;
    result: number;
    problem: {
      problemId: number;
      title: string;
    };
    contest?: {
      contestId: number;
      title: string;
      problemIndex: number;
    };
  };
};
export type IMNoteDetailTypeGeneral = Omit<IMNoteDetailPlain, 'type' | 'target'> & {
  type: '';
  target: {
    url: string;
    location: {
      pathname: string;
      search: string;
      query: {
        [k: string]: string;
      };
      hash: string;
    };
  };
};

export type IMNoteDetail =
  | IMNoteDetailTypeProblem
  | IMNoteDetailTypeContest
  | IMNoteDetailTypeSolution
  | IMNoteDetailTypeGeneral;
export type IMNoteListPagination = defService.ServiceListOpt<TNoteModelFields>;
export type IMNoteFullListPagination = defService.ServiceFullListOpt<TNoteModelFields>;

//#region service.getFullList
export interface IMNoteServiceGetFullListOpt {
  userId?: INoteModel['userId'];
  type?: INoteModel['type'];
  content?: INoteModel['content'];
}

export type IMNoteServiceGetFullListRes = defModel.ListModelRes<IMNoteDetail>;
//#endregion

//#region service.getDetail
export type IMNoteServiceGetDetailRes = defModel.DetailModelRes<IMNoteDetail>;
//#endregion

//#region service.findOne
export type IMNoteServiceFindOneOpt = Partial<INoteModel>;
export type IMNoteServiceFindOneRes = defModel.DetailModelRes<IMNoteDetail>;
//#endregion

//#region service.isExists
export type IMNoteServiceIsExistsOpt = Partial<INoteModel>;
//#endregion

//#region service.create
export interface IMNoteServiceCreateOpt {
  userId: INoteModel['userId'];
  type: INoteModel['type'];
  target: INoteModel['target'];
  content: INoteModel['content'];
}

export type IMNoteServiceCreateRes = INoteModel['noteId'];
//#endregion

//#region service.update
export interface IMNoteServiceUpdateOpt {
  type?: INoteModel['type'];
  target?: INoteModel['target'];
  content?: INoteModel['content'];
  deleted?: INoteModel['deleted'];
}

export type IMNoteServiceUpdateRes = boolean;
//#endregion
