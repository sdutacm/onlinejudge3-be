import { provide, inject, Context, config } from 'midway';
import { IUtils } from '@/utils';
import { CVerificationMeta } from './verification.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IVerificationCode } from './verification.interface';

export type CVerificationService = VerificationService;

@provide()
export default class VerificationService {
  @inject('verificationMeta')
  meta: CVerificationMeta;

  @inject()
  utils: IUtils;

  @inject()
  ctx: Context;

  @config()
  redisKey: IRedisKeyConfig;

  @config('durations')
  durations: IDurationsConfig;

  async getEmailVerificationCode(email: string): Promise<IVerificationCode | null> {
    return this.ctx.helper.getRedisKey(this.redisKey.verificationCode, [email]);
  }

  async createEmailVerificationCode(email: string): Promise<IVerificationCode> {
    const code = this.utils.lib.lodash.random(100000, 999999);
    const verificationCode: IVerificationCode = {
      code,
      createdAt: new Date().toISOString(),
    };
    await this.ctx.helper.setRedisKey(
      this.redisKey.verificationCode,
      [email],
      verificationCode,
      this.durations.emailVerificationCodeExpires,
    );
    return verificationCode;
  }
}
