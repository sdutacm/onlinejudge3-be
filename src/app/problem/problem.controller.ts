import { Context, controller, inject, provide, config } from 'midway';
import { route } from '@/lib/decorators/controller.decorator';
import { CProblemMeta } from './problem.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CProblemService } from './problem.service';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';

@provide()
@controller('/')
export default class ProblemController {
  @inject('problemMeta')
  meta: CProblemMeta;

  @inject('problemService')
  service: CProblemService;

  @inject()
  utils: IUtils;
}
