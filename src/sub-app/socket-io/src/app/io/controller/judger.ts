import { Application } from 'midway';
import { isPrivate as isPrivateIp } from 'ip';
import { checkEmitAuth } from '../utils/auth';

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
  class JudgerController extends app.Controller {
    async subscribe() {
      const solutionIds: number[] = this.ctx.args[0];
      if (!Array.isArray(solutionIds) || solutionIds.length === 0) {
        return;
      }
      console.log(`[judger] client subscribe: ${solutionIds}`);
      solutionIds.forEach((solutionId) => {
        const room = `solution:${solutionId}`;
        this.ctx.socket.join(room);
        this.ctx.socket.emit('res', `subscribed ${solutionId}`);
      });
    }

    async innerHttpAcceptPushStatus() {
      if (!checkEmitAuth(this.ctx, this.config)) {
        this.ctx.status = 403;
        this.ctx.body = {
          success: false,
          code: -1,
          msg: '403',
        };
        return;
      }

      const statusFormArray = this.ctx.request.body as any[];
      if (!Array.isArray(statusFormArray)) {
        this.ctx.status = 422;
        this.ctx.body = {
          success: false,
          code: -1,
          msg: '422',
        };
        return;
      }
      const solutionId = statusFormArray[0];
      this.ctx.logger.info('[judger] innerHttpAcceptPushStatus:', statusFormArray);
      console.log('[judger] innerHttpAcceptPushStatus:', statusFormArray);
      // @ts-ignore
      const status = encodeJudgeStatusBuffer(...statusFormArray);
      this.ctx.app.io.of('/judger').to(`solution:${solutionId}`).emit('s', status);
      this.ctx.body = {
        success: true,
        data: {},
      };
    }
  }

  return JudgerController;
};
