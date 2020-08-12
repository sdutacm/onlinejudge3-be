import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';
import { Codes, codeMsgs } from '@/common/codes';
import { pick } from 'lodash';
import { stringify } from 'querystring';
import { EUserPermission } from '@/common/enums';

describe(basename(__filename), () => {
  describe(testUtils.controllerDesc(routesBe.sendEmailVerification), () => {
    const url = routesBe.sendEmailVerification.url;

    it('should work with VerificationCode Not expired', async () => {
      const codeStore = {
        code: 123456,
        createdAt: '2020-08-11T16:00:00.000Z', // datetime str
      };
      app.mockClassFunction(
        'verificationService',
        'getEmailVerificationCode',
        async () => codeStore,
      );
      const re = {
        retryAfter: 1,
      };
      const data = {
        email: '1870893666@qq.com',
      }
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        data: { ...re },
        code: Codes.GENERAL_FLE,
        msg: codeMsgs[Codes.GENERAL_FLE],
      });
    });

    it('should work with VerificationCode expired', async () => {
      const codeStore = {
        code: 123456,
        createdAt: '2020-08-11T16:00:00.000Z', // datetime str
      };
      app.mockClassFunction(
        'verificationService',
        'getEmailVerificationCode',
        async () => codeStore,
      );

      const re = {
        retryAfter: 0,
      };
      const data = {
        email: '1870893666@qq.com',
      }
      await app.httpRequest().post(url).send(data).expect({
        success: true,
        data: { ...re },

      });
    });
  });
});
