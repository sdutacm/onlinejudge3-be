import {
  provide,
  schedule,
  CommonSchedule,
  Context,
  logger,
  EggLogger,
  config,
  inject,
} from 'midway';
import { QueryTypes } from 'sequelize';
import DB from '@/lib/models/db';
import { ESolutionResult } from '@/common/enums';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { CUserService } from '@/app/user/user.service';

const isProd = process.env.NODE_ENV === 'production';

// 更新用户 AC/Submitted 计数
@provide()
@schedule({
  interval: isProd ? 1 * 60 * 1000 : 2 * 60 * 1000,
  type: 'worker',
  immediate: true,
})
export class SolutionProblemStatsCron implements CommonSchedule {
  @inject()
  userService: CUserService;

  @logger('scheduleLogger')
  logger: EggLogger;

  @config()
  redisKey: IRedisKeyConfig;

  async exec(ctx: Context) {
    this.logger.info('[solutionUserStats] start');
    let res: any[];
    const _s = Date.now();
    let _us: number;

    try {
      const userIds = (
        await ctx.helper.redisSmembers(this.redisKey.asyncSolutionUserStatsTasks)
      ).map((i) => +i);
      this.logger.info('[solutionUserStats] got users', userIds);

      for (const userId of userIds) {
        this.logger.info('[solutionUserStats] processing', userId);

        _us = Date.now();
        res = await DB.sequelize.query(
          'SELECT COUNT(DISTINCT(problem_id)) AS accept FROM solution WHERE user_id=? AND result=?',
          {
            replacements: [userId, ESolutionResult.AC],
            type: QueryTypes.SELECT,
          },
        );
        const _sql1Cost = Date.now() - _us;
        const userAccepted = res[0].accept;

        _us = Date.now();
        res = await DB.sequelize.query(
          'SELECT COUNT(solution_id) AS submit FROM solution WHERE user_id=? AND result NOT IN (?)',
          {
            replacements: [
              userId,
              [
                ESolutionResult.CE,
                ESolutionResult.SE,
                ESolutionResult.WT,
                ESolutionResult.JG,
                ESolutionResult.RPD,
              ],
            ],
            type: QueryTypes.SELECT,
          },
        );
        const _sql2Cost = Date.now() - _us;
        const userSubmitted = res[0].submit;

        _us = Date.now();
        await DB.sequelize.query('UPDATE user SET accept=?, submit=? WHERE user_id=?', {
          replacements: [userAccepted, userSubmitted, userId],
          type: QueryTypes.UPDATE,
        });
        const _sql3Cost = Date.now() - _us;
        await this.userService.clearDetailCache(userId);

        await ctx.helper.redisSrem(this.redisKey.asyncSolutionUserStatsTasks, [], `${userId}`);

        this.logger.info('[solutionUserStats] completed', userId, 'time cost:', [
          _sql1Cost,
          _sql2Cost,
          _sql3Cost,
        ]);
      }

      this.logger.info('[solutionUserStats] done', userIds, 'time cost:', Date.now() - _s);
    } catch (e) {
      this.logger.error('[solutionUserStats] error', e);
    }
  }
}
