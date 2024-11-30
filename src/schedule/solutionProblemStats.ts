// import { provide, schedule, CommonSchedule, Context, logger, EggLogger, config } from 'midway';
// import { QueryTypes } from 'sequelize';
// import DB from '@/lib/models/db';
// import { ESolutionResult } from '@/common/enums';
// import { IRedisKeyConfig } from '@/config/redisKey.config';

// const isProd = process.env.NODE_ENV === 'production';

// 更新题目 AC/Submitted 计数
// @provide()
// @schedule({
//   interval: isProd ? 5 * 60 * 1000 : 2 * 60 * 1000,
//   type: 'worker',
//   immediate: true,
// })
// export class SolutionProblemStatsCron implements CommonSchedule {
//   @logger('scheduleLogger')
//   logger: EggLogger;

//   @config()
//   redisKey: IRedisKeyConfig;

//   async exec(ctx: Context) {
//     this.logger.info('[solutionProblemStats] start');
//     let res: any[];
//     const _s = Date.now();
//     let _us: number;

//     try {
//       const problemIds = (
//         await ctx.helper.redisSmembers(this.redisKey.asyncSolutionProblemStatsTasks)
//       ).map((i) => +i);
//       this.logger.info('[solutionProblemStats] got problems', problemIds);

//       for (const problemId of problemIds) {
//         this.logger.info('[solutionProblemStats] processing', problemId);
//         if (!(problemId > 0)) {
//           this.logger.info('[solutionProblemStats] skipped cuz invalid problemId', problemId);
//           continue;
//         }

//         _us = Date.now();
//         res = await DB.sequelize.query(
//           'SELECT COUNT(DISTINCT(solution_id)) AS accept FROM solution WHERE problem_id=? AND result=?',
//           {
//             replacements: [problemId, ESolutionResult.AC],
//             type: QueryTypes.SELECT,
//           },
//         );
//         const _sql1Cost = Date.now() - _us;

//         const problemAccepted: number = res[0].accept;
//         _us = Date.now();
//         res = await DB.sequelize.query(
//           'SELECT COUNT(solution_id) AS submit FROM solution WHERE problem_id=? AND result NOT IN (?)',
//           {
//             replacements: [
//               problemId,
//               [
//                 ESolutionResult.CE,
//                 ESolutionResult.SE,
//                 ESolutionResult.WT,
//                 ESolutionResult.JG,
//                 ESolutionResult.RPD,
//               ],
//             ],
//             type: QueryTypes.SELECT,
//           },
//         );
//         const _sql2Cost = Date.now() - _us;
//         const problemSubmitted: number = res[0].submit;

//         _us = Date.now();
//         await DB.sequelize.query('UPDATE problem SET accept=?, submit=? WHERE problem_id=?', {
//           replacements: [problemAccepted, problemSubmitted, problemId],
//           type: QueryTypes.UPDATE,
//         });
//         const _sql3Cost = Date.now() - _us;
//         // await this.problemService.clearDetailCache(problemId);

//         await ctx.helper.redisSrem(
//           this.redisKey.asyncSolutionProblemStatsTasks,
//           [],
//           `${problemId}`,
//         );

//         this.logger.info('[solutionProblemStats] completed', problemId, 'time cost:', [
//           _sql1Cost,
//           _sql2Cost,
//           _sql3Cost,
//         ]);
//       }

//       this.logger.info('[solutionProblemStats] done', problemIds, 'time cost:', Date.now() - _s);
//     } catch (e) {
//       this.logger.error('[solutionProblemStats] error', e);
//     }
//   }
// }
