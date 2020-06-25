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
  IUpdateProblemTagsReq,
} from '@/common/contracts/problem';
import { ILodash } from '@/utils/libs/lodash';
import { CContestService } from '../contest/contest.service';
import { CPromiseQueue } from '@/utils/libs/promise-queue';

@provide()
@controller('/')
export default class ProblemController {
  @inject('problemMeta')
  meta: CProblemMeta;

  @inject('problemService')
  service: CProblemService;

  @inject()
  contestService: CContestService;

  @inject()
  utils: IUtils;

  @inject()
  lodash: ILodash;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

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
    // 清除题目详情缓存和被加入的比赛的比赛题目缓存
    await this.service.clearDetailCache(problemId);
    const pq = new this.PromiseQueue(20, Infinity);
    const contestIds = await this.contestService.getAllContestIdsByProblemId(problemId);
    const queueTasks = contestIds.map((contestId) =>
      pq.add(() => this.contestService.clearContestProblemsCache(contestId)),
    );
    await Promise.all(queueTasks);
  }

  @route()
  @auth('perm')
  @id()
  @getDetail(null)
  async [routesBe.updateProblemTags.i](ctx: Context): Promise<void> {
    const problemId = ctx.id!;
    const { tagIds } = ctx.request.body as IUpdateProblemTagsReq;
    await this.service.updateProblemTags(problemId, tagIds);
    await this.service.clearDetailCache(problemId);
  }
}
