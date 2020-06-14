import { Context, controller, inject, provide } from 'midway';
import {
  route,
  pagination,
  getList,
  respList,
  id,
  getDetail,
  respDetail,
  auth,
} from '@/lib/decorators/controller.decorator';
import { CProblemMeta } from './problem.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CProblemService } from './problem.service';
import {
  ICreateProblemResp,
  ICreateProblemReq,
  IUpdateProblemDetailReq,
} from '@/common/contracts/problem';
import { ILodash } from '@/utils/libs/lodash';

@provide()
@controller('/')
export default class ProblemController {
  @inject('problemMeta')
  meta: CProblemMeta;

  @inject('problemService')
  service: CProblemService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @route()
  @pagination()
  @getList()
  @respList()
  async [routesBe.getProblemList.i](_ctx: Context) {}

  @route()
  @id()
  @getDetail()
  @respDetail()
  async [routesBe.getProblemDetail.i](_ctx: Context) {}

  @route()
  @auth('admin')
  async [routesBe.createProblem.i](ctx: Context): Promise<ICreateProblemResp> {
    const data = ctx.request.body as ICreateProblemReq;
    const newId = await this.service.create({
      ...data,
      author: ctx.session.userId,
    });
    return { problemId: newId };
  }

  @route()
  @auth('perm')
  @id()
  @getDetail(null)
  async [routesBe.updateProblemDetail.i](ctx: Context): Promise<void> {
    const problemId = ctx.id!;
    const data = this.lodash.omit(ctx.request.body as IUpdateProblemDetailReq, ['problemId']);
    await this.service.update(
      problemId,
      ctx.isAdmin ? data : this.lodash.pick(data, ['difficulty']),
    );
    await this.service.clearDetailCache(problemId);
  }
}
