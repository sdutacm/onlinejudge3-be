import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';
import { Codes, codeMsgs } from '@/common/codes';
import { pick } from 'lodash';
import { stringify } from 'querystring';
import { EUserPermission } from '@/common/enums';

describe(basename(__filename), () => {
  describe(testUtils.controllerDesc(routesBe.getTagFullList), () => {
    const url = routesBe.getTagFullList.url;

    it('should work', async () => {
      const fList = {
        count: 1,
        rows: [
          {
            tagId: 1,
            nameEn: 'string',
            nameZhHans: 'string',
            nameZhHant: 'string',
            hidden: 1,
            createdAt: 'string',
          },
        ],
      };
      app.mockClassFunction('tagService', 'getFullList', async () => fList);

      const data = {
        _scope: 'available',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { ...fList },
        });
    });
  });

  describe(testUtils.controllerDesc(routesBe.createTag), () => {
    const url = routesBe.createTag.url;

    it('should work', async () => {
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
      const tagId = 1;
      app.mockClassFunction('tagService', 'create', async () => tagId);

      const data = {
        nameEn: 'string',
        nameZhHans: 'string',
        nameZhHant: 'string',
        hidden: true,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
        data: { tagId },
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.updateTagDetail), () => {
    const url = routesBe.updateTagDetail.url;

    it('should work', async () => {
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
      const re = {
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
            createdAt: '',
          },
        ],
        createdAt: '',
        updatedAt: '',
      };

      const problemIds = 1;
      app.mockClassFunction('tagService', 'getDetail', async () => re);
      app.mockClassFunction('tagService', 'update', async () => null);

      const data = {
        tagId: 1,
        nameEn: 'string',
        nameZhHans: 'string',
        nameZhHant: 'string',
        hidden: true,
      };
      await app.httpRequest().post(url).send(data).expect({
        success: true,
      });
    });
  });
});
