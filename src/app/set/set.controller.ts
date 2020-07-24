import { Context, controller, inject, provide } from 'midway';
import { CSetService } from './set.service';
import {
  id,
  getDetail,
  pagination,
  route,
  getList,
  respList,
  respDetail,
} from '@/lib/decorators/controller.decorator';
import { CSetMeta } from './set.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CProblemService } from '../problem/problem.service';

@provide()
@controller('/')
export default class SetController {
  @inject('setMeta')
  meta: CSetMeta;

  @inject('setService')
  service: CSetService;

  @inject()
  problemService: CProblemService;

  @inject()
  utils: IUtils;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getSetList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getSetDetail.i](_ctx: Context) {}
}
