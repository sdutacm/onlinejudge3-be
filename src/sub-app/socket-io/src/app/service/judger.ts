import { roomKey } from '../../config/room';
import { ParameterException } from '../../exceptions/parameter';
import { Application } from 'midway';

/**
 * 编码评测状态。
 * @param solutionId
 * @param state 评测状态（0: running, 1: finished）
 * @param result 评测结果
 * @param current 当前运行评测点
 * @param total 总评测点数量
 */
export function encodeJudgeStatusBuffer(
  solutionId: number,
  state: number,
  // result: ESolutionResult,
  result: number,
  current?: number,
  total?: number,
) {
  const buffer = new ArrayBuffer(8);
  const dv = new DataView(buffer);
  dv.setUint32(0, solutionId);
  dv.setUint8(4, state);
  dv.setUint8(5, result);
  dv.setUint8(6, current || 0);
  dv.setUint8(7, total || 0);
  return buffer;
}

module.exports = (app: Application) => {
  class JudgerService extends app.Service {
    readonly nsp = '/judger';

    async pushJudgeStatus(body: any[]) {
      const statusFormArray = body;
      if (!Array.isArray(statusFormArray)) {
        throw new ParameterException();
      }
      const solutionId = statusFormArray[0];
      this.ctx.logger.info('[judger] pushJudgeStatus:', statusFormArray);
      console.info('[judger] pushJudgeStatus:', statusFormArray);
      // @ts-ignore
      const status = encodeJudgeStatusBuffer(...statusFormArray);
      this.ctx.app.io.of(this.nsp).to(roomKey.judgeStatus(solutionId)).emit('s', status);
    }
  }

  return JudgerService;
};
