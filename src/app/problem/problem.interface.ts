import { ITagModel } from '../tag/tag.interface';

export interface IProblemModel {
  problemId: number;
  title: string;
  description: string;
  input: string;
  output: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  source: string;
  author: number;
  timeLimit: number;
  memoryLimit: number;
  accepted: number;
  submitted: number;
  display: boolean;
  spj: boolean;
  difficulty: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export type TProblemModelFields = keyof IProblemModel;

export type TMProblemLiteFields = Extract<
  TProblemModelFields,
  | 'problemId'
  | 'title'
  | 'source'
  | 'author'
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
  | 'sampleInput'
  | 'sampleOutput'
  | 'hint'
  | 'source'
  | 'author'
  | 'timeLimit'
  | 'memoryLimit'
  | 'difficulty'
  | 'createdAt'
  | 'updatedAt'
  | 'accepted'
  | 'submitted'
  | 'spj'
  | 'display'
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
  author?: IProblemModel['author'];
  tagIds?: Array<ITagModel['tagId']>;
}

export type IMProblemServiceGetListRes = defModel.ListModelRes<IMProblemLite>;
//#endregion

//#region service.getDetail
export type IMProblemServiceGetDetailRes = defModel.DetailModelRes<IMProblemDetail>;
//#endregion
