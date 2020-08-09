import { codeMsgs, Codes } from '@/common/codes';
import util from 'util';
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
   * 格式化为带分页的列表数据。
   * @param page
   * @param limit
   * @param count
   * @param rows
   */
  formatList(page: number, limit: number, count: number, rows: any[]) {
    return {
      page,
      limit,
      count,
      rows,
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
   * 格式化为不带分页的完整列表数据。
   * @param count
   * @param rows
   */
  formatFullList(count: number, rows: any[]) {
    return {
      count,
      rows,
    };
  },

  /**
   * redis get。
   * @param key redis key 配置
   * @param args key 格式化参数
   */
  async redisGet<T = any>(key: string, args: any[] = []): Promise<T | null> {
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
   * redis set。
   * @param key redis key 配置
   * @param args key 格式化参数
   * @param value 要设置的值
   * @param expires 过期时间，单位为秒，不传则不过期
   */
  async redisSet<T = any>(key: string, args: any[], value: T, expires?: number): Promise<void> {
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
   * redis del。
   * @param key redis key 配置
   * @param args key 格式化参数
   */
  async redisDel(key: string, args: any[] = []): Promise<void> {
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
   * redis incr。
   * @param key redis key 配置
   * @param args key 格式化参数
   */
  async redisIncr(key: string, args: any[] = []): Promise<void> {
    const _start = Date.now();
    const {
      app: { redis },
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const incrValue = await redis.incr(k);
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.incr](${Date.now() - _start}ms)`),
        consoleColors.INFO(`[${k}]`),
        incrValue,
      );
  },

  /**
   * redis rpush
   * @param key redis key 配置
   * @param args key 格式化参数
   * @param values 要推入的数据
   */
  async redisRpush(key: string, args: any[] = [], ...values: any[]): Promise<void> {
    const _start = Date.now();
    const {
      app: { redis },
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const v = values.map((value) => (typeof value === 'object' ? JSON.stringify(value) : value));
    const number = await redis.rpush(k, ...v);
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.rpush](${Date.now() - _start}ms)`),
        consoleColors.INFO(`[${k}]`),
        ...values,
        number,
      );
  },

  /**
   * 获取 OJ session。
   */
  getGlobalSession() {
    const { ctx } = getThis.call(this);
    if (ctx.session.userId) {
      return {
        userId: ctx.session.userId,
        username: ctx.session.username,
        nickname: ctx.session.nickname,
        permission: ctx.session.permission,
        avatar: ctx.session.avatar,
      };
    }
    return null;
  },

  /**
   * 判断是否登录 OJ。
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
   * 获取比赛 session。
   * @param contestId contestId
   */
  getContestSession(contestId: number) {
    const { ctx } = getThis.call(this);
    return ctx.session.contests?.[contestId] ?? null;
  },

  /**
   * 判断是否已登录指定比赛。
   * @param contestId 要判断的 contestId
   */
  isContestLoggedIn(contestId: number) {
    const { ctx } = getThis.call(this);
    return !!ctx.session.contests?.[contestId];
  },

  /**
   * 判断比赛是否未开始。
   * @param contest 要判断的比赛实例
   */
  isContestPending({ startAt }: { startAt: Date }) {
    const now = new Date();
    return now < startAt;
  },

  /**
   * 判断比赛是否正在进行。
   * @param contest 要判断的比赛实例
   */
  isContestRunning({ startAt, endAt }: { startAt: Date; endAt: Date }) {
    const now = new Date();
    return now >= startAt && now < endAt;
  },

  /**
   * 判断比赛是否已结束。
   * @param contest 要判断的比赛实例
   */
  isContestEnded({ endAt }: { endAt: Date }) {
    const now = new Date();
    return now >= endAt;
  },
};
