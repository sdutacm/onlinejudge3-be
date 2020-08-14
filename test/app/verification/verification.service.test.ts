import { basename } from 'path';
import assert from 'power-assert';
import { app } from 'midway-mock/bootstrap';
import { CVerificationService } from '@/app/verification/verification.service';

async function getService() {
  return app.mockContext({}).requestContext.getAsync<CVerificationService>('verificationService');
}

describe(basename(__filename), () => {
  before(async () => {
    await app.redis.flushdb();
  });

  describe('getEmailVerificationCode()', () => {
    it('should work', async () => {
      const service = await getService();
      await app.redis.set(
        'verification:code:u1@sdutacm.cn',
        '{"code":123456,"createdAt":"2019-12-31T16:00:00.000Z"}',
      );
      const res = await service.getEmailVerificationCode('u1@sdutacm.cn');
      const expected = {
        code: 123456,
        createdAt: '2019-12-31T16:00:00.000Z',
      };
      assert.deepStrictEqual(res, expected);
    });

    it('should return null when verification code dost not exist', async () => {
      const service = await getService();
      const res = await service.getEmailVerificationCode('u0@sdutacm.cn');
      assert.strictEqual(res, null);
    });
  });

  describe('createEmailVerificationCode()', () => {
    it('should work', async () => {
      const service = await getService();
      const res = await service.createEmailVerificationCode('u2@sdutacm.cn');
      assert(res.code >= 100000);
      assert(res.code <= 999999);
      const actual = await app.redis.get('verification:code:u2@sdutacm.cn');
      const expected = JSON.stringify(res);
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('deleteEmailVerificationCode()', () => {
    it('should work', async () => {
      const service = await getService();
      await app.redis.set(
        'verification:code:u3@sdutacm.cn',
        '{"code":123456,"createdAt":"2019-12-31T16:00:00.000Z"}',
      );
      await service.deleteEmailVerificationCode('u3@sdutacm.cn');
      const actual = await app.redis.get('verification:code:u3@sdutacm.cn');
      assert.strictEqual(actual, null);
    });
  });

});
