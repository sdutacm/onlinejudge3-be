import { Context, controller, inject, provide } from 'midway';
import { CBalloonService } from './balloon.service';
import { CBalloonMeta } from './balloon.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { authCompetitionRole, route } from "@/lib/decorators/controller.decorator";
import { IGetCompetitionBalloonsReq } from "@/common/contracts/balloon";
import { IMBalloonGetBalloonsByCompetitionIdRes } from "@/app/balloon/balloon.interface";
import { ECompetitionUserRole } from "@/common/enums";

@provide()
@controller('/')
export default class BalloonController {
  @inject('balloonMeta')
  meta: CBalloonMeta;

  @inject('balloonService')
  service: CBalloonService;

  @inject()
  utils: IUtils;

  @route()
  // @authCompetitionRole([ECompetitionUserRole.volunteer])
  async [routesBe.getCompetitionBalloons.i](ctx: Context): Promise<IMBalloonGetBalloonsByCompetitionIdRes> {
    const req = ctx.request.body as IGetCompetitionBalloonsReq
    return await this.service.getBalloonsByCompetitionId(req.competitionId)
  }
}
