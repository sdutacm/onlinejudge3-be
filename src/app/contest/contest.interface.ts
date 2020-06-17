export interface IContestModel {
  contestId: number;
  title: string;
  description: string;
  intro: string;
  type: number;
  category: number;
  mode: number;
  password: string;
  startAt: Date;
  endAt: Date;
  frozenLength: number;
  registerStartAt: Date | null;
  registerEndAt: Date | null;
  team: boolean;
  ended: boolean;
  hidden: boolean;
}

export type TContestModelFields = keyof IContestModel;

export type TMContestLiteFields = Extract<
  TContestModelFields,
  | 'contestId'
  | 'title'
  | 'type'
  | 'category'
  | 'mode'
  | 'startAt'
  | 'endAt'
  | 'frozenLength'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'team'
  | 'ended'
>;

export type TMContestDetailFields = Extract<
  TContestModelFields,
  | 'contestId'
  | 'title'
  | 'type'
  | 'category'
  | 'mode'
  | 'intro'
  | 'description'
  | 'password'
  | 'startAt'
  | 'endAt'
  | 'frozenLength'
  | 'registerStartAt'
  | 'registerEndAt'
  | 'team'
  | 'ended'
>;

export type IMContestLite = Pick<IContestModel, TMContestLiteFields>;
export type IMContestDetail = Pick<IContestModel, TMContestDetailFields>;
export type IMContestListPagination = defService.ServiceListOpt<TContestModelFields>;
