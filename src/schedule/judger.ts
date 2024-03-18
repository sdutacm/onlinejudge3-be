import { provide, schedule, CommonSchedule, Context, inject, logger, EggLogger } from 'midway';
import { getWorkerPids } from '@/lib/services/getPids';
import { CSolutionService } from '@/app/solution/solution.service';
import { ISolutionModel, IMSolutionServiceJudgeOpt } from '@/app/solution/solution.interface';
import * as os from 'os';

const MAX_FETCH_PENDING_SOLUTIONS = 100;
const MAX_JUDGE_PENDING_SOLUTIONS = 10;
const MAX_GUESS_DIED_TIMEOUT = 3 * 60;

const isProd = process.env.NODE_ENV === 'production';

// TODO remove this

/**
 * 重新捞起评测任务的定时触发器。
 *
 * 对未被接管的任务或长时间未结束的任务，重新触发评测。
 */
// @provide()
// @schedule({
//   interval: isProd ? 5000 : 60000,
//   type: 'worker',
//   immediate: true,
// })
// export class JudgerCron implements CommonSchedule {
//   @inject()
//   solutionService: CSolutionService;

//   @logger('scheduleLogger')
//   logger: EggLogger;

//   async exec(ctx: Context) {
//     const judgerLogger = ctx.getLogger('judgerLogger');
//     const workerPids = await getWorkerPids(ctx.app);
//     this.logger.info('[judger] alive worker pids:', workerPids);
//     const pendingSolutions = await this.solutionService.getPendingSolutions(
//       MAX_FETCH_PENDING_SOLUTIONS,
//     );
//     const toJudgeSolutionIds: ISolutionModel['solutionId'][] = [];
//     const toResetJudgeStatusSolutionIds: ISolutionModel['solutionId'][] = [];
//     for (const solution of pendingSolutions) {
//       if (toJudgeSolutionIds.length >= MAX_JUDGE_PENDING_SOLUTIONS) {
//         break;
//       }
//       const { solutionId } = solution;
//       const judgeStatus = await this.solutionService.getSolutionJudgeStatus(solutionId);
//       const isCurrentHostButDiedJudging =
//         !!judgeStatus &&
//         os.hostname() === judgeStatus.hostname &&
//         !workerPids.includes(judgeStatus.pid);
//       const isTimeoutDiedJudging =
//         !!judgeStatus &&
//         Math.floor(Date.now() / 1000) - (judgeStatus.updatedAt || 0) >= MAX_GUESS_DIED_TIMEOUT;
//       const canAccept = !judgeStatus || isCurrentHostButDiedJudging || isTimeoutDiedJudging;
//       if (!canAccept) {
//         continue;
//       }
//       if (judgeStatus) {
//         toResetJudgeStatusSolutionIds.push(solutionId);
//       }
//       toJudgeSolutionIds.push(solutionId);
//     }
//     const relativeSolutions = await this.solutionService.getRelative(toJudgeSolutionIds);
//     const toJudgeSolutions: IMSolutionServiceJudgeOpt[] = toJudgeSolutionIds.map((solutionId) => {
//       const solution = relativeSolutions[solutionId];
//       return {
//         judgeInfoId: 0,
//         solutionId,
//         problemId: solution.problem?.problemId,
//         timeLimit: solution.problem?.timeLimit,
//         memoryLimit: solution.problem?.memoryLimit,
//         userId: solution.user?.userId,
//         language: solution.language,
//         code: solution.code,
//         spj: solution.problem?.spj,
//       };
//     });
//     // console.log(`(pid: ${process.pid}) toJudgeSolutionIds`, toJudgeSolutionIds);
//     this.logger.info('[judger] to judge solutionIds:', toJudgeSolutionIds);
//     toJudgeSolutionIds.length > 0 &&
//       judgerLogger.info('[judger] scheduled to judge solutionIds:', toJudgeSolutionIds);
//     await Promise.all(
//       toResetJudgeStatusSolutionIds.map((solutionId) =>
//         this.solutionService.delSolutionJudgeStatus(solutionId),
//       ),
//     );
//     toJudgeSolutions.forEach((s) => this.solutionService.judge(s));
//   }
// }
