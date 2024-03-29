import { EBalloonType, EBalloonStatus } from '@/common/enums';
import {
  IMSolutionLitePlain,
  IMSolutionServiceGetAllCompetitionSolutionListRes,
} from '@/app/solution/solution.interface';
import { IMCompetitionProblemLite } from '@/app/competition/competition.interface';

export interface IBalloonModel {
  balloonId: number;
  solutionId: number;
  competitionId: number;
  userId: number;
  problemId: number;
  problemIndex: number;
  balloonAlias: string;
  balloonColor: string;
  nickname: string;
  subname: string;
  fieldShortName: string;
  seatNo: number;
  type: EBalloonType;
  status: EBalloonStatus;
  assignedUserId: number | null;
  isFb: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TBalloonModelFields = keyof IBalloonModel;

export type TMBalloonLiteFields = TBalloonModelFields;
export type TMBalloonDetailFields = TBalloonModelFields;

export type IMBalloonLitePlain = Pick<IBalloonModel, TMBalloonLiteFields>;
export type IMBalloonLite = IMBalloonLitePlain;

export type IMBalloonDetailPlain = Pick<IBalloonModel, TMBalloonDetailFields>;
export type IMBalloonDetail = IMBalloonDetailPlain;

//#region service.getBalloonsByCompetitionId
export type IMBalloonGetBalloonsByCompetitionIdRes = defModel.FullListModelRes<IMBalloonLite>;
//#endregion

export interface BalloonProblemConfig {
  index: number;
  config: IMCompetitionProblemLite;
  solutions: IMSolutionLitePlain[];
}

export type BalloonProblemConfigMap = Record<number, BalloonProblemConfig>;

//#region service.findOne
export type IMBalloonServiceFindOneOpt = Partial<IBalloonModel>;
export type IMBalloonServiceFindOneRes = defModel.DetailModelRes<IMBalloonDetail>;
//#endregion

//#region service.update
export interface IMBalloonServiceUpdateOpt {
  type?: IBalloonModel['type'];
  status?: IBalloonModel['status'];
  assignedUserId?: IBalloonModel['assignedUserId'];
}

export type IMBalloonServiceUpdateRes = boolean;
//#endregion
