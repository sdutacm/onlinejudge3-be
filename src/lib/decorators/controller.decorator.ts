/* eslint-disable no-useless-call */
import { Context } from 'midway';
import { Codes } from '@/common/codes';
import { defContract } from '@/typings/contract';

/**
 * 获取 meta。
 * 需要绑定 this。
 */
function getMeta(): defMeta.BaseMeta {
  // @ts-ignore
  return this.meta;
}

/**
 * 获取 post 参数中的 id（`this.meta.pk`）并挂载到 `ctx.id`。
 */
export function id(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      const { pk } = getMeta.call(this);
      ctx.id = +ctx.request.body[pk];
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 通过 service 的 `getDetail()` 获取详情数据并挂载到 `ctx.detail`。
 * 需要先通过 @id() 挂载 `ctx.id`。
 */
export function detail(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      if (!ctx.id) {
        ctx.body = ctx.helper.rFail(Codes.GENERAL_ENTITY_NOT_EXIST);
        return;
      }
      // const service = await ctx.requestContext.getAsync(serviceName);
      // @ts-ignore
      const service = this.service;
      const detail = await service.getDetail(ctx.id);
      if (!detail) {
        ctx.body = ctx.helper.rFail(Codes.GENERAL_ENTITY_NOT_EXIST);
        return;
      }
      ctx.detail = detail;
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 从 Contract 中的 JSON Schema 验证表单。
 * @param contract 要使用的 Contract Schema，如 `getUserDetailReq`
 */
export function validate<T>(contractSchema: keyof T): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      const { module } = getMeta.call(this);
      const contractName = `${module}Contract`;
      const moduleContract = await ctx.requestContext.getAsync(contractName);
      const schema = moduleContract[contractSchema] as defContract.ContractSchema;
      const schemaValid = ctx.app.schemaValidator.validateSchema(schema);
      if (!schemaValid) {
        throw new Error(`SchemaInvalid: ${contractName}.${contractSchema}`);
      }
      const validate = ctx.app.schemaValidator.compile(schema);
      const res = validate(ctx.request.body);
      if (!res) {
        const errorMessage = ctx.app.schemaValidator
          .errorsText(validate.errors)
          .replace(/data./g, '');
        ctx.body = ctx.helper.rFail(Codes.GENERAL_REQUEST_PARAMS_ERROR, {
          msg: errorMessage,
          errors: validate.errors?.map((err) => ({
            field: err.dataPath.substr(1),
            msg: err.message,
          })),
        });
        return;
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}
