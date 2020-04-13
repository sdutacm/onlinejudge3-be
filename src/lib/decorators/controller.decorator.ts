/* eslint-disable no-useless-call */
import { Context } from 'midway';

export function requireDetail(
  getPkFromCtx: (ctx: Context) => number | string,
  serviceName: string,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('target', target);
    console.log('propertyKey', propertyKey);
    console.log('descriptor', descriptor);

    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      console.log(serviceName);
      const pk = getPkFromCtx(ctx);
      if (!pk) {
        ctx.body = ctx.helper.rFail(-1);
        return;
      }
      // const service = await ctx.requestContext.getAsync(serviceName);
      // @ts-ignore
      const service = this[serviceName];
      const detail = await service.getDetail(pk);
      if (!detail) {
        ctx.body = ctx.helper.rFail(-1);
        return;
      }
      ctx.detail = detail;
      const result = method.call(this, ctx, ...rest);
      return result;
    };
    return descriptor;
  };
}
