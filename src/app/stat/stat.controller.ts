import { Context, controller, inject, provide } from 'midway';
import { route } from '@/lib/decorators/controller.decorator';
import { CStatMeta } from './stat.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import {
  IGetUserACRankReq,
  IGetUserACRankResp,
  IGetUserAcceptedProblemsReq,
  IGetUserAcceptedProblemsResp,
  IGetUserSubmittedProblemsReq,
  IGetUserSubmittedProblemsResp,
} from '@/common/contracts/stat';
import { CStatService } from './stat.service';
import { CPromiseQueue } from '@/utils/libs/promise-queue';
import { IUserModel } from '../user/user.interface';
import { IMStatUserAcceptedProblems, IMStatUserSubmittedProblems } from './stat.interface';

@provide()
@controller('/')
export default class StatController {
  @inject('statMeta')
  meta: CStatMeta;

  @inject('statService')
  service: CStatService;

  @inject()
  utils: IUtils;

  @inject('PromiseQueue')
  PromiseQueue: CPromiseQueue;

  UASP_MAX_USER_NUM = 5000;

  /**
   * 获取分时段用户 AC 数排名统计。
   * @returns 排名统计
   */
  @route()
  async [routesBe.getUserACRank.i](ctx: Context): Promise<IGetUserACRankResp> {
    const { type } = ctx.request.body as IGetUserACRankReq;
    const res = await this.service.getUserACRank(type);
    if (!res) {
      return {
        count: 0,
        rows: [],
        truncated: 0,
        startAt: '',
        _updateEvery: -1,
        _updatedAt: -1,
      };
    }
    return res;
  }

  /**
   * 批量获取用户 AC 题目概览（每个题目首次 AC 信息）。
   * @returns 概览数据
   */
  @route()
  async [routesBe.getUserAcceptedProblems.i](ctx: Context): Promise<IGetUserAcceptedProblemsResp> {
    let { userIds } = ctx.request.body as IGetUserAcceptedProblemsReq;
    const maxUserNum = this.UASP_MAX_USER_NUM;
    userIds = userIds.slice(0, maxUserNum);
    const stats: Record<IUserModel['userId'], IMStatUserAcceptedProblems> = {};
    const pq = new this.PromiseQueue(20, Infinity);
    const queueTasks = userIds.map((userId) =>
      pq.add(() =>
        this.service.getUserAcceptedProblems(userId).then((res) => {
          res && (stats[userId] = res);
        }),
      ),
    );
    await Promise.all(queueTasks);
    const runInfo = await this.service.getUASPRunInfo();
    return {
      stats,
      truncated: maxUserNum,
      _updateEvery: runInfo?._updateEvery || -1,
      _updatedAt: runInfo?._updatedAt || -1,
    };
  }

  /**
   * 批量获取用户提交题目概览（每个题目的提交列表，截至首次 AC）。
   * @returns 概览数据
   */
  @route()
  async [routesBe.getUserSubmittedProblems.i](
    ctx: Context,
  ): Promise<IGetUserSubmittedProblemsResp> {
    let { userIds } = ctx.request.body as IGetUserSubmittedProblemsReq;
    const maxUserNum = this.UASP_MAX_USER_NUM;
    userIds = userIds.slice(0, maxUserNum);
    const stats: Record<IUserModel['userId'], IMStatUserSubmittedProblems> = {};
    const pq = new this.PromiseQueue(20, Infinity);
    const queueTasks = userIds.map((userId) =>
      pq.add(() =>
        this.service.getUserSubmittedProblems(userId).then((res) => {
          res && (stats[userId] = res);
        }),
      ),
    );
    await Promise.all(queueTasks);
    const runInfo = await this.service.getUASPRunInfo();
    return {
      stats,
      truncated: maxUserNum,
      _updateEvery: runInfo?._updateEvery || -1,
      _updatedAt: runInfo?._updatedAt || -1,
    };
  }
}
