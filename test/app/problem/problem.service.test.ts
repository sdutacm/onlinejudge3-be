import { basename } from 'path';
import assert from 'power-assert';
import { app } from 'midway-mock/bootstrap';
import { TProblemModel } from '@/lib/models/problem.model';
import { CProblemService } from '@/app/problem/problem.service';
import {
  IMProblemServiceGetListRes,
  IMProblemServiceGetDetailRes,
  IMProblemServiceGetRelativeRes,
  IProblemModel,
} from '@/app/problem/problem.interface';
import { omit } from 'lodash';
import { TProblemTagModel } from '@/lib/models/problemTag.model';
import { TTagModel } from '@/lib/models/tag.model';

const mockDefaultFields = {
  title: 'mock_title',
  description: 'mock_desc',
  input: 'mock_input',
  output: 'mock_output',
  sampleInput: '1 2',
  sampleOutput: '3',
  hint: '',
  source: 'mock_source',
  author: 1,
  timeLimit: 1000,
  memoryLimit: 65536,
  createdAt: new Date('2020-01-01T00:00:00+08:00'),
  updatedAt: new Date('2020-01-01T00:00:00+08:00'),
};

async function getService() {
  return app.mockContext({}).requestContext.getAsync<CProblemService>('problemService');
}

describe(basename(__filename), () => {
  let problemModel: TProblemModel;
  let problemTagModel: TProblemTagModel;
  let tagModel: TTagModel;

  before(async () => {
    await app.redis.flushdb();
    problemModel = await app.applicationContext.getAsync('problemModel');
    problemTagModel = await app.applicationContext.getAsync('problemTagModel');
    tagModel = await app.applicationContext.getAsync('tagModel');
    await problemModel.destroy({ truncate: true, force: true });
    await problemTagModel.destroy({ truncate: true, force: true });
    await tagModel.destroy({ truncate: true, force: true });
    await problemModel.create({
      ...mockDefaultFields,
      problemId: 1000,
      title: 'p1000',
      source: 'SDUTACMPC',
      accepted: 1,
      submitted: 2,
    });
    await problemModel.create({
      ...mockDefaultFields,
      problemId: 1001,
      title: 'p1001',
      display: false,
    });
    await problemModel.create({
      ...mockDefaultFields,
      problemId: 1002,
      title: 'p1002',
      author: 3,
    });
    await tagModel.create({
      nameEn: 't1',
      createdAt: new Date('2020-01-01T00:00:00+08:00'),
    });
    await tagModel.create({
      nameEn: 't2',
      createdAt: new Date('2020-01-01T00:00:00+08:00'),
    });
    await tagModel.create({
      nameEn: 't3',
      hidden: true,
      createdAt: new Date('2020-01-01T00:00:00+08:00'),
    });
    await problemTagModel.create({
      problemId: 1000,
      tagId: 1,
    });
    await problemTagModel.create({
      problemId: 1000,
      tagId: 2,
    });
    await problemTagModel.create({
      problemId: 1000,
      tagId: 3,
    });
    await problemTagModel.create({
      problemId: 1002,
      tagId: 1,
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
      const expected: IMProblemServiceGetListRes = {
        count: 2,
        rows: [
          {
            problemId: 1000,
            title: 'p1000',
            source: 'SDUTACMPC',
            author: 1,
            difficulty: 0,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
            updatedAt: new Date(),
            accepted: 1,
            submitted: 2,
            display: true,
            tags: [
              {
                tagId: 1,
                nameEn: 't1',
                nameZhHans: '',
                nameZhHant: '',
                hidden: false,
                createdAt: new Date('2020-01-01T00:00:00+08:00'),
              },
              {
                tagId: 2,
                nameEn: 't2',
                nameZhHans: '',
                nameZhHant: '',
                hidden: false,
                createdAt: new Date('2020-01-01T00:00:00+08:00'),
              },
            ],
          },
        ],
      };
      res.rows.forEach((d) => delete d.updatedAt);
      expected.rows.forEach((d) => delete d.updatedAt);
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
      assert.strictEqual(res.count, 3);
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
      const lastProblemId = res.rows[0].problemId;
      res = await service.getList(
        {},
        {
          limit: 1,
          order: [['problemId', 'DESC']],
        },
      );
      assert.strictEqual(res.rows[0].problemId, lastProblemId);
    });

    it('should work with query', async () => {
      const service = await getService();
      // problemId
      let res = await service.getList({
        problemId: 1000,
      });
      assert.strictEqual(res.count, 1);
      assert.strictEqual(res.rows[0]?.problemId, 1000);
      // problemIds
      res = await service.getList({
        problemIds: [1000, 1002, 42],
      });
      assert.strictEqual(res.count, 2);
      // title
      res = await service.getList({
        title: 'p1000',
      });
      assert.strictEqual(res.count, 1);
      // source
      res = await service.getList({
        source: 'SDUTACMPC',
      });
      assert.strictEqual(res.count, 1);
      // author
      res = await service.getList({
        author: 3,
      });
      assert.strictEqual(res.count, 1);
      // tagIds
      res = await service.getList({
        tagIds: [1],
      });
      assert.strictEqual(res.count, 2);
    });
  });

  describe('getDetail()', () => {
    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:problem_detail:1',
        '{"problemId":1,"title":"p1","display":true,"createdAt":"2019-12-31T16:00:00.000Z"}',
      );
      let res = await service.getDetail(1);
      assert.deepStrictEqual(res, {
        problemId: 1,
        title: 'p1',
        display: true,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
      });
      await app.redis.del('cache:problem_detail:1');
      // 测试无缓存
      res = await service.getDetail(1000);
      // @ts-ignore
      const expected: IMProblemServiceGetDetailRes = {
        problemId: 1000,
        title: 'p1000',
        description: 'mock_desc',
        input: 'mock_input',
        output: 'mock_output',
        sampleInput: '1 2',
        sampleOutput: '3',
        hint: '',
        source: 'SDUTACMPC',
        author: 1,
        timeLimit: 1000,
        memoryLimit: 65536,
        accepted: 1,
        submitted: 2,
        difficulty: 0,
        spj: false,
        display: true,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
        updatedAt: new Date(),
        tags: [
          {
            tagId: 1,
            nameEn: 't1',
            nameZhHans: '',
            nameZhHant: '',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
          {
            tagId: 2,
            nameEn: 't2',
            nameZhHans: '',
            nameZhHant: '',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
        ],
      };
      assert.deepStrictEqual(omit(res, 'updatedAt'), omit(expected, 'updatedAt'));
      const cache = await app.redis.get('cache:problem_detail:1000');
      assert(cache);
      assert.deepStrictEqual(
        (cache as string).replace(/("updatedAt":"[\w\W]+?",)/, ''),
        '{"problemId":1000,"title":"p1000","description":"mock_desc","input":"mock_input","output":"mock_output","sampleInput":"1 2","sampleOutput":"3","hint":"","source":"SDUTACMPC","author":1,"timeLimit":1000,"memoryLimit":65536,"difficulty":0,"createdAt":"2019-12-31T16:00:00.000Z","accepted":1,"submitted":2,"spj":false,"display":true,"tags":[{"tagId":1,"nameEn":"t1","nameZhHans":"","nameZhHant":"","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"},{"tagId":2,"nameEn":"t2","nameZhHans":"","nameZhHant":"","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"}]}',
      );
    });

    it('should work with scope', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(1001, 'available'), null);
      assert(await app.redis.get('cache:problem_detail:1001'));
      // 当 scope 为 null 时，应可以查到数据
      assert(await service.getDetail(1001, null));
    });

    it('should return null when detail dost not exist', async () => {
      const service = await getService();
      assert.strictEqual(await service.getDetail(42), null);
      assert.strictEqual(await app.redis.get('cache:problem_detail:42'), '');
    });
  });

  describe('getRelative()', () => {
    before(async () => {
      await app.redis.del('cache:problem_detail:1000');
      await app.redis.del('cache:problem_detail:1001');
    });

    it('should work', async () => {
      const service = await getService();
      // 测试有缓存
      await app.redis.set(
        'cache:problem_detail:1',
        '{"problemId":1,"title":"p1","display":true,"createdAt":"2019-12-31T16:00:00.000Z"}',
      );
      let res = await service.getRelative([1]);
      assert.deepStrictEqual(res, {
        1: {
          problemId: 1,
          title: 'p1',
          display: true,
          createdAt: new Date('2020-01-01T00:00:00+08:00'),
        },
      });
      await app.redis.del('cache:problem_detail:1');
      // 测试无缓存
      res = await service.getRelative([1000, 42, 1001, 1000]);
      const expected: IMProblemServiceGetRelativeRes = {
        1000: {
          problemId: 1000,
          title: 'p1000',
          description: 'mock_desc',
          input: 'mock_input',
          output: 'mock_output',
          sampleInput: '1 2',
          sampleOutput: '3',
          hint: '',
          source: 'SDUTACMPC',
          author: 1,
          timeLimit: 1000,
          memoryLimit: 65536,
          accepted: 1,
          submitted: 2,
          difficulty: 0,
          spj: false,
          display: true,
          createdAt: new Date('2020-01-01T00:00:00+08:00'),
          updatedAt: new Date(),
          tags: [
            {
              tagId: 1,
              nameEn: 't1',
              nameZhHans: '',
              nameZhHant: '',
              hidden: false,
              createdAt: new Date('2020-01-01T00:00:00+08:00'),
            },
            {
              tagId: 2,
              nameEn: 't2',
              nameZhHans: '',
              nameZhHant: '',
              hidden: false,
              createdAt: new Date('2020-01-01T00:00:00+08:00'),
            },
          ],
        },
      };
      delete res[1000].updatedAt;
      delete expected[1000].updatedAt;
      assert.deepStrictEqual(res, expected);
      const cache = await app.redis.get('cache:problem_detail:1000');
      assert(cache);
      assert.deepStrictEqual(
        (cache as string).replace(/("updatedAt":"[\w\W]+?",)/, ''),
        '{"problemId":1000,"title":"p1000","description":"mock_desc","input":"mock_input","output":"mock_output","sampleInput":"1 2","sampleOutput":"3","hint":"","source":"SDUTACMPC","author":1,"timeLimit":1000,"memoryLimit":65536,"difficulty":0,"createdAt":"2019-12-31T16:00:00.000Z","accepted":1,"submitted":2,"spj":false,"display":true,"tags":[{"tagId":1,"nameEn":"t1","nameZhHans":"","nameZhHant":"","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"},{"tagId":2,"nameEn":"t2","nameZhHans":"","nameZhHant":"","hidden":false,"createdAt":"2019-12-31T16:00:00.000Z"}]}',
      );
      // 不在默认 scope 的也应被缓存
      assert(await app.redis.get('cache:problem_detail:1001'));
    });

    it('should work with scope', async () => {
      const service = await getService();
      const res = await service.getRelative([1001], null);
      assert(res[1001]);
    });
  });

  describe('findOne()', () => {
    it('should work', async () => {
      const service = await getService();
      const res = await service.findOne({
        title: 'p1000',
      });
      const expected: IMProblemServiceGetDetailRes = {
        problemId: 1000,
        title: 'p1000',
        description: 'mock_desc',
        input: 'mock_input',
        output: 'mock_output',
        sampleInput: '1 2',
        sampleOutput: '3',
        hint: '',
        source: 'SDUTACMPC',
        author: 1,
        timeLimit: 1000,
        memoryLimit: 65536,
        accepted: 1,
        submitted: 2,
        difficulty: 0,
        spj: false,
        display: true,
        createdAt: new Date('2020-01-01T00:00:00+08:00'),
        updatedAt: new Date(),
        tags: [
          {
            tagId: 1,
            nameEn: 't1',
            nameZhHans: '',
            nameZhHant: '',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
          {
            tagId: 2,
            nameEn: 't2',
            nameZhHans: '',
            nameZhHant: '',
            hidden: false,
            createdAt: new Date('2020-01-01T00:00:00+08:00'),
          },
        ],
      };
      assert.deepStrictEqual(omit(res, 'updatedAt'), omit(expected, 'updatedAt'));
      assert.strictEqual(
        await service.findOne({
          title: 'notexisted',
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
          title: 'p1000',
        }),
        true,
      );
      assert.strictEqual(
        await service.isExists({
          title: 'notexisted',
        }),
        false,
      );
    });
  });

  describe('create()', () => {
    it('should work', async () => {
      const service = await getService();
      const opt = {
        title: 'mock_create_title1',
        description: 'mock_create_description1',
        input: 'mock_create_input1',
        output: 'mock_create_output1',
        sampleInput: 'mock_create_sampleInput1',
        sampleOutput: 'mock_create_sampleOutput1',
        hint: 'mock_create_hint1',
        source: 'mock_create_source1',
        author: 1,
        timeLimit: 500,
        memoryLimit: 32768,
      };
      const problemId = await service.create(opt);
      assert(problemId);
      const problem = await problemModel
        .findOne({
          where: {
            problemId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IProblemModel));
      assert(problem);
      assert.strictEqual(problem?.title, opt.title);
      assert.strictEqual(problem?.description, opt.description);
      assert.strictEqual(problem?.input, opt.input);
      assert.strictEqual(problem?.output, opt.output);
      assert.strictEqual(problem?.sampleInput, opt.sampleInput);
      assert.strictEqual(problem?.sampleOutput, opt.sampleOutput);
      assert.strictEqual(problem?.hint, opt.hint);
      assert.strictEqual(problem?.source, opt.source);
      assert.strictEqual(problem?.author, opt.author);
      assert.strictEqual(problem?.timeLimit, opt.timeLimit);
      assert.strictEqual(problem?.memoryLimit, opt.memoryLimit);
    });
  });

  describe('update()', () => {
    it('should work', async () => {
      const service = await getService();
      const problemId = 1002;
      const opt = {
        title: 'mock_update_title1',
        description: 'mock_update_description1',
        input: 'mock_update_input1',
        output: 'mock_update_output1',
        sampleInput: 'mock_update_sampleInput1',
        sampleOutput: 'mock_update_sampleOutput1',
        hint: 'mock_update_hint1',
        source: 'mock_update_source1',
        timeLimit: 500,
        memoryLimit: 32768,
        display: false,
        spj: true,
        difficulty: 5,
      };
      let updated = await service.update(problemId, opt);
      assert(updated);
      const problem = await problemModel
        .findOne({
          where: {
            problemId,
          },
        })
        .then((d) => d && (d.get({ plain: true }) as IProblemModel));
      assert.strictEqual(problem?.title, opt.title);
      assert.strictEqual(problem?.description, opt.description);
      assert.strictEqual(problem?.input, opt.input);
      assert.strictEqual(problem?.output, opt.output);
      assert.strictEqual(problem?.sampleInput, opt.sampleInput);
      assert.strictEqual(problem?.sampleOutput, opt.sampleOutput);
      assert.strictEqual(problem?.hint, opt.hint);
      assert.strictEqual(problem?.source, opt.source);
      assert.strictEqual(problem?.timeLimit, opt.timeLimit);
      assert.strictEqual(problem?.memoryLimit, opt.memoryLimit);
      assert.strictEqual(problem?.display, opt.display);
      assert.strictEqual(problem?.spj, opt.spj);
      assert.strictEqual(problem?.difficulty, opt.difficulty);
      updated = await service.update(problemId, opt);
      assert(!updated);
    });
  });

  describe('clearDetailCache()', () => {
    it('should work', async () => {
      const service = await getService();
      await app.redis.set('cache:problem_detail:42', '{"problemId":42}');
      await service.clearDetailCache(42);
      assert.strictEqual(await app.redis.get('cache:problem_detail:42'), null);
    });
  });
});
