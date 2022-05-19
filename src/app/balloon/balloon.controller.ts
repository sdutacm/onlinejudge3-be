import { Context, controller, inject, provide } from 'midway';
import { CBalloonService } from './balloon.service';
import { CBalloonMeta } from './balloon.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';

@provide()
@controller('/')
export default class BalloonController {
  @inject('balloonMeta')
  meta: CBalloonMeta;

  @inject('balloonService')
  service: CBalloonService;

  @inject()
  utils: IUtils;
}
