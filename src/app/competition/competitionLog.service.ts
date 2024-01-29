import { provide, inject, Context } from 'midway';
import { TCompetitionLogModel } from '@/lib/models/competitionLog.model';
import { IUtils } from '@/utils';
import { fn } from 'sequelize';
import { IMCompetitionLogLite, ICompetitionLogModel } from './competition.interface';

export type CCompetitionLogService = CompetitionLogService;

const competitionLogLiteFields = [
  'competitionLogId',
  'action',
  'opUserId',
  'userId',
  'problemId',
  'solutionId',
  'detail',
  'createdAt',
];

@provide()
export default class CompetitionLogService {
  @inject()
  competitionLogModel: TCompetitionLogModel;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  public async log(
    competitionId: number,
    action: ICompetitionLogModel['action'],
    options: {
      userId?: number;
      problemId?: number;
      solutionId?: number;
      detail?: any;
    } = {},
  ) {
    const { userId, problemId, solutionId, detail } = options;
    const res = await this.competitionLogModel.create({
      competitionId,
      action,
      opUserId: this.ctx.session?.competitions?.[competitionId]?.userId ?? null,
      userId: userId ?? null,
      problemId: problemId ?? null,
      solutionId: solutionId ?? null,
      detail: detail ?? {},
      ip: this.ctx.ip,
      userAgent: this.ctx.header['user-agent'],
      createdAt: fn('NOW'),
    });
    return res.competitionLogId;
  }

  public async findAllLogs(
    competitionId: number,
    options: {
      action?: ICompetitionLogModel['action'];
      opUserId?: number;
      userId?: number;
      problemId?: number;
      solutionId?: number;
    } = {},
  ) {
    const { action, opUserId, userId, problemId, solutionId } = options;
    const res = await this.competitionLogModel
      .findAndCountAll({
        attributes: competitionLogLiteFields,
        where: this.utils.misc.ignoreUndefined({
          competitionId,
          action,
          opUserId,
          userId,
          problemId,
          solutionId,
        }),
        order: [['competitionLogId', 'ASC']],
      })
      .then((r) => ({
        ...r,
        rows: r.rows.map((d) => d.get({ plain: true }) as IMCompetitionLogLite),
      }));
    return res;
  }
}
