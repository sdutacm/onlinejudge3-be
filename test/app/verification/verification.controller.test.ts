import { basename } from 'path';
import { app } from 'midway-mock/bootstrap';
import testUtils from 'test/utils';
import { routesBe } from '@/common/routes';
import { Codes, codeMsgs } from '@/common/codes';
import { pick } from 'lodash';
import { stringify } from 'querystring';
import { EUserPermission } from '@/common/enums';
import sleep from 'sleep-promise';

describe(basename(__filename), () => {
  describe(testUtils.controllerDesc(routesBe.sendEmailVerification), () => {
    const url = routesBe.sendEmailVerification.url;
    it('should work with the first VerificationCode ', async () => {
      const newCode = {
        code: 123456,
        createdAt: '',
      };
      app.mockClassFunction('verificationService', 'getEmailVerificationCode', async () => null);
      app.mockClassFunction(
        'verificationService',
        'createEmailVerificationCode',
        async () => newCode,
      );

      const re = {
        retryAfter: 60,
      };
      const data = {
        email: '1870893666@qq.com',
      };
      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { ...re },
        });
    });

    it('should work with frequency Request', async () => {
      const codeStore = {
        code: 123456,
        createdAt: new Date(Date.now() - 1000).toISOString(), // datetime str
      };

      app.mockClassFunction(
        'verificationService',
        'getEmailVerificationCode',
        async () => codeStore,
      );

      const retryAfter = 59;
      // Date.now() - new Date(codeStore.createdAt).getTime()
      const data = {
        email: '1870893666@qq.com',
      };
      await app.httpRequest().post(url).send(data).expect({
        success: false,
        data: { retryAfter },
        code: Codes.GENERAL_FLE,
        msg: codeMsgs[Codes.GENERAL_FLE],
      });
    });

    it('should work with time over 60s', async () => {
      const codeStore = {
        code: 123456,
        createdAt: new Date(Date.now() - 61000).toISOString(), // datetime str
      };
      const newCode = {
        code: 123456,
        createdAt: Date.now(),
      };
      const re = {
        retryAfter: 60,
      };
      app.mockClassFunction(
        'verificationService',
        'getEmailVerificationCode',
        async () => codeStore,
      );
      app.mockClassFunction(
        'verificationService',
        'createEmailVerificationCode',
        async () => newCode,
      );

      const data = {
        email: '1870893666@qq.com',
      };

      await app
        .httpRequest()
        .post(url)
        .send(data)
        .expect({
          success: true,
          data: { ...re },
        });
    });
  });
});
