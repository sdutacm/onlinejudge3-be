import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';
import { Codes, codeMsgs } from '@/common/codes';
import { pick } from 'lodash';
import { stringify } from 'querystring';
import { EUserPermission } from '@/common/enums';

const commonProblemDetailMap = {
  problemId: 1,
  title: 'string',
  description: 'string',
  input: 'string',
  output: 'string',
  sampleInput: 'string',
  sampleOutput: 'string',
  hint: 'string',
  source: 'string',
  author: 1,
  timeLimit: 1,
  memoryLimit: 1,
  difficulty: 1,
  accepted: 1,
  submitted: 1,
  spj: true,
  display: true,
  tags: [
    {
      tagId: 1,
      nameEn: 'string',
      nameZhHans: 'string',
      nameZhHant: 'string',
      hidden: true,
      createdAt: '2020-08-01T16:00:00.000Z',
    },
  ],
  createdAt: '2020-08-01T16:00:00.000Z',
  updatedAt: '2020-08-01T16:00:00.000Z',
};

describe(basename(__filename), () => {
  describe(testUtils.controllerDesc(routesBe.getProblemList), () => {
    const url = routesBe.getProblemList.url;

    it('should work with correct info', async () => {
      const re = {
        count: 1,
        rows: [
          {
            problemId: 1,
            title: 'string',
            source: 'string',
            author: 1,
            difficulty: 1,
            accepted: 1,
            submitted: 1,
            display: true,
            tags: [
              {
                tagId: 1,
                nameEn: 'string',
                nameZhHans: 'string',
                nameZhHant: 'string',
                hidden: true,
                createdAt: '2020-08-02T16:00:00.000Z',
              },
            ],

            createdAt: '2020-08-02T16:00:00.000Z',
            updatedAt: '2020-08-02T16:00:00.000Z',
          },
        ],
      };
      app.mockClassFunction('problemService', 'getList', async () => re);

      const data = {
        page: 1,
        limit: 10,
        order: [
          ['problemId', 'ASC'],
          ['problemId', 'ASC'],
        ],
        problemId: 1,
        problemIds: [1],
        title: 'string',
        source: 'string',
        author: 1,
        tagIds: [1],
        _scope: 'available',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { page: 1, limit: 10, ...re },
        });
    });
  });

  describe(testUtils.controllerDesc(routesBe.getProblemDetail), () => {
    const url = routesBe.getProblemDetail.url;

    it('should work with correct info', async () => {
      app.mockClassFunction('problemService', 'getDetail', async () => commonProblemDetailMap);

      const data = {
        problemId: 1,
        _scope: 'available',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: commonProblemDetailMap,
        });
    });
  });

  describe(testUtils.controllerDesc(routesBe.createProblem), () => {
    const url = routesBe.createProblem.url;
    it('should work with correct info', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: EUserPermission.admin,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });
      const problemId = 2;
      app.mockClassFunction('problemService', 'create', async () => problemId);
      const data = {
        title: 'string',
        description: 'string',
        input: 'string',
        output: 'string',
        sampleInput: 'string',
        sampleOutput: 'string',
        hint: 'string',
        source: 'string',
        timeLimit: 1,
        memoryLimit: 10,
        difficulty: 1,
        spj: true,
        display: true,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
        data: { problemId },
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.updateProblemDetail), () => {
    const url = routesBe.updateProblemDetail.url;

    it('should work with correct info', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: EUserPermission.admin,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });
      app.mockClassFunction('problemService', 'getDetail', async () => commonProblemDetailMap);
      app.mockClassFunction('problemService', 'update', async () => null);

      const data = {
        problemId: 1,
        title: 'string',
        description: 'string',
        input: 'string',
        output: 'string',
        sampleInput: 'string',
        sampleOutput: 'string',
        hint: 'string',
        source: 'string',
        timeLimit: 1,
        memoryLimit: 1,
        difficulty: 1,
        spj: true,
        display: true,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.setProblemTags), () => {
    const url = routesBe.setProblemTags.url;

    it('should work with correct info', async () => {
      const session = {
        userId: 1,
        username: 'test',
        nickname: 'nick',
        permission: EUserPermission.admin,
        avatar: '',
        contests: {},
      };
      app.mockContext({
        session,
      });

      app.mockClassFunction('problemService', 'getDetail', async () => commonProblemDetailMap);

      const data = {
        problemId: 1,
        tagIds: [1],
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });
  });
});
