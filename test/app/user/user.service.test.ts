import { basename } from 'path';
import assert from 'power-assert';
import { app } from 'midway-mock/bootstrap';
import { TUserModel } from '@/lib/models/user.model';
import { CUserService } from '@/app/user/user.service';
import {
  IMUserServiceGetDetailRes,
  IMUserServiceGetListRes,
  IUserModel,
  IMUserServiceGetRelativeRes,
} from '@/app/user/user.interface';

const mockDefaultFields = {
  password: 'mock_password',
  email: 'mock@sdutacm.cn',
  permission: 0,
  avatar: '',
  bannerImage: '',
  school: '',
  college: '',
  major: '',
  class: '',
  rating: 0,
  ratingHistory: null,
  createdAt: new Date('2020-01-01T00:00:00+08:00'),
};

async function getService() {
  return app.mockContext({}).requestContext.getAsync<CUserService>('userService');
}

describe(basename(__filename), () => {
  let userModel: TUserModel;

  before(async () => {
    await app.redis.flushdb();
    userModel = await app.applicationContext.getAsync('userModel');
    await userModel.destroy({ truncate: true, force: true });
    await userModel.create({
      ...mockDefaultFields,
      userId: 1,
      username: 'root',
      nickname: 'hack',
      email: 'root@sdutacm.cn',
      permission: 3,
      forbidden: 0,
      verified: true,
      defaultLanguage: 'javascript',
    });
    await userModel.create({
      ...mockDefaultFields,
      userId: 2,
      username: 'sdut',
      nickname: 'jdfaksj',
      forbidden: 1,
    });
    await userModel.create({
      ...mockDefaultFields,
      userId: 3,
      username: 'user3',
      nickname: 'zxwjk01',
      email: 'u3@sdutacm.cn',
      school: 'Mock School: SSDUT',
      college: 'Mock College: JSJ',
      major: 'Mock Major: jk',
      class: 'Mock Class: jk1502',
      grade: '2015',
    });
    await userModel.create({
      ...mockDefaultFields,
      userId: 4,
      username: 'user4',
      nickname: 'zxwrj01',
      school: 'SDUT',
      college: 'JSJ',
      major: 'jk',
      class: 'jk1507',
      grade: '2016',
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
      const expected: IMUserServiceGetListRes = {
        count: 3,
        rows: [
          {
            userId: 1,
            username: 'root',
            nickname: 'hack',
            avatar: '',
            bannerImage: '',
            rating: 0,
            submitted: 0,
            accepted: 0,
            grade: '',
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
      const lastUserId = res.rows[0].userId;
      res = await service.getList(
        {},
        {
          limit: 1,
          order: [['userId', 'DESC']],
        },
      );
      assert.strictEqual(res.rows[0].userId, lastUserId);
    });

    it('should work with query', async () => {
      const service = await getService();
      // userId
      let res = await service.getList({
        userId: 3,
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.userId, 3);
      // username
      res = await service.getList({
        username: 'user3',
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.username, 'user3');
      // grade
      res = await service.getList({
        grade: '2015',
      });
      assert.strictEqual(res.count, 1);
      // nickname
      res = await service.getList({
        nickname: 'zxw',
      });
      assert.strictEqual(res.count, 2);
      res = await service.getList({
        nickname: 'zxwjk',
      });
      assert.strictEqual(res.count, 1);
      // school
      res = await service.getList({
        school: 'SDUT',
      });
      assert.strictEqual(res.count, 2);
      // college
      res = await service.getList({
        college: 'JSJ',
      });
      assert.strictEqual(res.count, 2);
      // major
      res = await service.getList({
        major: 'jk',
      });
      assert.strictEqual(res.count, 2);
      // class
      res = await service.getList({
        class: 'jk15',
      });
      assert.strictEqual(res.count, 2);
    });
  });

  describe('getDetail()', () => {
    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:user_detail:1',
        '{"userId":1,"username":"root_mock","createdAt":"2019-12-31T16:00:00.000Z"}',
      );
      let res = await service.getDetail(1);
      assert.deepStrictEqual(res, {
        userId: 1,
        username: 'root_mock',
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
      });
      await app.redis.del('cache:user_detail:1');
      // 测试无缓存
      res = await service.getDetail(1);
      const expected: IMUserServiceGetDetailRes = {
        userId: 1,
        username: 'root',
        nickname: 'hack',
        email: 'root@sdutacm.cn',
        submitted: 0,
        accepted: 0,
        permission: 3,
        avatar: '',
        bannerImage: '',
        school: '',
        college: '',
        major: '',
        class: '',
        grade: '',
        rating: 0,
        ratingHistory: null,
        defaultLanguage: 'javascript',
        settings: null,
        coin: 0,
        verified: true,
        lastTime: null,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
      };
      assert.deepStrictEqual(res, expected);
      assert.strictEqual(
        await app.redis.get('cache:user_detail:1'),
        '{"lastTime":null,"settings":null,"ratingHistory":null,"userId":1,"username":"root","nickname":"hack","email":"root@sdutacm.cn","submitted":0,"accepted":0,"permission":3,"avatar":"","bannerImage":"","school":"","college":"","major":"","class":"","grade":"","rating":0,"defaultLanguage":"javascript","coin":0,"verified":true,"createdAt":"2019-12-31T16:00:00.000Z"}',
      );
    });

    it('should work with scope', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(2, 'available'), null);
      // 默认 scope 时，结果为 null 时也应缓存
      assert.strictEqual(await app.redis.get('cache:user_detail:2'), '');
      // 当 scope 为 null 时，应可以查到数据
      assert(await service.getDetail(2, null));
    });

    it('should return null when detail dost not exist', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(1024), null);
      assert.strictEqual(await app.redis.get('cache:user_detail:1024'), '');
    });
  });

  describe('getRelative()', () => {
    before(async () => {
      await app.redis.del('cache:user_detail:1');
      await app.redis.del('cache:user_detail:2');
    });

    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:user_detail:1',
        '{"userId":1,"username":"root_mock","createdAt":"2019-12-31T16:00:00.000Z"}',
      );
      let res = await service.getRelative([1]);
      assert.deepStrictEqual(res, {
        1: {
          userId: 1,
          username: 'root_mock',
          createdAt: new Date('2020-01-01T00:00:00+08:00'),
        },
      });
      await app.redis.del('cache:user_detail:1');
      // 测试无缓存
      res = await service.getRelative([1, 1024, 1]);
      const expected: IMUserServiceGetRelativeRes = {
        1: {
          userId: 1,
          username: 'root',
          nickname: 'hack',
          email: 'root@sdutacm.cn',
          submitted: 0,
          accepted: 0,
          permission: 3,
          avatar: '',
          bannerImage: '',
          school: '',
          college: '',
          major: '',
          class: '',
          grade: '',
          rating: 0,
          ratingHistory: null,
          defaultLanguage: 'javascript',
          settings: null,
          coin: 0,
          verified: true,
          lastTime: null,
          createdAt: new Date('2020-01-01T00:00:00+08:00'),
        },
      };
      assert.deepStrictEqual(res, expected);
      assert.strictEqual(
        await app.redis.get('cache:user_detail:1'),
        '{"lastTime":null,"settings":null,"ratingHistory":null,"userId":1,"username":"root","nickname":"hack","email":"root@sdutacm.cn","submitted":0,"accepted":0,"permission":3,"avatar":"","bannerImage":"","school":"","college":"","major":"","class":"","grade":"","rating":0,"defaultLanguage":"javascript","coin":0,"verified":true,"createdAt":"2019-12-31T16:00:00.000Z"}',
      );
    });

    it('should work with scope', async () => {
      const service = await getService();
      await app.redis.set('cache:user_detail:2', '');
      // 即使之前有缓存为 null，也应忽略缓存从数据库拉取
      const res = await service.getRelative([2], null);
      assert(res[2]);
    });
  });

  describe('findOne()', () => {
    it('should work', async () => {
      const service = await getService();
      const res = await service.findOne({
        username: 'root',
      });
      const expected: IMUserServiceGetDetailRes = {
        userId: 1,
        username: 'root',
        nickname: 'hack',
        email: 'root@sdutacm.cn',
        submitted: 0,
        accepted: 0,
        permission: 3,
        avatar: '',
        bannerImage: '',
        school: '',
        college: '',
        major: '',
        class: '',
        grade: '',
        rating: 0,
        ratingHistory: null,
        defaultLanguage: 'javascript',
        settings: null,
        coin: 0,
        verified: true,
        lastTime: null,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
      };
      assert.deepStrictEqual(res, expected);
      assert.strictEqual(
        await service.findOne({
          nickname: 'hack--',
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
          username: 'root',
        }),
        true,
      );
      assert.strictEqual(
        await service.isExists({
          nickname: 'hack--',
        }),
        false,
      );
    });
  });

  describe('create()', () => {
    it('should work', async () => {
      const service = await getService();
      const opt = {
        username: 'mock_create_user1',
        nickname: 'mock_create_nick1',
        password: 'pass',
        email: 'test@sdutacm.cn',
        verified: true,
      };
      const userId = await service.create(opt);
      assert(userId);
      const user = await userModel
        .findOne({
          where: {
            userId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IUserModel));
      assert(user);
      assert.strictEqual(user?.username, opt.username);
      assert.strictEqual(user?.nickname, opt.nickname);
      assert.strictEqual(user?.password, opt.password);
      assert.strictEqual(user?.email, opt.email);
      assert.strictEqual(user?.verified, opt.verified);
    });
  });

  describe('update()', () => {
    it('should work', async () => {
      const service = await getService();
      const userId = 3;
      const opt = {
        verified: true,
        password: 'mock_update_password',
        email: 'mock_update@sdutacm.cn',
        permission: 1,
        avatar: 'mock_update.jpg',
        bannerImage: 'mock_update.png',
        school: 'mock_update_sdut',
        college: 'mock_update_jsj',
        major: 'mock_update_jk',
        class: 'mock_update_jk1507',
        site: 'https://mock_update.sdutacm.cn',
        accepted: 42,
        submitted: 100,
        rating: 1500,
        ratingHistory: [],
        forbidden: 1,
        lastIp: '127.0.0.1',
        lastTime: new Date('2020-01-01T00:00:00+08:00'),
      };
      let updated = await service.update(userId, opt);
      assert(updated);
      const user = await userModel
        .findOne({
          where: {
            userId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IUserModel));
      assert.strictEqual(user?.verified, opt.verified);
      assert.strictEqual(user?.password, opt.password);
      assert.strictEqual(user?.email, opt.email);
      assert.strictEqual(user?.permission, opt.permission);
      assert.strictEqual(user?.avatar, opt.avatar);
      assert.strictEqual(user?.bannerImage, opt.bannerImage);
      assert.strictEqual(user?.school, opt.school);
      assert.strictEqual(user?.college, opt.college);
      assert.strictEqual(user?.major, opt.major);
      assert.strictEqual(user?.class, opt.class);
      assert.strictEqual(user?.site, opt.site);
      assert.strictEqual(user?.accepted, opt.accepted);
      assert.strictEqual(user?.submitted, opt.submitted);
      assert.strictEqual(user?.rating, opt.rating);
      assert.deepStrictEqual(user?.ratingHistory, opt.ratingHistory);
      assert.strictEqual(user?.forbidden, opt.forbidden);
      assert.strictEqual(user?.lastIp, opt.lastIp);
      assert.deepStrictEqual(user?.lastTime, opt.lastTime);
      updated = await service.update(userId, opt);
      assert(!updated);
    });
  });

  describe('clearDetailCache()', () => {
    it('should work', async () => {
      const service = await getService();
      await app.redis.set('cache:user_detail:3', '{"userId":3}');
      await service.clearDetailCache(3);
      assert.strictEqual(await app.redis.get('cache:user_detail:3'), null);
    });
  });

  describe('isUsernameExists()', () => {
    it('should work', async () => {
      const service = await getService();
      assert.strictEqual(await service.isUsernameExists('root'), true);
      assert.strictEqual(await service.isUsernameExists('root--'), false);
    });
  });

  describe('isNicknameExists()', () => {
    it('should work', async () => {
      const service = await getService();
      assert.strictEqual(await service.isNicknameExists('hack'), true);
      assert.strictEqual(await service.isNicknameExists('hack--'), false);
    });
  });

  describe('isEmailExists()', () => {
    it('should work', async () => {
      const service = await getService();
      assert.strictEqual(await service.isEmailExists('root@sdutacm.cn'), true);
      assert.strictEqual(await service.isEmailExists('u3@sdutacm.cn'), false);
      assert.strictEqual(await service.isEmailExists('null@example.com'), false);
    });
  });
});
