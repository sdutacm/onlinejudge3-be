import { Context, controller, inject, provide } from 'midway';
import { CBalloonService } from './balloon.service';
import { CBalloonMeta } from './balloon.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { authCompetitionRole, route } from '@/lib/decorators/controller.decorator';
import {
  IGetCompetitionBalloonsReq,
  IUpdateCompetitionBalloonStatusReq,
} from '@/common/contracts/balloon';
import { IMBalloonGetBalloonsByCompetitionIdRes } from '@/app/balloon/balloon.interface';
import { ECompetitionUserRole } from '@/common/enums';
import { ILodash } from '@/utils/libs/lodash';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';

@provide()
@controller('/')
export default class BalloonController {
  @inject('balloonMeta')
  meta: CBalloonMeta;

  @inject('balloonService')
  service: CBalloonService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin, ECompetitionUserRole.volunteer])
  async [routesBe.getCompetitionBalloons.i](
    ctx: Context,
  ): Promise<IMBalloonGetBalloonsByCompetitionIdRes> {
    const req = ctx.request.body as IGetCompetitionBalloonsReq;
    return this.service.getBalloonsByCompetitionId(req.competitionId);
  }

  @route()
  @authCompetitionRole([ECompetitionUserRole.admin, ECompetitionUserRole.volunteer])
  async [routesBe.updateCompetitionBalloonStatus.i](ctx: Context): Promise<void> {
    const { balloonId, competitionId } = ctx.request.body as IUpdateCompetitionBalloonStatusReq;
    const detail = await this.service.findOne({
      balloonId,
      competitionId,
    });
    if (!detail) {
      throw new ReqError(Codes.GENERAL_ENTITY_NOT_EXIST);
    }
    const data = this.lodash.omit(ctx.request.body as IUpdateCompetitionBalloonStatusReq, [
      'balloonId',
      'competitionId',
    ]);
    await this.service.update(balloonId, data);
  }
}
