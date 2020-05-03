import { basename } from 'path';
import { app, assert } from 'midway-mock/bootstrap';
import { TUserModel } from '@/lib/models/user.model';
import { CUserService } from '@/app/users/users.service';
import {
  IMUserServiceGetDetailRes,
  IMUserServiceGetListRes,
  IUserModel,
} from '@/app/users/users.interface';

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

describe(basename(__filename), () => {
  let userModel: TUserModel;
  let userService: CUserService;

  before(async () => {
    userModel = await app.applicationContext.getAsync('userModel');
    userService = await app.applicationContext.getAsync('userService');
    await userModel.destroy({ truncate: true, force: true });
    await userModel.create({
      ...mockDefaultFields,
      userId: 1,
      username: 'root',
      nickname: 'hack',
      email: 'root@sdutacm.cn',
      permission: 3,
      forbidden: 0,
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
      const res = await userService.getList(
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
          },
        ],
      };
      assert.deepStrictEqual(res, expected);
    });

    it('should work with scope', async () => {
      const res = await userService.getList(
        {},
        {
          limit: 1,
        },
        null,
      );
      assert.strictEqual(res.count, 4);
    });

    it('should work with pagination', async () => {
      let res = await userService.getList(
        {},
        {
          limit: 1,
        },
      );
      const count = res.count;
      const limit = count - 1;
      res = await userService.getList(
        {},
        {
          limit,
          offset: 0,
        },
      );
      assert.strictEqual(res.rows.length, limit);
      res = await userService.getList(
        {},
        {
          limit,
          offset: limit,
        },
      );
      assert.strictEqual(res.rows.length, 1);
      const lastUserId = res.rows[0].userId;
      res = await userService.getList(
        {},
        {
          limit: 1,
          order: [['userId', 'DESC']],
        },
      );
      assert.strictEqual(res.rows[0].userId, lastUserId);
    });

    it('should work with query', async () => {
      // userId
      let res = await userService.getList({
        userId: 3,
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.userId, 3);
      // username
      res = await userService.getList({
        username: 'user3',
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.username, 'user3');
      // grade
      res = await userService.getList({
        grade: '2015',
      });
      assert.strictEqual(res.count, 1);
      // nickname
      res = await userService.getList({
        nickname: 'zxw',
      });
      assert.strictEqual(res.count, 2);
      res = await userService.getList({
        nickname: 'zxwjk',
      });
      assert.strictEqual(res.count, 1);
      // school
      res = await userService.getList({
        school: 'SDUT',
      });
      assert.strictEqual(res.count, 2);
      // college
      res = await userService.getList({
        college: 'JSJ',
      });
      assert.strictEqual(res.count, 2);
      // major
      res = await userService.getList({
        major: 'jk',
      });
      assert.strictEqual(res.count, 2);
      // class
      res = await userService.getList({
        class: 'jk15',
      });
      assert.strictEqual(res.count, 2);
    });
  });

  describe('getDetail()', () => {
    it('should work', async () => {
      const res = await userService.getDetail(1);
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
        rating: 0,
        ratingHistory: null,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
      };
      assert.deepStrictEqual(res, expected);
    });

    it('should work with scope', async () => {
      assert.strictEqual(await userService.getDetail(2, 'available'), null);
      assert(await userService.getDetail(2, null));
    });

    it('should return null when detail dost not exist', async () => {
      assert.strictEqual(await userService.getDetail(1024), null);
    });
  });

  describe('create()', () => {
    it('should work', async () => {
      const opt = {
        username: 'mock_create_user1',
        nickname: 'mock_create_nick1',
        password: 'pass',
        email: 'test@sdutacm.cn',
      };
      const userId = await userService.create(opt);
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
    });
  });

  describe('update()', () => {
    it('should work', async () => {
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
      let updated = await userService.update(userId, opt);
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
      updated = await userService.update(userId, opt);
      assert(!updated);
    });
  });
});
