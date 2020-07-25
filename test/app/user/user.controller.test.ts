import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';
import { Codes, codeMsgs } from '@/common/codes';
import { pick } from 'lodash';

describe(basename(__filename), () => {
  describe(testUtils.controllerDesc(routesBe.getSession), () => {
    const url = routesBe.getSession.url;

    it('should work with session', async () => {
      app.mockContext({
        session: {
          userId: 1,
          username: 'root',
          nickname: 'hack',
          permission: 3,
          avatar: '',
        },
      });
      await app
        .httpRequest()
        .get(url)
        .expect(200)
        .expect({
          success: true,
          data: {
            userId: 1,
            username: 'root',
            nickname: 'hack',
            permission: 3,
            avatar: '',
          },
        });
    });

    it('should work without session', async () => {
      app.mockClassFunction('userService', 'isExists', (...args: any[]) => {
        console.log('? args', args);
        return true;
      });
      await app.httpRequest().get(url).expect(200).expect({
        success: true,
        data: null,
      });
    });
  });

  describe(testUtils.controllerDesc(routesBe.login), () => {
    const url = routesBe.login.url;

    it('should work with correct login info', async () => {
      const user = {
        userId: 1,
        username: 'root',
        nickname: 'hack',
        permission: 3,
        avatar: '',
      };
      app.mockClassFunction('userService', 'findOne', async () => user);
      const data = {
        loginName: 'user',
        password: 'pass',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: pick(user, ['userId', 'username', 'nickname', 'permission', 'avatar']),
        });
    });

    it('should work with incorrect login info', async () => {
      app.mockClassFunction('userService', 'findOne', async () => null);
      const data = {
        loginName: 'user',
        password: 'pass',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        code: Codes.USER_INCORRECT_LOGIN_INFO,
        msg: codeMsgs[Codes.USER_INCORRECT_LOGIN_INFO],
      });
    });
  });
});
