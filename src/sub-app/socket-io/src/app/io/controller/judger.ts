import { Application } from 'midway';
import { roomKey } from '../../../config/room';

module.exports = (app: Application) => {
  class JudgerController extends app.Controller {
    async subscribe() {
      const solutionIds: number[] = this.ctx.args[0];
      if (!Array.isArray(solutionIds) || solutionIds.length === 0) {
        return;
      }
      console.log(`[judger] client subscribe: ${solutionIds}`);
      solutionIds.forEach((solutionId) => {
        this.ctx.socket.join(roomKey.judgeStatus(solutionId));
        this.ctx.socket.emit('res', 'subscribed', solutionId);
      });
    }
  }

  return JudgerController;
};
