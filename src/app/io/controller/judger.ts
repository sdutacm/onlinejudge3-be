import { Application } from 'midway';

module.exports = (app: Application) => {
  class Controller extends app.Controller {
    async subscribe() {
      const solutionIds: number[] = this.ctx.args[0];
      console.log('subscribe:', solutionIds);
      solutionIds.forEach((solutionId) => {
        const room = `s:${solutionId}`;
        this.ctx.socket.join(room);
        this.ctx.socket.emit('res', `subscribed ${solutionId}`);
      });
    }
  }
  return Controller;
};
