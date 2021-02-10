import { Context } from 'midway';

module.exports = () => {
  return async (ctx: Context, next: Function) => {
    console.log('packet', ctx.packet);
    ctx.socket.emit('res', 'packet!');
    await next();
    console.log('packet response!');
  };
};
