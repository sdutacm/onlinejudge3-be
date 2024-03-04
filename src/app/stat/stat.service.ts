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
  IMStatJudgeQueue,
} from './stat.interface';
import { CUserService } from '../user/user.service';
import { IUserModel } from '../user/user.interface';
import Axios, { AxiosInstance } from 'axios';
import http from 'http';
import { IPulsarConfig } from '@/config/config.interface';
import { IJudgerConfig } from '@/config/judger.config';
import { EStatJudgeQueueWorkerStatus } from '@/common/enums';

export type CStatService = StatService;

const pulsarApiHttpAgent = new http.Agent({ keepAlive: true });

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

  @config('pulsar')
  pulsarConfig: IPulsarConfig;

  @config('judger')
  judgerConfig: IJudgerConfig;

  axiosPulsarApiInstance?: AxiosInstance;

  constructor(@config('pulsar') pulsarConfig: IPulsarConfig) {
    pulsarConfig.enable &&
      (this.axiosPulsarApiInstance = Axios.create({
        baseURL: pulsarConfig.apiBase,
        httpAgent: pulsarApiHttpAgent,
        headers: pulsarConfig.authenticationToken
          ? {
              Authorization: `Bearer ${pulsarConfig.authenticationToken}`,
            }
          : undefined,
        timeout: 5000,
      }));
  }

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

  async getJudgeQueueStats(): Promise<IMStatJudgeQueue | null> {
    const cache = await this.ctx.helper.redisGet<IMStatJudgeQueue>(this.redisKey.judgeQueueStats);
    if (cache) {
      return cache;
    }
    if (!this.axiosPulsarApiInstance) {
      return null;
    }
    const [jRes, dRes] = await Promise.all([
      await this.axiosPulsarApiInstance.get(
        `/admin/v2/persistent/${this.pulsarConfig.tenant}/${this.pulsarConfig.namespace}/${this.judgerConfig.mqJudgeQueueTopic}/stats`,
      ),
      await this.axiosPulsarApiInstance.get(
        `/admin/v2/persistent/${this.pulsarConfig.tenant}/${this.pulsarConfig.namespace}/${this.judgerConfig.mqJudgeDeadQueueTopic}/stats`,
      ),
    ]);
    const jSub = jRes.data.subscriptions?.[this.judgerConfig.mqJudgeQueueSubscription];
    const dSub = dRes.data.subscriptions?.[this.judgerConfig.mqJudgeDeadQueueSubscription];
    if (!jSub) {
      this.ctx.logger.error('Pulsar judge queue subscription not found');
      return null;
    }
    if (!dSub) {
      this.ctx.logger.error('Pulsar judge dead queue subscription not found');
      return null;
    }
    const stats: IMStatJudgeQueue = {
      running: jSub.unackedMessages,
      waiting: jSub.msgBacklog - jSub.unackedMessages,
      queueSize: jSub.msgBacklog,
      deadQueueSize: dSub.msgBacklog,
      workers: jSub.consumers.map((c: any) => {
        const consumerName = c.consumerName || '';
        const [hostname, , platform, arch, cpuModel] = (
          consumerName.split('JudgerAgent-')[1] || ''
        ).split('|');
        return {
          id: c.consumerName,
          platform,
          arch,
          cpuModel,
          group: hostname,
          status:
            c.unackedMessages > 0
              ? EStatJudgeQueueWorkerStatus.judging
              : EStatJudgeQueueWorkerStatus.idle,
        };
      }),
    };
    await this.ctx.helper.redisSet(this.redisKey.judgeQueueStats, [], stats, 1);
    return stats;
  }
}
