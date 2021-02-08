import { provide, schedule, CommonSchedule, Context, inject, logger, EggLogger } from 'midway';
import { getWorkerPids } from '@/lib/services/getPids';
import { CSolutionService } from '@/app/solution/solution.service';
import { ISolutionModel, IMSolutionServiceJudgeOpt } from '@/app/solution/solution.interface';
import * as os from 'os';

const MAX_FETCH_PENDING_SOLUTIONS = 100;
const MAX_JUDGE_PENDING_SOLUTIONS = 10;

@provide()
@schedule({
  interval: 30000,
  type: 'worker',
  immediate: true,
})
export class JudgerCron implements CommonSchedule {
  @inject()
  solutionService: CSolutionService;

  @logger('scheduleLogger')
  logger: EggLogger;

  async exec(ctx: Context) {
    const workerPids = await getWorkerPids(ctx.app);
    this.logger.info('[judger] alive worker pids:', workerPids);
    const pendingSolutions = await this.solutionService.getPendingSolutions(
      MAX_FETCH_PENDING_SOLUTIONS,
    );
    const toJudgeSolutionIds: ISolutionModel['solutionId'][] = [];
    for (const solution of pendingSolutions) {
      const { solutionId } = solution;
      const judgeStatus = await this.solutionService.getSolutionJudgeStatus(solutionId);
      // @ts-ignore
      if (
        judgeStatus &&
        os.hostname() === judgeStatus.hostname &&
        workerPids.includes(judgeStatus.pid)
      ) {
        continue;
      }
      if (toJudgeSolutionIds.length < MAX_JUDGE_PENDING_SOLUTIONS) {
        toJudgeSolutionIds.push(solutionId);
      }
    }
    const relativeSolutions = await this.solutionService.getRelative(toJudgeSolutionIds);
    const toJudgeSolutions: IMSolutionServiceJudgeOpt[] = toJudgeSolutionIds.map((solutionId) => {
      const solution = relativeSolutions[solutionId];
      return {
        solutionId,
        problemId: solution.problem?.problemId,
        timeLimit: solution.problem?.timeLimit,
        memoryLimit: solution.problem?.memoryLimit,
        userId: solution.user?.userId,
        language: solution.language,
        code: solution.code,
      };
    });
    console.log('toJudgeSolutionIds', toJudgeSolutionIds);
    this.logger.info('[judger] to judge solutionIds:', toJudgeSolutionIds);
    toJudgeSolutions.forEach((s) => this.solutionService.judge(s));
  }
}
