import { Application, Context } from 'midway';

module.exports = (app: Application) => {
  return async (ctx: Context, next: Function) => {
    // ctx.socket.emit('res', 'connected!');
    // await next();
    // // execute when disconnect.
    // console.log('disconnection!');

    ctx.socket.emit('res', 'auth!');
    await next();
    console.log('disconnect!');
  };
};
