import { provide, inject, Context } from 'midway';
import { TCompetitionEventModel } from '@/lib/models/competitionEvent.model';
import { IUtils } from '@/utils';
import { literal } from 'sequelize';
import { IMCompetitionEventLite, ICompetitionEventModel } from './competition.interface';

export type CCompetitionEventService = CompetitionEventService;

const competitionEventLiteFields = [
  'competitionEventId',
  'event',
  'detail',
  'userId',
  'problemId',
  'solutionId',
  'judgeInfoId',
  'createdAt',
];

@provide()
export default class CompetitionEventService {
  @inject()
  competitionEventModel: TCompetitionEventModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  public async event(
    competitionId: number,
    event: ICompetitionEventModel['event'],
    options: {
      detail?: any;
      userId?: number;
      problemId?: number;
      solutionId?: number;
      judgeInfoId?: number;
    } = {},
  ) {
    const { detail, userId, problemId, solutionId, judgeInfoId } = options;
    const res = await this.competitionEventModel.create({
      competitionId,
      event,
      detail: detail ?? {},
      userId: userId ?? null,
      problemId: problemId ?? null,
      solutionId: solutionId ?? null,
      judgeInfoId: judgeInfoId ?? null,
      createdAt: literal('DEFAULT'),
    });
    return res.competitionEventId;
  }

  public async findAllEvents(
    competitionId: number,
    options: {
      event?: ICompetitionEventModel['event'];
      userId?: number;
      problemId?: number;
      solutionId?: number;
      judgeInfoId?: number;
    } = {},
  ) {
    const { event, userId, problemId, solutionId, judgeInfoId } = options;
    const res = await this.competitionEventModel
      .findAndCountAll({
        attributes: competitionEventLiteFields,
        where: this.utils.misc.ignoreUndefined({
          competitionId,
          event,
          userId,
          problemId,
          solutionId,
          judgeInfoId,
        }),
        order: [['competitionEventId', 'ASC']],
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMCompetitionEventLite),
      }));
    return res;
  }
}
