import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';

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
      await app.httpRequest().get(url).expect(200).expect({
        success: true,
        data: null,
      });
    });
  });
});
