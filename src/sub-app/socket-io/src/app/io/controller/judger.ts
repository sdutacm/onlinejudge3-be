import { Application } from 'midway';
import { isPrivate as isPrivateIp } from 'ip';

/**
 * 编码评测状态。
 * @param solutionId
 * @param type 评测类型
 * @param result 评测结果
 * @param current 当前运行评测点
 * @param total 总评测点数量
 */
export function encodeJudgeStatusBuffer(
  solutionId: number,
  // type: river.JudgeType,
  type: number,
  // result: ESolutionResult,
  result: number,
  current?: number,
  total?: number,
) {
  const buffer = new ArrayBuffer(8);
  const dv = new DataView(buffer);
  dv.setUint32(0, solutionId);
  dv.setUint8(4, type);
  dv.setUint8(5, result);
  dv.setUint8(6, current || 0);
  dv.setUint8(7, total || 0);
  return buffer;
}

module.exports = (app: Application) => {
  class Controller extends app.Controller {
    async subscribe() {
      console.log('rooms:', this.ctx.socket.rooms);
      const solutionIds: number[] = this.ctx.args[0];
      console.log('subscribe:', solutionIds);
      solutionIds.forEach((solutionId) => {
        const room = `s:${solutionId}`;
        this.ctx.socket.join(room);
        this.ctx.socket.emit('res', `subscribed ${solutionId}`);
      });
    }

    async innerHttpAcceptPushStatus() {
      const statusFormArray = this.ctx.request.body as any[];
      if (!isPrivateIp(this.ctx.ip)) {
        this.ctx.status = 403;
        this.ctx.body = {
          success: false,
          code: -1,
          msg: '403',
        };
        return;
      }
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
      this.ctx.logger.info('innerHttpAcceptPushStatus', statusFormArray);
      // @ts-ignore
      const status = encodeJudgeStatusBuffer(...statusFormArray);
      this.ctx.app.io.of('/judger').to(`s:${solutionId}`).emit('s', status);
      this.ctx.body = {
        success: true,
        data: {},
      };
    }
  }
  return Controller;
};
