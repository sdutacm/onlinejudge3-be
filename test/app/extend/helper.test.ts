import { basename } from 'path';
import { app, assert } from 'midway-mock/bootstrap';
import * as sleep from 'sleep-promise';

const mockSessions = {
  root: {
    userId: 1,
    username: 'root',
    nickname: 'hack',
    permission: 3,
    avatar: '',
    contests: {},
  },
  test: {
    userId: 3,
    username: 'test',
    nickname: 'test',
    permission: 0,
    avatar: '',
    contests: {},
  },
  perm: {
    userId: 4,
    username: 'perm',
    nickname: 'perm',
    permission: 1,
    avatar: '',
    contests: {},
  },
};

describe(basename(__filename), () => {
  before(async () => {
    await app.redis.flushdb();
  });

  describe('rSuc()', () => {
    it('should return success with no data', async () => {
      const ctx = app.mockContext();
      assert.deepStrictEqual(ctx.helper.rSuc(), { success: true, data: undefined });
    });

    it('should return success with data', async () => {
      const ctx = app.mockContext();
      assert.deepStrictEqual(ctx.helper.rSuc(1), { success: true, data: 1 });
      assert.deepStrictEqual(ctx.helper.rSuc('test method'), {
        success: true,
        data: 'test method',
      });
      assert.deepStrictEqual(ctx.helper.rSuc({ test: '5' }), {
        success: true,
        data: { test: '5' },
      });
      assert.deepStrictEqual(ctx.helper.rSuc(['a', 5, { b: 10 }]), {
        success: true,
        data: ['a', 5, { b: 10 }],
      });
    });
  });

  describe('rFail()', () => {
    it('should return fail with no data', async () => {
      const ctx = app.mockContext();
      assert.deepStrictEqual(ctx.helper.rFail(1), {
        success: false,
        code: 1,
        msg: 'Unknown Error',
        data: undefined,
      });
    });

    it('should return fail with data', async () => {
      const ctx = app.mockContext();
      assert.deepStrictEqual(ctx.helper.rFail(2, { foo: 'bar' }), {
        success: false,
        code: 2,
        msg: 'Illegal Request',
        data: { foo: 'bar' },
      });
    });
  });

  describe('rList()', () => {
    it('should return list', async () => {
      const ctx = app.mockContext();
      assert.deepStrictEqual(
        ctx.helper.rList({
          page: 1,
          limit: 2,
          count: 32,
          rows: [
            { userId: 1, username: 'root' },
            { userId: 2, username: 'sdut' },
          ],
        }),
        {
          success: true,
          data: {
            page: 1,
            limit: 2,
            count: 32,
            rows: [
              { userId: 1, username: 'root' },
              { userId: 2, username: 'sdut' },
            ],
          },
        },
      );
    });
  });

  describe('rFullList()', () => {
    it('should return full list', async () => {
      const ctx = app.mockContext();
      assert.deepStrictEqual(
        ctx.helper.rFullList({
          count: 32,
          rows: [
            { userId: 1, username: 'root' },
            { userId: 2, username: 'sdut' },
          ],
        }),
        {
          success: true,
          data: {
            count: 32,
            rows: [
              { userId: 1, username: 'root' },
              { userId: 2, username: 'sdut' },
            ],
          },
        },
      );
    });
  });

  describe('getRedisKey()', () => {
    it('should get without key formating', async () => {
      const ctx = app.mockContext();
      await app.redis.set('test:helper:get_0', 'test0');
      assert.strictEqual(await ctx.helper.getRedisKey('test:helper:get_0'), 'test0');
    });

    it('should get string with key formating', async () => {
      const ctx = app.mockContext();
      await app.redis.set('test:helper:get_1', 'test1');
      assert.strictEqual(await ctx.helper.getRedisKey('test:helper:get_%s', ['1']), 'test1');
    });

    it('should get object with key formating', async () => {
      const ctx = app.mockContext();
      await app.redis.set('test:helper:get_2', '{"data":["test",0,false,{"foo":"bar"}]}');
      assert.deepStrictEqual(await ctx.helper.getRedisKey('test:helper:get_%s', ['2']), {
        data: ['test', 0, false, { foo: 'bar' }],
      });
    });
  });

  describe('setRedisKey()', () => {
    it('should set without key formating', async () => {
      const ctx = app.mockContext();
      await ctx.helper.setRedisKey('test:helper:set_0', [], 'test0');
      assert.strictEqual(await app.redis.get('test:helper:set_0'), 'test0');
    });

    it('should set object with key formating', async () => {
      const ctx = app.mockContext();
      await ctx.helper.setRedisKey('test:helper:set_%s', ['1'], {
        data: ['test', 0, false, { foo: 'bar' }],
      });
      assert.deepStrictEqual(
        await app.redis.get('test:helper:set_1'),
        '{"data":["test",0,false,{"foo":"bar"}]}',
      );
    });

    it('should set expire time with key formating', async () => {
      const ctx = app.mockContext();
      await ctx.helper.setRedisKey('test:helper:set_%s', ['2'], 'test2', 1);
      assert.strictEqual(await app.redis.get('test:helper:set_2'), 'test2');
      await sleep(1500);
      assert.strictEqual(await app.redis.get('test:helper:set_2'), null);
    });
  });

  describe('delRedisKey()', () => {
    it('should delete without key formating', async () => {
      const ctx = app.mockContext();
      await app.redis.set('test:helper:del_0', 'test0');
      await ctx.helper.delRedisKey('test:helper:del_0');
      assert.strictEqual(await app.redis.get('test:helper:del_0'), null);
    });

    it('should delete with key formating', async () => {
      const ctx = app.mockContext();
      await app.redis.set('test:helper:del_1', 'test1');
      await ctx.helper.delRedisKey('test:helper:del_%s', ['1']);
      assert.strictEqual(await app.redis.get('test:helper:del_1'), null);
    });
  });

  describe('isGlobalLoggedIn()', () => {
    it('should return false when no session', async () => {
      const ctx = app.mockContext({
        session: {},
      });
      assert.strictEqual(ctx.helper.isGlobalLoggedIn(), false);
    });

    it('should return true when session expires', async () => {
      const ctx = app.mockContext({
        session: {
          userId: 1,
          username: 'root',
          nickname: 'hack',
          permission: 3,
          avatar: '',
        },
      });
      assert.strictEqual(ctx.helper.isGlobalLoggedIn(), true);
    });
  });

  describe('isSelf()', () => {
    it('should return false when no session', async () => {
      const ctx = app.mockContext({
        session: {},
      });
      assert.strictEqual(ctx.helper.isSelf(1), false);
    });

    it('should return true when specified user is self', async () => {
      const ctx = app.mockContext({
        session: mockSessions.root,
      });
      assert.strictEqual(ctx.helper.isSelf(1), true);
    });

    it('should return false when specified user is not self', async () => {
      const ctx = app.mockContext({
        session: mockSessions.root,
      });
      assert.strictEqual(ctx.helper.isSelf(2), false);
    });
  });

  describe('isPerm()', () => {
    it('should return false when no session', async () => {
      const ctx = app.mockContext({
        session: {},
      });
      assert.strictEqual(ctx.helper.isPerm(), false);
    });

    it('should return false when specified user is normal', async () => {
      const ctx = app.mockContext({
        session: mockSessions.test,
      });
      assert.strictEqual(ctx.helper.isPerm(), false);
    });

    it('should return true when specified user is perm', async () => {
      const ctx = app.mockContext({
        session: mockSessions.perm,
      });
      assert.strictEqual(ctx.helper.isPerm(), true);
    });

    it('should return true when specified user is admin', async () => {
      const ctx = app.mockContext({
        session: mockSessions.root,
      });
      assert.strictEqual(ctx.helper.isPerm(), true);
    });
  });

  describe('isAdmin()', () => {
    it('should return false when no session', async () => {
      const ctx = app.mockContext({
        session: {},
      });
      assert.strictEqual(ctx.helper.isAdmin(), false);
    });

    it('should return false when specified user is normal', async () => {
      const ctx = app.mockContext({
        session: mockSessions.test,
      });
      assert.strictEqual(ctx.helper.isAdmin(), false);
    });

    it('should return false when specified user is perm', async () => {
      const ctx = app.mockContext({
        session: mockSessions.perm,
      });
      assert.strictEqual(ctx.helper.isAdmin(), false);
    });

    it('should return true when specified user is admin', async () => {
      const ctx = app.mockContext({
        session: mockSessions.root,
      });
      assert.strictEqual(ctx.helper.isAdmin(), true);
    });
  });

  describe('isSelfOrPerm()', () => {
    it('should return false when no session', async () => {
      const ctx = app.mockContext({
        session: {},
      });
      assert.strictEqual(ctx.helper.isSelfOrPerm(1), false);
    });

    it('should return true when specified user is normal and self', async () => {
      const ctx = app.mockContext({
        session: mockSessions.test,
      });
      assert.strictEqual(ctx.helper.isSelfOrPerm(3), true);
    });

    it('should return false when specified user is normal and not self', async () => {
      const ctx = app.mockContext({
        session: mockSessions.test,
      });
      assert.strictEqual(ctx.helper.isSelfOrPerm(42), false);
    });

    it('should return true when specified user is perm and not self', async () => {
      const ctx = app.mockContext({
        session: mockSessions.perm,
      });
      assert.strictEqual(ctx.helper.isSelfOrPerm(42), true);
    });

    it('should return true when specified user is admin and not self', async () => {
      const ctx = app.mockContext({
        session: mockSessions.root,
      });
      assert.strictEqual(ctx.helper.isSelfOrPerm(42), true);
    });
  });

  describe('isContestLoggedIn()', () => {
    it('should return false when no session', async () => {
      const ctx = app.mockContext({
        session: {},
      });
      assert.strictEqual(ctx.helper.isContestLoggedIn(1000), false);
    });

    it('should return true when has contest session', async () => {
      const ctx = app.mockContext({
        session: {
          ...mockSessions.root,
          contests: {
            1000: true,
          },
        },
      });
      assert.strictEqual(ctx.helper.isContestLoggedIn(1000), true);
    });

    it('should return false when has not contest session', async () => {
      const ctx = app.mockContext({
        session: {
          ...mockSessions.root,
          contests: {
            1000: true,
          },
        },
      });
      assert.strictEqual(ctx.helper.isContestLoggedIn(1001), false);
    });
  });
});
