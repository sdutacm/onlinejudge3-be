import { provide, inject, Context } from 'midway';
import { TCompetitionLogModel } from '@/lib/models/competitionLog.model';
import { IUtils } from '@/utils';
import { fn } from 'sequelize';

export type CCompetitionLogService = CompetitionLogService;

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
    action: string,
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
}
