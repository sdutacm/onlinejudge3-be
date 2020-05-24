/* eslint-disable no-useless-call */
import {
  Context,
  KoaMiddlewareParamArray,
  get as midwayGet,
  post as midwayPost,
  put as midwayPut,
  patch as midwayPatch,
  del as midwayDelete,
} from 'midway';
import { Codes } from '@/common/codes';
import { defContract } from '@/typings/contract';
import { IRouteBeConfig, routesBe } from '@/common/routes';
import { ReqError } from '@/lib/global/error';

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
      ctx.id = pk ? +ctx.request.body[pk] : undefined;
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 通过 service 的 `getDetail()` 获取详情数据并挂载到 `ctx.detail`。
 * 需要先通过 @id() 挂载 `ctx.id`。
 */
export function getDetail(): MethodDecorator {
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
 * @param targetModule 手动指定 module，否则默认从 Controller 类的 meta 中取
 */
export function validate<T>(contractSchema: keyof T, targetModule?: string): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      let module: string;
      if (targetModule) {
        module = targetModule;
      } else {
        module = getMeta.call(this).module;
      }
      const contractName = `${module}Contract`;
      const moduleContract = await ctx.requestContext.getAsync(contractName);
      const schema = moduleContract[contractSchema] as defContract.ContractSchema;
      if (!schema) {
        throw new Error(`SchemaNotFound: ${contractName}.${contractSchema}`);
      }
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

/**
 * 使请求最后默认返回成功。
 * 相当于 `ctx.helper.rSuc()`。
 */
export function sucResp(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      const result = await method.call(this, ctx, ...rest);
      ctx.body = ctx.helper.rSuc();
      return result;
    };
  };
}

/**
 * 根据 Controller 返回来自动设置 ctx.body 完成响应。
 * 如果 return，则调用 `ctx.rSuc()` 响应；如果抛出 `ReqError`，则调用 `ctx.rFail()` 响应。
 */
export function autoResp(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      try {
        const result = await method.call(this, ctx, ...rest);
        ctx.body = ctx.helper.rSuc(result);
        return result;
      } catch (e) {
        if (e instanceof ReqError) {
          ctx.body = ctx.helper.rFail(e.code, e.data);
        } else {
          throw e;
        }
      }
    };
  };
}

/**
 * 解析 post 参数中的分页参数并挂载到 `ctx.pagination`。
 * @param default 默认分页参数
 */
export function pagination({
  limit: defaultLimit = 0,
  order: defaultOrder = [] as Array<[string, 'ASC' | 'DESC']>,
} = {}): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      let { page, limit, order } = ctx.request.body;
      page = +page || 1;
      limit = +limit || defaultLimit;
      order = order || defaultOrder;
      ctx.pagination = {
        page,
        offset: (page - 1) * limit,
        limit,
        order,
      };
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 根据 routesBe 的配置路由和校验。
 *
 * 整合了以下装饰器：
 * - midwayControllerRoute
 * - validate
 * - autoResp
 *
 * @routerOptions midway 路由装饰器参数
 */
export function route(
  routerOptions: {
    routerName?: string;
    middleware?: KoaMiddlewareParamArray;
  } = { middleware: [] },
): MethodDecorator {
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    /**
     * 要使用的装饰器列表，按顺序反向存储，方便最后套圈圈。
     *
     * 例如，想按此组合装饰器：
     * @f()
     * @g()
     * x() {}
     *
     * 其实际执行顺序为：
     * f(g(x))
     *
     * 则：
     * decorators = [g, f];
     * decorators.forEach(decorator => decorator(x));
     * => f(g(x))
     */
    const decorators: MethodDecorator[] = [];
    // @ts-ignore
    const routeConfig = routesBe[propertyKey] as IRouteBeConfig;
    const { method, url, contract } = routeConfig;
    let requestDecorator: MethodDecorator;
    switch (method.toUpperCase()) {
      case 'GET':
        requestDecorator = midwayGet(url, routerOptions);
        break;
      case 'POST':
        requestDecorator = midwayPost(url, routerOptions);
        break;
      case 'PUT':
        requestDecorator = midwayPut(url, routerOptions);
        break;
      case 'PATCH':
        requestDecorator = midwayPatch(url, routerOptions);
        break;
      case 'DELETE':
        requestDecorator = midwayDelete(url, routerOptions);
        break;
      default:
        throw new Error('Invalid request method for route: ' + method);
    }
    requestDecorator(target, propertyKey, descriptor);
    decorators.unshift(requestDecorator);
    if (contract.req) {
      const [module, contractSchema] = contract.req.split('.');
      decorators.unshift(validate(contractSchema, module));
    }
    decorators.unshift(autoResp());
    decorators.forEach((decorator) => decorator(target, propertyKey, descriptor));
  };
}

/**
 * 路由鉴权。
 * @param perm 要求的最低权限
 */
export function auth(perm: 'loggedIn' | 'perm' | 'admin'): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      switch (perm) {
        case 'loggedIn':
          if (!ctx.helper.isGlobalLoggedIn()) {
            ctx.body = ctx.helper.rFail(Codes.GENERAL_NOT_LOGGED_IN);
            return;
          }
          break;
        case 'perm':
          if (!ctx.helper.isPerm()) {
            ctx.body = ctx.helper.rFail(Codes.GENERAL_NO_PERMISSION);
            return;
          }
          break;
        case 'admin':
          if (!ctx.helper.isAdmin()) {
            ctx.body = ctx.helper.rFail(Codes.GENERAL_NO_PERMISSION);
            return;
          }
          break;
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}
