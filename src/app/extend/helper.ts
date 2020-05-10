import { codeMsgs, Codes } from '@/common/codes';
import * as util from 'util';
import { Context } from 'midway';
import { Application } from 'egg';
import { consoleColors } from '@/utils/format';
import { EUserPermission } from '@/common/enums';

const isDev = process.env.NODE_ENV === 'development';

interface IBaseContext {
  app: Application;
  ctx: Context;
  logger: any;
  service: any;
  config: any;
}

/**
 * 获取带类型的 this（ctx）。
 * 调用时需要绑定 this。
 */
function getThis(): IBaseContext {
  // @ts-ignore
  return this;
}

export default {
  /**
   * 格式化为成功返回。
   * @param data
   */
  rSuc(data?: any) {
    return {
      success: true,
      data,
    };
  },

  /**
   * 格式化为失败返回。
   * @param code
   * @param data
   */
  rFail(code: Codes, data?: any) {
    return {
      success: false,
      code,
      msg: codeMsgs[code],
      data,
    };
  },

  /**
   * 格式化为带分页的列表的返回。
   * @param page
   * @param limit
   * @param count
   * @param rows
   */
  rList({ page, limit, count, rows }: { page: number; limit: number; count: number; rows: any[] }) {
    return {
      success: true,
      data: {
        page,
        limit,
        count,
        rows,
      },
    };
  },

  /**
   * 格式化为不带分页的完整列表的返回。
   * @param count
   * @param rows
   */
  rFullList({ count, rows }: { count: number; rows: any[] }) {
    return {
      success: true,
      data: {
        count,
        rows,
      },
    };
  },

  /**
   * 获取 Redis key。
   * @param key redis key 配置
   * @param args key 格式化参数
   */
  async getRedisKey<T = any>(key: string, args: any[] = []): Promise<T | null> {
    const _start = Date.now();
    const {
      app: { redis },
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const redisRet = await redis.get(k);
    let ret;
    try {
      if (redisRet) {
        ret = JSON.parse(redisRet);
      } else {
        ret = redisRet ?? null;
      }
    } catch (e) {
      ret = redisRet ?? null;
    }
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.get](${Date.now() - _start}ms)`),
        consoleColors.INFO(`[${k}]`),
        ret,
      );
    return ret;
  },

  /**
   * 设置 Redis key。
   * @param key redis key 配置
   * @param args key 格式化参数
   * @param value 要设置的值
   * @param expires 过期时间，单位为秒，不传则不过期
   */
  async setRedisKey<T = any>(key: string, args: any[], value: T, expires?: number): Promise<void> {
    const _start = Date.now();
    const {
      app: { redis },
    } = getThis.call(this);
    const k = util.format(key, ...args);
    let v: any = value;
    if (!value) {
      v = null;
    } else if (typeof value === 'object') {
      v = JSON.stringify(value);
    }
    if (expires) {
      await redis.set(k, v, 'EX', expires);
    } else {
      await redis.set(k, v);
    }
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.set](${Date.now() - _start}ms)`),
        consoleColors.INFO(`[${k}]`),
        value,
        expires,
      );
  },

  /**
   * 删除 Redis key。
   * @param key redis key 配置
   * @param args key 格式化参数
   */
  async delRedisKey(key: string, args: any[] = []): Promise<void> {
    const _start = Date.now();
    const {
      app: { redis },
    } = getThis.call(this);
    const k = util.format(key, ...args);
    await redis.del(k);
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.del](${Date.now() - _start}ms)`),
        consoleColors.INFO(`[${k}]`),
      );
  },

  /**
   * 判断是否登录 OJ
   */
  isGlobalLoggedIn() {
    const { ctx } = getThis.call(this);
    return !!ctx.session.userId;
  },

  /**
   * 判断当前要操作的 userId 是否是自己。
   * @param userId 要判断的 userId
   */
  isSelf(userId: number) {
    const { ctx } = getThis.call(this);
    return ctx.session.userId === +userId;
  },

  /**
   * 判断当前用户是否是权限人士。
   */
  isPerm() {
    const { ctx } = getThis.call(this);
    return ctx.session.permission! >= EUserPermission.teacher;
  },

  /**
   * 判断当前用户是否是管理员。
   */
  isAdmin() {
    const { ctx } = getThis.call(this);
    return ctx.session.permission! >= EUserPermission.admin;
  },

  /**
   * 判断当前用户是否是自己或权限人士（教师及以上）。
   * @param userId 要判断的 userId
   */
  isSelfOrPerm(userId: number | string) {
    const { ctx } = getThis.call(this);
    return ctx.session.userId === +userId || ctx.session.permission! >= EUserPermission.teacher;
  },

  /**
   * 判断是否已登录指定比赛。
   * @param contestId 要判断的 contestId
   */
  isContestLoggedIn(contestId: number) {
    const { ctx } = getThis.call(this);
    return !!ctx.session.contests?.[contestId];
  },
};
