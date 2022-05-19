import { provide, inject, Context, config } from 'midway';
import { CBalloonMeta } from './balloon.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { TBalloonModel } from '@/lib/models/balloon.model';
import {
  TMBalloonLiteFields,
  IMBalloonGetBalloonsByCompetitionIdRes,
  IMBalloonLite,
} from './balloon.interface';
import { IUtils } from '@/utils';
import { ICompetitionModel } from '../competition/competition.interface';

export type CBalloonService = BalloonService;

const balloonLiteFields: Array<TMBalloonLiteFields> = [
  'balloonId',
  'solutionId',
  'competitionId',
  'userId',
  'problemId',
  'problemIndex',
  'balloonAlias',
  'balloonColor',
  'nickname',
  'fieldShortName',
  'seatNo',
  'type',
  'status',
  'assignedUserId',
  'isFb',
  'createdAt',
  'updatedAt',
];

@provide()
export default class BalloonService {
  @inject('balloonMeta')
  meta: CBalloonMeta;

  @inject('balloonModel')
  model: TBalloonModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @config()
  durations: IDurationsConfig;

  /**
   * 获取指定比赛的全部气球列表。
   * @param competitionId competitionId
   */
  async getBalloonsByCompetitionId(
    competitionId: ICompetitionModel['competitionId'],
  ): Promise<IMBalloonGetBalloonsByCompetitionIdRes> {
    const res = await this.model
      .findAll({
        attributes: balloonLiteFields,
        where: {
          competitionId,
        },
        order: [['balloon_id', 'ASC']],
      })
      .then((r) => r.map((d) => d.get({ plain: true }) as IMBalloonLite));
    return {
      count: res.length,
      rows: res,
    };
  }
}
