import { ITagModel } from '../tag/tag.interface';

export interface IProblemModel {
  problemId: number;
  title: string;
  description: string;
  input: string;
  output: string;
  /** @deprecated */
  sampleInput: string;
  /** @deprecated */
  sampleOutput: string;
  samples: {
    in: string;
    out: string;
  }[];
  hint: string;
  source: string;
  /** @deprecated */
  author: number | null;
  /** Authors. */
  authors: string[];
  timeLimit: number;
  memoryLimit: number;
  accepted: number;
  submitted: number;
  display: boolean;
  spj: boolean;
  difficulty: number;
  spConfig: any;
  createdAt: Date;
  updatedAt: Date | null;
}

export type TProblemModelFields = keyof IProblemModel;

export type TMProblemLiteFields = Extract<
  TProblemModelFields,
  | 'problemId'
  | 'title'
  | 'source'
  | 'authors'
  | 'difficulty'
  | 'createdAt'
  | 'updatedAt'
  | 'accepted'
  | 'submitted'
  | 'display'
>;

export type TMProblemDetailFields = Extract<
  TProblemModelFields,
  | 'problemId'
  | 'title'
  | 'description'
  | 'input'
  | 'output'
  | 'samples'
  | 'hint'
  | 'source'
  | 'authors'
  | 'timeLimit'
  | 'memoryLimit'
  | 'difficulty'
  | 'createdAt'
  | 'updatedAt'
  | 'accepted'
  | 'submitted'
  | 'spj'
  | 'display'
  | 'spConfig'
>;

export type IMProblemLite = Pick<IProblemModel, TMProblemLiteFields> & {
  tags: ITagModel[];
};
export type IMProblemDetail = Pick<IProblemModel, TMProblemDetailFields> & {
  tags: ITagModel[];
};
export type IMProblemListPagination = defService.ServiceListOpt<TProblemModelFields>;
export type IMProblemFullListPagination = defService.ServiceFullListOpt<TProblemModelFields>;

//#region service.getList
export interface IMProblemServiceGetListOpt {
  problemId?: IProblemModel['problemId'];
  problemIds?: Array<IProblemModel['problemId']>;
  title?: IProblemModel['title'];
  source?: IProblemModel['source'];
  authors?: IProblemModel['authors'];
  display?: IProblemModel['display'];
  tagIds?: Array<ITagModel['tagId']>;
}

export type IMProblemServiceGetListRes = defModel.ListModelRes<IMProblemLite>;
//#endregion

//#region service.getDetail
export type IMProblemServiceGetDetailRes = defModel.DetailModelRes<IMProblemDetail>;
//#endregion

//#region service.getRelative
export type IMProblemServiceGetRelativeRes = Record<IProblemModel['problemId'], IMProblemDetail>;
//#endregion

//#region service.findOne
export type IMProblemServiceFindOneOpt = Partial<IProblemModel>;
export type IMProblemServiceFindOneRes = defModel.DetailModelRes<IMProblemDetail>;
//#endregion

//#region service.isExists
export type IMProblemServiceIsExistsOpt = Partial<IProblemModel>;
//#endregion

//#region service.create
export interface IMProblemServiceCreateOpt {
  title: IProblemModel['title'];
  description: IProblemModel['description'];
  input: IProblemModel['input'];
  output: IProblemModel['output'];
  samples: IProblemModel['samples'];
  hint: IProblemModel['hint'];
  source: IProblemModel['source'];
  authors: IProblemModel['authors'];
  timeLimit: IProblemModel['timeLimit'];
  memoryLimit: IProblemModel['memoryLimit'];
  display?: IProblemModel['display'];
  spj?: IProblemModel['spj'];
  difficulty?: IProblemModel['difficulty'];
  spConfig?: IProblemModel['spConfig'];
}

export type IMProblemServiceCreateRes = IProblemModel['problemId'];
//#endregion

//#region service.update
export interface IMProblemServiceUpdateOpt {
  title?: IProblemModel['title'];
  description?: IProblemModel['description'];
  input?: IProblemModel['input'];
  output?: IProblemModel['output'];
  samples?: IProblemModel['samples'];
  hint?: IProblemModel['hint'];
  source?: IProblemModel['source'];
  authors?: IProblemModel['authors'];
  timeLimit?: IProblemModel['timeLimit'];
  memoryLimit?: IProblemModel['memoryLimit'];
  display?: IProblemModel['display'];
  spj?: IProblemModel['spj'];
  difficulty?: IProblemModel['difficulty'];
  spConfig?: IProblemModel['spConfig'];
}

export type IMProblemServiceUpdateRes = boolean;
//#endregion
