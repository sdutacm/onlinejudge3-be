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
  authPerm,
  authPermOrRequireSelf,
} from '@/lib/decorators/controller.decorator';
import { CSetMeta } from './set.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { CProblemService } from '../problem/problem.service';
import { ICreateSetResp, ICreateSetReq, IUpdateSetDetailReq } from '@/common/contracts/set';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';
import { EPerm } from '@/common/configs/perm.config';

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

  @route()
  @authPerm(EPerm.WriteSet)
  async [routesBe.createSet.i](ctx: Context): Promise<ICreateSetResp> {
    const { title, description, type, props, hidden } = ctx.request.body as ICreateSetReq;
    switch (type) {
      case 'standard': {
        const problems = this.service.getFlatProblems(props);
        const problemIds = problems.map((p) => p.problemId);
        const relativeProblems = await this.problemService.getRelative(problemIds);
        const notExistProblemIds = problemIds.filter((problemId) => !relativeProblems[problemId]);
        if (notExistProblemIds.length) {
          throw new ReqError(Codes.SET_PROBLEM_NOT_EXIST, notExistProblemIds);
        }
        const newId = await this.service.create({
          userId: ctx.session.userId,
          title,
          description,
          type,
          props,
          hidden,
        });
        return { setId: newId };
      }
      default: {
        this.utils.misc.never(type);
        throw new Error(`InvalidCase: ${type}`);
      }
    }
  }

  @route()
  @id()
  @getDetail(null)
  @authPermOrRequireSelf(undefined, EPerm.WriteSet)
  async [routesBe.updateSetDetail.i](ctx: Context): Promise<void> {
    const setId = ctx.id!;
    const { title, description, type, props, hidden } = ctx.request.body as IUpdateSetDetailReq;
    switch (type) {
      case 'standard': {
        const problems = this.service.getFlatProblems(props);
        const problemIds = problems.map((p) => p.problemId);
        const relativeProblems = await this.problemService.getRelative(problemIds);
        const notExistProblemIds = problemIds.filter((problemId) => !relativeProblems[problemId]);
        if (notExistProblemIds.length) {
          throw new ReqError(Codes.SET_PROBLEM_NOT_EXIST, notExistProblemIds);
        }
        await this.service.update(setId, {
          title,
          description,
          type,
          props,
          hidden,
        });
        await this.service.clearDetailCache(setId);
        return;
      }
      default: {
        this.utils.misc.never(type);
        throw new Error(`InvalidCase: ${type}`);
      }
    }
  }

  @route()
  @id()
  @getDetail(null)
  @authPermOrRequireSelf(undefined, EPerm.DeleteSet)
  async [routesBe.deleteSet.i](ctx: Context): Promise<void> {
    const setId = ctx.id!;
    await this.service.update(setId, {
      hidden: true,
    });
    await this.service.clearDetailCache(setId);
  }
}
