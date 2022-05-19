import { EBalloonType, EBalloonStatus } from '@/common/enums';

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

export type IMBalloonLitePlain = Pick<IBalloonModel, TMBalloonLiteFields>;
export type IMBalloonLite = IMBalloonLitePlain;

//#region service.getBalloonsByCompetitionId
export type IMBalloonGetBalloonsByCompetitionIdRes = defModel.FullListModelRes<IMBalloonLite>;
//#endregion
