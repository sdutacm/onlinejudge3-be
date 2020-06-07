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
import { consoleColors } from '@/utils/format';
import redisKey from '@/config/redisKey.config';
import { isPrivate as isPrivateIp } from 'ip';

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
 * 需要先通过 `@id()` 挂载 `ctx.id`。
 * 如果请求实体未找到，则直接拦截并响应请求错误。
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
 * 将 `ctx.detail` 作为详情数据响应。
 * 需要先通过 `@id()` 和 `getDetail()` 分别挂载 `ctx.id` 和 `ctx.detail`。
 */
export function respDetail(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      ctx.body = ctx.helper.rSuc(ctx.detail);
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 从 Contract 中的 JSON Schema 验证表单。
 * @param type 校验请求还是响应
 * @param contract 要使用的 Contract Schema，如 `getUserDetailReq`
 * @param targetModule 手动指定 module，否则默认从 Controller 类的 meta 中取
 */
export function validate<T>(
  type: 'req' | 'resp',
  contractSchema: keyof T,
  targetModule?: string,
): MethodDecorator {
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
      if (type === 'req') {
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
      }
      const result = await method.call(this, ctx, ...rest);
      if (type === 'resp' && ctx.body?.success) {
        // 先将 data 序列化为和响应相同的 JSON string，再解析，避免 Date 等类型的干扰
        const parsedRespData = JSON.parse(JSON.stringify(ctx.body.data));
        const res = validate(parsedRespData);
        if (!res) {
          const errorMessage = ctx.app.schemaValidator.errorsText(validate.errors);
          console.error(
            consoleColors.ERROR('[RespValidation.data]'),
            JSON.stringify(parsedRespData, null, '  '),
          );
          console.error(consoleColors.ERROR('[RespValidation.errorMessage]'), errorMessage);
          console.error(
            consoleColors.ERROR('[RespValidation.errors]'),
            JSON.stringify(validate.errors, null, '  '),
          );
          throw new Error('RespValidationFailed');
        }
      }
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
        if (!ctx.body) {
          ctx.body = ctx.helper.rSuc(result);
        }
        return result;
      } catch (e) {
        if (e instanceof ReqError) {
          if (!ctx.body) {
            ctx.body = ctx.helper.rFail(e.code, e.data);
          }
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
 * @param reservePagination 是否保留 request body 中的分页参数字段
 */
export function pagination(
  { limit: defaultLimit = 0, order: defaultOrder = [] as Array<[string, 'ASC' | 'DESC']> } = {},
  reservePagination = false,
): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      let { page, limit, order } = ctx.request.body;
      page = +page || 1;
      limit = +limit || defaultLimit;
      order = order || defaultOrder;
      if (!reservePagination) {
        delete ctx.request.body.page;
        delete ctx.request.body.limit;
        delete ctx.request.body.order;
      }
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
 * 通过 service 的 `getList()` 获取列表数据并挂载到 `ctx.list`。
 * 需要先通过 `@pagination()` 挂载 `ctx.pagination`。
 */
export function getList(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      const pagination = ctx.pagination;
      if (!pagination) {
        throw new Error('GetListPreCheckError: `ctx.pagination` is unmounted');
      }
      // const service = await ctx.requestContext.getAsync(serviceName);
      // @ts-ignore
      const service = this.service;
      const list = await service.getList(ctx.request.body, pagination);
      ctx.list = list;
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 将 `ctx.list` 作为列表数据响应。
 * 需要先通过 `@pagination()` 和 `getList()` 分别挂载 `ctx.pagination` 和 `ctx.list`。
 */
export function respList(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      const pagination = ctx.pagination;
      if (!pagination) {
        throw new Error('RespListPreCheckError: `ctx.pagination` is unmounted');
      }
      const list = ctx.list;
      if (!list) {
        throw new Error('RespListPreCheckError: `ctx.list` is unmounted');
      }
      ctx.body = ctx.helper.rSuc(
        ctx.helper.formatList(pagination.page, pagination.limit, list.count, list.rows),
      );
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 挂载请求所需基本信息。
 *
 * 初始挂载的属性：
 * - ctx.userId：当前登录用户 userId，如未登录则为 undefined
 * - ctx.loggedIn：是否登录
 */
function ctxBaseInfo(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      if (ctx.helper.isGlobalLoggedIn()) {
        ctx.userId = ctx.session.userId;
        ctx.loggedIn = true;
      } else {
        ctx.userId = undefined;
        ctx.loggedIn = false;
      }
      if (ctx.request.headers['content-type']?.startsWith('multipart/')) {
        const numberFields = ['userId'];
        numberFields.forEach((field) => {
          ctx.request.body[field] && (ctx.request.body[field] = +ctx.request.body[field]);
        });
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 根据 routesBe 配置路由和校验。
 *
 * 整合了以下装饰器：
 * - midwayControllerRoute
 * - ctxBaseInfo
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
        throw new Error(`RouteError: Invalid request method for route "${method}"`);
    }
    // requestDecorator(target, propertyKey, descriptor);
    decorators.unshift(requestDecorator);
    decorators.unshift(ctxBaseInfo());
    if (contract.req) {
      const [module, contractSchema] = contract.req.split('.');
      decorators.unshift(validate('req', contractSchema, module));
    }
    // 仅在开发环境下校验响应
    if (process.env.NODE_ENV === 'development' && contract.resp) {
      const [module, contractSchema] = contract.resp.split('.');
      decorators.unshift(validate('resp', contractSchema, module));
    }
    decorators.unshift(autoResp());
    decorators.forEach((decorator) => decorator(target, propertyKey, descriptor));
  };
}

/**
 * 验证登录态。
 */
export function login(): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      if (!ctx.helper.isGlobalLoggedIn()) {
        ctx.body = ctx.helper.rFail(Codes.GENERAL_NOT_LOGGED_IN);
        return;
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * auth 逻辑实现。
 * @param ctx
 * @param perm
 */
function authImpl(ctx: Context, perm: 'perm' | 'admin') {
  switch (perm) {
    case 'perm':
      if (!ctx.helper.isPerm()) {
        return false;
      }
      break;
    case 'admin':
      if (!ctx.helper.isAdmin()) {
        return false;
      }
      break;
  }
  return true;
}

/**
 * requireSelf 逻辑实现。
 * @param ctx
 * @param selectUserId
 */
function requireSelfImpl(ctx: Context, selectUserId?: (ctx: Context) => number) {
  const userId =
    selectUserId?.(ctx) ||
    ctx.request.body.userId ||
    ctx.detail?.userId ||
    ctx.detail?.user?.userId;
  if (!userId || ctx.session.userId !== userId) {
    return false;
  }
  return true;
}

/**
 * 鉴权。
 * @param perm 要求的最低权限
 */
export function auth(perm: 'perm' | 'admin'): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      if (!authImpl(ctx, perm)) {
        ctx.body = ctx.helper.rFail(Codes.GENERAL_NO_PERMISSION);
        return;
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 校验要操作的实体的所有者是否是当前登录用户。
 *
 * 用做校验的 userId 会按照如下顺序尝试获取：
 * - selectUserId(ctx)
 * - ctx.request.body.userId
 * - ctx.detail.userId（需要先使用 `@getDetail()`）
 * - ctx.detail.user.userId（需要先使用 `@getDetail()`）
 *
 * @param selectUserId 自定义如何取得实体所有者的 userId
 */
export function requireSelf(selectUserId?: (ctx: Context) => number): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      if (!requireSelfImpl(ctx, selectUserId)) {
        ctx.body = ctx.helper.rFail(Codes.GENERAL_NO_PERMISSION);
        return;
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 鉴权或校验要操作的实体的所有者是否是当前登录用户。
 * （先尝试鉴权，如果没有权限则校验实体所有者）
 * @param perm 要求的最低权限（参数同 `@auth()`）
 * @param selectUserId 自定义如何取得实体所有者的 userId（参数同 `@requireSelf()`）
 */
export function authOrRequireSelf(
  perm: 'perm' | 'admin',
  selectUserId?: (ctx: Context) => number,
): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (ctx: Context, ...rest: any[]) {
      if (!authImpl(ctx, perm) && !requireSelfImpl(ctx, selectUserId)) {
        ctx.body = ctx.helper.rFail(Codes.GENERAL_NO_PERMISSION);
        return;
      }
      const result = await method.call(this, ctx, ...rest);
      return result;
    };
  };
}

/**
 * 频率限制装饰器工厂工厂
 * @param type 限制类型
 */
function rateLimitFactoryFactory(
  type: 'ip' | 'user',
): (duration: number, maxCount: number) => MethodDecorator {
  return function (duration: number, maxCount: number) {
    if (!(duration > 0 && maxCount > 0)) {
      throw new Error('RateLimitParamsError: duration and maxCount should be > 0');
    }

    return function (_target, propertyKey, descriptor: PropertyDescriptor) {
      const method = descriptor.value;

      descriptor.value = async function (ctx: Context, ...rest: any[]) {
        let keyConfig: string;
        let keyArgs: any[] = [propertyKey];
        switch (type) {
          case 'ip': {
            keyConfig = redisKey.rateIp;
            const ip = ctx.ip;
            if (!isPrivateIp(ctx.ip)) {
              keyArgs.push(ip);
            }
            break;
          }
          case 'user': {
            keyConfig = redisKey.rateUser;
            const userId = ctx.session.userId;
            if (userId) {
              keyArgs.push(userId);
            }
          }
        }
        if (keyConfig && keyArgs.length === 2) {
          const rate = await ctx.helper.redisGet(keyConfig, keyArgs);
          if (rate) {
            if (+rate >= maxCount) {
              ctx.body = ctx.helper.rFail(Codes.GENERAL_FLE, {
                duration,
                maxCount,
              });
              return;
            }
            await ctx.helper.redisIncr(keyConfig, keyArgs);
          } else {
            await ctx.helper.redisSet(keyConfig, keyArgs, 1, duration);
          }
        }
        const result = await method.call(this, ctx, ...rest);
        return result;
      };
    };
  };
}

/**
 * 按 IP 频率限制。
 * @param duration 统计时间区间（s）
 * @param count 时间区间内最大请求次数
 */
export const rateLimitIp = rateLimitFactoryFactory('ip');

/**
 * 按用户频率限制。
 * @param duration 统计时间区间（s）
 * @param count 时间区间内最大次数
 */
export const rateLimitUser = rateLimitFactoryFactory('user');
