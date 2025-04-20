import { Application } from 'midway';
import { checkEmitAuth } from '../utils/auth';
import { ParameterException } from '../../../exceptions/parameter';

module.exports = (app: Application) => {
  class EmitController extends app.Controller {
    async healthCheck() {
      console.log(`[healthCheck] from ip:`, this.ctx.ip);
      this.ctx.status = 200;
      this.ctx.body = {
        success: true,
        code: 0,
      };
    }

    async innerHttpEmit() {
      if (!checkEmitAuth(this.ctx, this.config)) {
        this.ctx.status = 403;
        this.ctx.body = {
          success: false,
          code: -1,
          msg: '403',
        };
        return;
      }
      if (!this.ctx.params.action || !/^[a-zA-Z0-9_-]+$/.test(this.ctx.params.action)) {
        this.ctx.status = 404;
        this.ctx.body = {
          success: false,
          code: 8,
          msg: 'Invalid action',
        };
        return;
      }
      // @warn 允许任意 action 存在潜在安全风险
      try {
        const res = await this.ctx.service.emit[this.ctx.params.action](this.ctx.request.body);
        this.ctx.body = {
          success: true,
          code: 0,
          data: res,
        };
      } catch (e) {
        if (e instanceof ParameterException) {
          this.ctx.status = 422;
          this.ctx.body = {
            success: false,
            code: 8,
            msg: e.message,
          };
          return;
        }
        this.ctx.logger.error('[emit.innerHttpEmit] Uncaught:', e);
        this.ctx.status = 500;
        this.ctx.body = {
          success: false,
          code: -1,
          msg: 'Internal Server Error',
        };
      }
    }
  }

  return EmitController;
};
