import { codeMsgs, Codes } from '@/common/codes';
import util from 'util';
import { Context } from 'midway';
import { Application } from 'egg';
import { consoleColors, getString } from '@/utils/format';
import { EUserPermission, ECompetitionUserRole } from '@/common/enums';
import { EPerm, checkPermExpr } from '@/common/configs/perm.config';
import checkCompetitionUserRole from '@/common/utils/competition';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

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
      ctx,
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
    const cost = Date.now() - _start;
    isDev &&
      console.log(consoleColors.DEBUG(`[redis.get](${cost}ms)`), consoleColors.INFO(`[${k}]`), ret);
    isProd &&
      ctx
        .getLogger('redisLogger')
        .info(`[redis.get](${cost}ms) [${k}] [${getString(redisRet, 20)}]`);
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
      ctx,
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
    const cost = Date.now() - _start;
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.set](${cost}ms)`),
        consoleColors.INFO(`[${k}]`),
        value,
        expires,
      );
    isProd &&
      ctx
        .getLogger('redisLogger')
        .info(
          `[redis.set](${cost}ms) [${k}] [${getString(JSON.stringify(value), 20)}] [${expires}]`,
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
      ctx,
    } = getThis.call(this);
    const k = util.format(key, ...args);
    await redis.del(k);
    const cost = Date.now() - _start;
    isDev &&
      console.log(consoleColors.DEBUG(`[redis.del](${cost}ms)`), consoleColors.INFO(`[${k}]`));
    isProd && ctx.getLogger('redisLogger').info(`[redis.del](${cost}ms) [${k}]`);
  },

  /**
   * redis incr。
   * @param key redis key 配置
   * @param args key 格式化参数
   * @param expires 重设过期时间，单位为秒。如果传了 expires 且 incr 返回 1（key 已过期或不存在），则重设 ttl
   */
  async redisIncr(key: string, args: any[] = [], expires?: number): Promise<void> {
    const _start = Date.now();
    const {
      app: { redis },
      ctx,
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const incrValue = await redis.incr(k);
    const cost = Date.now() - _start;
    let incrNoneMsg = '';
    if (incrValue === 1) {
      incrNoneMsg += ' [incr nil/expired key]';
      if (expires) {
        await redis.expire(k, expires);
        incrNoneMsg += `(expire ${expires})`;
      }
    }
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.incr](${cost}ms)`),
        consoleColors.INFO(`[${k}]`),
        incrValue,
        incrNoneMsg,
      );
    isProd &&
      ctx
        .getLogger('redisLogger')
        .info(`[redis.incr](${cost}ms) [${k}] [${incrValue}]${incrNoneMsg}`);
  },

  /**
   * redis lrange。
   * @param key redis key 配置
   * @param args key 格式化参数
   * @param start 开始位置
   * @param stop 结束位置
   */
  async redisLrange<T = any>(key: string, args: any[] = [], start: number, end = -1): Promise<T[]> {
    const _start = Date.now();
    const {
      app: { redis },
      ctx,
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const redisRet = await redis.lrange(k, start, end);
    let ret = redisRet.map((r) => {
      try {
        if (r) {
          return JSON.parse(r);
        } else {
          return r ?? null;
        }
      } catch (e) {
        return r ?? null;
      }
    });
    const cost = Date.now() - _start;
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.lrange](${cost}ms)`),
        consoleColors.INFO(`[${k}]`),
        ret,
      );
    isProd &&
      ctx
        .getLogger('redisLogger')
        .info(`[redis.lrange](${cost}ms) [${k}] [${getString(redisRet, 20)}]`);
    return ret;
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
      ctx,
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const v = values.map((value) => (typeof value === 'object' ? JSON.stringify(value) : value));
    const number = await redis.rpush(k, ...v);
    const cost = Date.now() - _start;
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.rpush](${cost}ms)`),
        consoleColors.INFO(`[${k}]`),
        ...values,
        number,
      );
    isProd &&
      ctx
        .getLogger('redisLogger')
        .info(
          `[redis.rpush](${cost}ms) [${k}] [${getString(
            JSON.stringify([...values]),
            20,
          )}] [${number}]`,
        );
  },

  /**
   * redis keys
   *
   * 注意是否会存在性能问题
   * @param key redis key 配置
   * @param args key 格式化参数
   */
  async redisKeys(key: string, args: any[] = []): Promise<string[]> {
    const _start = Date.now();
    const {
      app: { redis },
      ctx,
    } = getThis.call(this);
    const k = util.format(key, ...args);
    const redisRet = await redis.keys(k);
    const ret = redisRet.filter((f) => f);
    const cost = Date.now() - _start;
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.keys](${cost}ms)`),
        consoleColors.INFO(`[${k}]`),
        ret,
      );
    isProd &&
      ctx.getLogger('redisLogger').info(`[redis.keys](${cost}ms) [${k}] [${getString(ret, 20)}]`);
    return ret;
  },

  /**
   * redis scan
   *
   * 注意是否会存在性能问题
   * @param key redis key 配置
   * @param args key 格式化参数
   * @param limit count
   */
  async redisScan(key: string, args: any[] = [], limit: number): Promise<string[]> {
    const _start = Date.now();
    const {
      app: { redis },
      ctx,
    } = getThis.call(this);
    const k = util.format(key, ...args);
    let cursor = '0';
    let redisRet: string[];
    const resSet = new Set<string>();
    do {
      [cursor, redisRet] = await redis.scan(cursor, 'match', k, 'count', limit);
      redisRet.forEach((r) => {
        if (r) {
          resSet.add(r);
        }
      });
    } while (cursor !== '0');
    const ret = Array.from(resSet);
    const cost = Date.now() - _start;
    isDev &&
      console.log(
        consoleColors.DEBUG(`[redis.scan](${cost}ms)`),
        consoleColors.INFO(`[${k}]`),
        consoleColors.INFO(`[${limit}]`),
        ret,
      );
    isProd &&
      ctx
        .getLogger('redisLogger')
        .info(`[redis.scan](${cost}ms) [${k}] [${limit}] [${getString(ret, 20)}]`);
    return ret;
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
   * @deprecated
   */
  isPerm() {
    const { ctx } = getThis.call(this);
    return ctx.session.permission! >= EUserPermission.teacher;
  },

  /**
   * 判断当前用户是否是管理员。
   * @deprecated
   */
  isAdmin() {
    const { ctx } = getThis.call(this);
    return ctx.session.permission! >= EUserPermission.admin;
  },

  /**
   * 判断当前用户是否是自己或权限人士（教师及以上）。
   * @param userId 要判断的 userId
   * @deprecated
   */
  isSelfOrPerm(userId: number | string) {
    const { ctx } = getThis.call(this);
    return ctx.session.userId === +userId || ctx.session.permission! >= EUserPermission.teacher;
  },

  /**
   * 判断当前用户是否是自己或管理员。
   * @param userId 要判断的 userId
   * @deprecated
   */
  isSelfOrAdmin(userId: number | string) {
    const { ctx } = getThis.call(this);
    return ctx.session.userId === +userId || ctx.session.permission! >= EUserPermission.admin;
  },

  /**
   * 判断当前用户是否有所有指定的权限（需保证 `ctx.permission` 已挂载）。
   * @param ...perms 要检查的权限表达式
   */
  checkPerms(...permExpr: (EPerm | EPerm[])[]) {
    const { ctx } = getThis.call(this);
    return checkPermExpr(permExpr, ctx.permissions);
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

  /**
   * 获取比赛 session。
   * @param competitionId competitionId
   */
  getCompetitionSession(competitionId: number) {
    const { ctx } = getThis.call(this);
    return ctx.session?.competitions?.[competitionId] ?? null;
  },

  /**
   * 判断是否已登录指定比赛。
   * @param competitionId 要判断的 competitionId
   */
  isCompetitionLoggedIn(competitionId: number) {
    const { ctx } = getThis.call(this);
    return !!ctx.session?.competitions?.[competitionId];
  },

  /**
   * 判断当前比赛用户是否符合指定的角色表达式。
   * @param competitionId competitionId
   * @param roleExpr 要检查的角色表达式
   */
  checkCompetitionRole(competitionId: number, roleExpr: ECompetitionUserRole[]) {
    const { ctx } = getThis.call(this);
    const role = ctx.session?.competitions?.[competitionId]?.role;
    if (typeof role !== 'number') {
      return false;
    }
    return checkCompetitionUserRole(roleExpr, role);
  },
};
