import { basename } from 'path';
import assert from 'power-assert';
import { app } from 'midway-mock/bootstrap';
import { TTagModel } from '@/lib/models/tag.model';
import { CTagService } from '@/app/tag/tag.service';
import {
  IMTagServiceGetDetailRes,
  IMTagServiceGetFullListRes,
  ITagModel,
} from '@/app/tag/tag.interface';
import { TProblemTagModel } from '@/lib/models/problemTag.model';

const mockDefaultFields = {
  nameEn: 'mock_nameEn',
  nameZhHans: 'mock_nameZhHans',
  nameZhHant: 'mock_nameZhHant',
  hidden: false,
  createdAt: new Date('2020-01-01T00:00:00+08:00'),
};

async function getService() {
  return app.mockContext({}).requestContext.getAsync<CTagService>('tagService');
}

describe(basename(__filename), () => {
  let tagModel: TTagModel;
  let problemTagModel: TProblemTagModel;

  before(async () => {
    await app.redis.flushdb();
    tagModel = await app.applicationContext.getAsync('tagModel');
    problemTagModel = await app.applicationContext.getAsync('problemTagModel');
    await tagModel.destroy({ truncate: true, force: true });
    await problemTagModel.destroy({ truncate: true, force: true });
    await tagModel.create({
      ...mockDefaultFields,
      nameEn: 't1',
    });
    await tagModel.create({
      ...mockDefaultFields,
      nameEn: 't2',
    });
    await tagModel.create({
      ...mockDefaultFields,
      nameEn: 't3',
      hidden: true,
    });
    await problemTagModel.create({
      problemId: 1000,
      tagId: 1,
    });
    await problemTagModel.create({
      problemId: 1000,
      tagId: 3,
    });
    await problemTagModel.create({
      problemId: 1001,
      tagId: 1,
    });
  });

  describe('getFullList()', () => {
    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:tag_list',
        '[{"tagId":1,"nameEn":"t1","nameZhHans":"mock_nameZhHans","nameZhHant":"mock_nameZhHant","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"}]',
      );
      let res = await service.getFullList();
      assert.deepStrictEqual(res, {
        count: 1,
        rows: [
          {
            tagId: 1,
            nameEn: 't1',
            nameZhHans: 'mock_nameZhHans',
            nameZhHant: 'mock_nameZhHant',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
        ],
      });
      await app.redis.del('cache:tag_list');
      // 测试无缓存
      res = await service.getFullList();
      const expected: IMTagServiceGetFullListRes = {
        count: 2,
        rows: [
          {
            tagId: 1,
            nameEn: 't1',
            nameZhHans: 'mock_nameZhHans',
            nameZhHant: 'mock_nameZhHant',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
          {
            tagId: 2,
            nameEn: 't2',
            nameZhHans: 'mock_nameZhHans',
            nameZhHant: 'mock_nameZhHant',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
        ],
      };
      assert.deepStrictEqual(res, expected);
      const cache = await app.redis.get('cache:tag_list');
      assert.strictEqual(
        cache,
        '[{"tagId":1,"nameEn":"t1","nameZhHans":"mock_nameZhHans","nameZhHant":"mock_nameZhHant","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"},{"tagId":2,"nameEn":"t2","nameZhHans":"mock_nameZhHans","nameZhHant":"mock_nameZhHant","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"}]',
      );
    });

    it('should work with scope', async () => {
      const service = await getService();
      const res = await service.getFullList(undefined, undefined, null);
      assert.strictEqual(res.count, 3);
    });
  });

  describe('getDetail()', () => {
    it('should work', async () => {
      const service = await getService();
      // 测试无缓存
      const res = await service.getDetail(1);
      // @ts-ignore
      const expected: IMTagServiceGetDetailRes = {
        tagId: 1,
        nameEn: 't1',
        nameZhHans: 'mock_nameZhHans',
        nameZhHant: 'mock_nameZhHant',
        hidden: false,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
      };
      assert.deepStrictEqual(res, expected);
    });

    it('should work with scope', async () => {
      const service = await getService();
      // 当 scope 为 null 时，应可以查到数据
      assert(await service.getDetail(3, null));
    });

    it('should return null when detail dost not exist', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(42), null);
    });
  });

  describe('create()', () => {
    it('should work', async () => {
      const service = await getService();
      const opt = {
        nameEn: 'mock_create_nameEn',
        nameZhHans: 'mock_create_nameZhHans',
        nameZhHant: 'mock_create_nameZhHant',
        hidden: true,
      };
      const tagId = await service.create(opt);
      assert(tagId);
      const tag = await tagModel
        .findOne({
          where: {
            tagId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as ITagModel));
      assert(tag);
      assert.strictEqual(tag?.nameEn, opt.nameEn);
      assert.strictEqual(tag?.nameZhHans, opt.nameZhHans);
      assert.strictEqual(tag?.nameZhHant, opt.nameZhHant);
      assert.strictEqual(tag?.hidden, opt.hidden);
    });
  });

  describe('update()', () => {
    it('should work', async () => {
      const service = await getService();
      const tagId = 4;
      const opt = {
        nameEn: 'mock_update_nameEn',
        nameZhHans: 'mock_update_nameZhHans',
        nameZhHant: 'mock_update_nameZhHant',
        hidden: false,
      };
      let updated = await service.update(tagId, opt);
      assert(updated);
      const tag = await tagModel
        .findOne({
          where: {
            tagId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as ITagModel));
      assert.strictEqual(tag?.nameEn, opt.nameEn);
      assert.strictEqual(tag?.nameZhHans, opt.nameZhHans);
      assert.strictEqual(tag?.nameZhHant, opt.nameZhHant);
      assert.strictEqual(tag?.hidden, opt.hidden);
      updated = await service.update(tagId, opt);
      assert(!updated);
    });
  });

  describe('clearFullListCache()', () => {
    it('should work', async () => {
      const service = await getService();
      await app.redis.set('cache:tag_list', '[]');
      await service.clearFullListCache();
      assert.strictEqual(await app.redis.get('cache:tag_list'), null);
    });
  });

  describe('getRelativeProblemIds()', () => {
    it('should work', async () => {
      const service = await getService();
      const res = await service.getRelativeProblemIds(1);
      assert.deepStrictEqual(res, [1000, 1001]);
    });
  });
});
