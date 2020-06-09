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

export type IMProblemLite = Pick<IProblemModel, TMProblemLiteFields>;
export type IMProblemDetail = Pick<IProblemModel, TMProblemDetailFields>;
export type IMProblemListPagination = defService.ServiceListOpt<TProblemModelFields>;
export type IMProblemFullListPagination = defService.ServiceFullListOpt<TProblemModelFields>;
