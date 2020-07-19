import { provide, inject, Context, config } from 'midway';
import { CVerificationMeta } from './verification.meta';
import { IDurationsConfig } from '@/config/durations.config';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IVerificationCode } from './verification.interface';
import { ILodash } from '@/utils/libs/lodash';

export type CVerificationService = VerificationService;

@provide()
export default class VerificationService {
  @inject('verificationMeta')
  meta: CVerificationMeta;

  @inject()
  lodash: ILodash;

  @inject()
  ctx: Context;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;

  async getEmailVerificationCode(email: string): Promise<IVerificationCode | null> {
    return this.ctx.helper.redisGet(this.redisKey.verificationCode, [email]);
  }

  async createEmailVerificationCode(email: string): Promise<IVerificationCode> {
    const code = this.lodash.random(100000, 999999);
    const verificationCode: IVerificationCode = {
      code,
      createdAt: new Date().toISOString(),
    };
    await this.ctx.helper.redisSet(
      this.redisKey.verificationCode,
      [email],
      verificationCode,
      this.durations.emailVerificationCodeExpires,
    );
    return verificationCode;
  }

  async deleteEmailVerificationCode(email: string): Promise<void> {
    await this.ctx.helper.redisDel(this.redisKey.verificationCode, [email]);
  }
}
