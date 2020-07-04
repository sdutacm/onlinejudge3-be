import { basename } from 'path';
import assert from 'power-assert';
import { app } from 'midway-mock/bootstrap';
import { TContestModel } from '@/lib/models/contest.model';
import { TUserContestModel } from '@/lib/models/userContest.model';
import { CContestService } from '@/app/contest/contest.service';
import {
  IMContestServiceGetDetailRes,
  IMContestServiceGetListRes,
  IContestModel,
  IMContestServiceGetRelativeRes,
} from '@/app/contest/contest.interface';

const mockDefaultFields = {
  title: 'mock_title',
  type: 3,
  category: 0,
  mode: 0,
  intro: '',
  description: 'mock_description',
  password: '',
  startAt: new Date('2020-01-01T09:00:00+08:00'),
  endAt: new Date('2020-01-01T14:00:00+08:00'),
  frozenLength: 0,
  registerStartAt: null,
  registerEndAt: null,
  team: false,
  ended: false,
  hidden: false,
};

async function getService() {
  return app.mockContext({}).requestContext.getAsync<CContestService>('contestService');
}

describe(basename(__filename), () => {
  let contestModel: TContestModel;
  let userContestModel: TUserContestModel;

  before(async () => {
    await app.redis.flushdb();
    contestModel = await app.applicationContext.getAsync('contestModel');
    userContestModel = await app.applicationContext.getAsync('userContestModel');
    await contestModel.destroy({ truncate: true, force: true });
    await userContestModel.destroy({ truncate: true, force: true });
    await contestModel.create({
      ...mockDefaultFields,
      contestId: 1000,
      title: 'c1000',
    });
    await contestModel.create({
      ...mockDefaultFields,
      contestId: 1001,
      title: 'c1001',
      type: 1,
      password: 'mock_password',
    });
    await contestModel.create({
      ...mockDefaultFields,
      contestId: 1002,
      title: 'c1002',
      type: 2,
      category: 1,
      mode: 1,
      intro: 'mock_intro',
      frozenLength: 3600,
      registerStartAt: new Date('2020-01-01T00:00:00+08:00'),
      registerEndAt: new Date('2020-01-01T01:00:00+08:00'),
      team: true,
    });
    await contestModel.create({
      ...mockDefaultFields,
      contestId: 1003,
      title: 'c1003',
      hidden: true,
    });
    await userContestModel.create({
      userId: 1,
      contestId: 1000,
    });
  });

  describe('getList()', () => {
    it('should work', async () => {
      const service = await getService();
      const res = await service.getList(
        {},
        {
          limit: 1,
        },
      );
      const expected: IMContestServiceGetListRes = {
        count: 3,
        rows: [
          {
            contestId: 1000,
            title: 'c1000',
            type: 3,
            category: 0,
            mode: 0,
            startAt: new Date('2020-01-01T09:00:00+08:00'),
            endAt: new Date('2020-01-01T14:00:00+08:00'),
            registerStartAt: null,
            registerEndAt: null,
            team: false,
            hidden: false,
          },
        ],
      };
      assert.deepStrictEqual(res, expected);
    });

    it('should work with scope', async () => {
      const service = await getService();
      const res = await service.getList(
        {},
        {
          limit: 1,
        },
        null,
      );
      assert.strictEqual(res.count, 4);
    });

    it('should work with pagination', async () => {
      const service = await getService();
      let res = await service.getList(
        {},
        {
          limit: 1,
        },
      );
      const count = res.count;
      const limit = count - 1;
      res = await service.getList(
        {},
        {
          limit,
          offset: 0,
        },
      );
      assert.strictEqual(res.rows.length, limit);
      res = await service.getList(
        {},
        {
          limit,
          offset: limit,
        },
      );
      assert.strictEqual(res.rows.length, 1);
      const lastContestId = res.rows[0].contestId;
      res = await service.getList(
        {},
        {
          limit: 1,
          order: [['contestId', 'DESC']],
        },
      );
      assert.strictEqual(res.rows[0].contestId, lastContestId);
    });

    it('should work with query', async () => {
      const service = await getService();
      // contestId
      let res = await service.getList({
        contestId: 1000,
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.contestId, 1000);
      // contestIds
      res = await service.getList({
        contestIds: [1000, 1002, 42],
      });
      assert.strictEqual(res.count, 2);
      // title
      res = await service.getList({
        title: 'c1000',
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.title, 'c1000');
      // type
      res = await service.getList({
        type: 2,
      });
      assert.strictEqual(res.count, 1);
      // category
      res = await service.getList({
        category: 1,
      });
      assert.strictEqual(res.count, 1);
      // mode
      res = await service.getList({
        mode: 1,
      });
      assert.strictEqual(res.count, 1);
      // hidden
      res = await service.getList({
        hidden: true,
      });
      assert.strictEqual(res.count, 1);
      // userId
      res = await service.getList({
        userId: 1,
      });
      assert.strictEqual(res.count, 1);
    });
  });

  describe('getDetail()', () => {
    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:contest_detail:1000',
        '{"contestId":1000,"title":"mock","startAt":"2019-12-31T16:00:00.000Z","endAt":"2019-12-31T16:00:00.000Z","hidden":false}',
      );
      let res = await service.getDetail(1000);
      assert.deepStrictEqual(res, {
        contestId: 1000,
        title: 'mock',
        startAt: new Date('2020-01-01T00:00:00+08:00'),
        endAt: new Date('2020-01-01T00:00:00+08:00'),
        hidden: false,
      });
      await app.redis.del('cache:contest_detail:1000');
      // 测试无缓存
      res = await service.getDetail(1000);
      const expected: IMContestServiceGetDetailRes = {
        contestId: 1000,
        title: 'c1000',
        type: 3,
        category: 0,
        mode: 0,
        intro: '',
        description: 'mock_description',
        password: '',
        startAt: new Date('2020-01-01T09:00:00+08:00'),
        endAt: new Date('2020-01-01T14:00:00+08:00'),
        registerStartAt: null,
        registerEndAt: null,
        frozenLength: 0,
        team: false,
        ended: false,
        hidden: false,
      };
      assert.deepStrictEqual(res, expected);
      assert.strictEqual(
        await app.redis.get('cache:contest_detail:1000'),
        '{"registerStartAt":null,"registerEndAt":null,"contestId":1000,"title":"c1000","type":3,"category":0,"mode":0,"intro":"","description":"mock_description","password":"","startAt":"2020-01-01T01:00:00.000Z","endAt":"2020-01-01T06:00:00.000Z","frozenLength":0,"team":false,"ended":false,"hidden":false}',
      );
    });

    it('should work with scope', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(1003, 'available'), null);
      assert(await app.redis.get('cache:contest_detail:1003'));
      // 当 scope 为 null 时，应可以查到数据
      assert(await service.getDetail(1003, null));
    });

    it('should return null when detail dost not exist', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(42), null);
      assert.strictEqual(await app.redis.get('cache:contest_detail:42'), '');
    });
  });

  describe('getRelative()', () => {
    before(async () => {
      await app.redis.del('cache:contest_detail:1000');
      await app.redis.del('cache:contest_detail:1003');
      await app.redis.del('cache:contest_detail:42');
    });

    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:contest_detail:1000',
        '{"contestId":1000,"title":"mock","startAt":"2019-12-31T16:00:00.000Z","endAt":"2019-12-31T16:00:00.000Z","hidden":false}',
      );
      let res = await service.getRelative([1000]);
      assert.deepStrictEqual(res, {
        1000: {
          contestId: 1000,
          title: 'mock',
          startAt: new Date('2020-01-01T00:00:00+08:00'),
          endAt: new Date('2020-01-01T00:00:00+08:00'),
          hidden: false,
        },
      });
      await app.redis.del('cache:contest_detail:1000');
      // 测试无缓存
      res = await service.getRelative([1000, 42, 1003, 1000]);
      const expected: IMContestServiceGetRelativeRes = {
        1000: {
          contestId: 1000,
          title: 'c1000',
          type: 3,
          category: 0,
          mode: 0,
          intro: '',
          description: 'mock_description',
          password: '',
          startAt: new Date('2020-01-01T09:00:00+08:00'),
          endAt: new Date('2020-01-01T14:00:00+08:00'),
          registerStartAt: null,
          registerEndAt: null,
          frozenLength: 0,
          team: false,
          ended: false,
          hidden: false,
        },
      };
      assert.deepStrictEqual(res, expected);
      assert.strictEqual(
        await app.redis.get('cache:contest_detail:1000'),
        '{"registerStartAt":null,"registerEndAt":null,"contestId":1000,"title":"c1000","type":3,"category":0,"mode":0,"intro":"","description":"mock_description","password":"","startAt":"2020-01-01T01:00:00.000Z","endAt":"2020-01-01T06:00:00.000Z","frozenLength":0,"team":false,"ended":false,"hidden":false}',
      );
      assert.strictEqual(await app.redis.get('cache:contest_detail:42'), '');
      // 不在默认 scope 的也应被缓存
      assert(await app.redis.get('cache:contest_detail:1003'));
    });

    it('should work with scope', async () => {
      const service = await getService();
      const res = await service.getRelative([1003], null);
      assert(res[1003]);
    });
  });

  describe('findOne()', () => {
    it('should work', async () => {
      const service = await getService();
      const res = await service.findOne({
        title: 'c1000',
      });
      const expected: IMContestServiceGetDetailRes = {
        contestId: 1000,
        title: 'c1000',
        type: 3,
        category: 0,
        mode: 0,
        intro: '',
        description: 'mock_description',
        password: '',
        startAt: new Date('2020-01-01T09:00:00+08:00'),
        endAt: new Date('2020-01-01T14:00:00+08:00'),
        registerStartAt: null,
        registerEndAt: null,
        frozenLength: 0,
        team: false,
        ended: false,
        hidden: false,
      };
      assert.deepStrictEqual(res, expected);
      assert.strictEqual(
        await service.findOne({
          title: 'notexist--',
        }),
        null,
      );
    });
  });

  describe('isExists()', () => {
    it('should work', async () => {
      const service = await getService();
      assert.strictEqual(
        await service.isExists({
          title: 'c1000',
        }),
        true,
      );
      assert.strictEqual(
        await service.isExists({
          title: 'notexist--',
        }),
        false,
      );
    });
  });

  describe('create()', () => {
    it('should work', async () => {
      const service = await getService();
      const opt = {
        title: 'mock_create_title',
        description: 'mock_create_description',
        intro: 'mock_create_intro',
        type: 2,
        category: 1,
        mode: 1,
        password: 'mock_create_password',
        author: 1,
        startAt: new Date('2020-01-01T09:00:00+08:00'),
        endAt: new Date('2020-01-01T14:00:00+08:00'),
        frozenLength: 3600,
        registerStartAt: new Date('2020-01-01T00:00:00+08:00'),
        registerEndAt: new Date('2020-01-01T01:00:00+08:00'),
        team: true,
        hidden: false,
      };
      const contestId = await service.create(opt);
      assert(contestId);
      const contest = await contestModel
        .findOne({
          where: {
            contestId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IContestModel));
      assert(contest);
      assert.strictEqual(contest?.title, opt.title);
      assert.strictEqual(contest?.description, opt.description);
      assert.strictEqual(contest?.intro, opt.intro);
      assert.strictEqual(contest?.type, opt.type);
      assert.strictEqual(contest?.category, opt.category);
      assert.strictEqual(contest?.mode, opt.mode);
      assert.strictEqual(contest?.password, opt.password);
      assert.strictEqual(contest?.author, opt.author);
      assert.deepStrictEqual(contest?.startAt, opt.startAt);
      assert.deepStrictEqual(contest?.endAt, opt.endAt);
      assert.strictEqual(contest?.frozenLength, opt.frozenLength);
      assert.deepStrictEqual(contest?.registerStartAt, opt.registerStartAt);
      assert.deepStrictEqual(contest?.registerEndAt, opt.registerEndAt);
      assert.strictEqual(contest?.team, opt.team);
      assert.strictEqual(contest?.hidden, opt.hidden);
    });
  });

  describe('update()', () => {
    it('should work', async () => {
      const service = await getService();
      const contestId = 1003;
      const opt = {
        title: 'mock_update_title',
        description: 'mock_update_description',
        intro: 'mock_update_intro',
        type: 2,
        category: 1,
        mode: 1,
        password: 'mock_update_password',
        author: 2,
        startAt: new Date('2020-01-01T00:00:00+08:00'),
        endAt: new Date('2020-01-01T00:00:00+08:00'),
        frozenLength: 3600,
        registerStartAt: new Date('2020-01-01T00:00:00+08:00'),
        registerEndAt: new Date('2020-01-01T01:00:00+08:00'),
        team: true,
        hidden: false,
      };
      let updated = await service.update(contestId, opt);
      assert(updated);
      const contest = await contestModel
        .findOne({
          where: {
            contestId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IContestModel));
      assert.strictEqual(contest?.title, opt.title);
      assert.strictEqual(contest?.description, opt.description);
      assert.strictEqual(contest?.intro, opt.intro);
      assert.strictEqual(contest?.type, opt.type);
      assert.strictEqual(contest?.category, opt.category);
      assert.strictEqual(contest?.mode, opt.mode);
      assert.strictEqual(contest?.password, opt.password);
      assert.strictEqual(contest?.author, opt.author);
      assert.deepStrictEqual(contest?.startAt, opt.startAt);
      assert.deepStrictEqual(contest?.endAt, opt.endAt);
      assert.strictEqual(contest?.frozenLength, opt.frozenLength);
      assert.deepStrictEqual(contest?.registerStartAt, opt.registerStartAt);
      assert.deepStrictEqual(contest?.registerEndAt, opt.registerEndAt);
      assert.strictEqual(contest?.team, opt.team);
      assert.strictEqual(contest?.hidden, opt.hidden);
      updated = await service.update(contestId, opt);
      assert(!updated);
    });
  });

  describe('clearDetailCache()', () => {
    it('should work', async () => {
      const service = await getService();
      await app.redis.set('cache:contest_detail:1002', '{"contestId":1002}');
      await service.clearDetailCache(1002);
      assert.strictEqual(await app.redis.get('cache:contest_detail:1002'), null);
    });
  });
});
