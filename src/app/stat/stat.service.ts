import { provide, inject, Context, config } from 'midway';
import { CStatMeta } from './stat.meta';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IUtils } from '@/utils';
import { ILodash } from '@/utils/libs/lodash';
import {
  IMStatServiceGetUserACRankRes,
  IMStatUserACRankPlain,
  IMStatServiceGetUserAcceptedProblemsRes,
  IMStatUserAcceptedProblems,
  IMStatServiceGetUserSubmittedProblemsRes,
  IMStatUserSubmittedProblems,
  IMStatServiceGetUASPRunInfoRes,
  IMStatUASPRunInfo,
} from './stat.interface';
import { CUserService } from '../user/user.service';
import { IUserModel } from '../user/user.interface';

export type CStatService = StatService;

@provide()
export default class StatService {
  @inject('statMeta')
  meta: CStatMeta;

  @inject()
  userService: CUserService;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @inject()
  lodash: ILodash;

  @config()
  redisKey: IRedisKeyConfig;

  /**
   * 获取分时段用户 AC 数排名。
   * @param type 时段类型
   */
  async getUserACRank(type: 'day' | 'week' | 'month'): Promise<IMStatServiceGetUserACRankRes> {
    const data = await this.ctx.helper.redisGet<IMStatUserACRankPlain>(this.redisKey.userACStats, [
      type,
    ]);
    if (!data) {
      return null;
    }
    const userIds = data.rows.map((d) => d.userId);
    const relativeUsers = await this.userService.getRelative(userIds, null);
    return {
      ...data,
      rows: data.rows.map((d) => {
        const user = relativeUsers[d.userId];
        return this.utils.misc.ignoreUndefined({
          ...this.lodash.omit(d, ['userId']),
          user: {
            userId: user?.userId || d.userId,
            username: user?.username || '',
            nickname: user?.nickname || '',
            avatar: user?.avatar || '',
            bannerImage: user?.bannerImage || '',
          },
        });
      }),
    };
  }

  /**
   * 获取用户 AC 题目概览。
   * @param userId userId
   * @returns 用户每个题目首次 AC 信息
   */
  async getUserAcceptedProblems(
    userId: IUserModel['userId'],
  ): Promise<IMStatServiceGetUserAcceptedProblemsRes> {
    return this.ctx.helper.redisGet<IMStatUserAcceptedProblems>(
      this.redisKey.userAcceptedProblemsStats,
      [userId],
    );
  }

  /**
   * 获取用户提交题目概览。
   * @param userId userId
   * @returns 用户每个题目的提交列表，截至首次 AC
   */
  async getUserSubmittedProblems(
    userId: IUserModel['userId'],
  ): Promise<IMStatServiceGetUserSubmittedProblemsRes> {
    return this.ctx.helper.redisGet<IMStatUserSubmittedProblems>(
      this.redisKey.userSubmittedProblemsStats,
      [userId],
    );
  }

  /**
   * 获取用户 AC 及提交题目统计运行状态。
   */
  async getUASPRunInfo(): Promise<IMStatServiceGetUASPRunInfoRes> {
    return this.ctx.helper.redisGet<IMStatUASPRunInfo>(this.redisKey.userASProblemsStatsRunInfo);
  }
}
