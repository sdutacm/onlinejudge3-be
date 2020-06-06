import { Context, controller, inject, provide, config } from 'midway';
import { route, rateLimitIp } from '@/lib/decorators/controller.decorator';
import { CVerificationMeta } from './verification.meta';
import { routesBe } from '@/common/routes';
import { IUtils } from '@/utils';
import { ISendEmailVerificationReq } from '@/common/contracts/verification';
import { IRedisKeyConfig } from '@/config/redisKey.config';
import { IDurationsConfig } from '@/config/durations.config';
import { CVerificationService } from './verification.service';
import { CMailSender } from '@/utils/mail';
import { ReqError } from '@/lib/global/error';
import { Codes } from '@/common/codes';

@provide()
@controller('/')
export default class VerificationController {
  @inject('verificationMeta')
  meta: CVerificationMeta;

  @inject('verificationService')
  service: CVerificationService;

  @inject()
  utils: IUtils;

  @inject()
  mailSender: CMailSender;

  @config()
  redisKey: IRedisKeyConfig;

  @config()
  durations: IDurationsConfig;

  @config()
  siteName: string;

  @config()
  siteTeam: string;

  @route()
  @rateLimitIp(60, 2)
  async [routesBe.sendEmailVerification.i](ctx: Context) {
    const { email } = ctx.request.body as ISendEmailVerificationReq;
    const codeStore = await this.service.getEmailVerificationCode(email);
    // 检查是否已有验证码
    if (codeStore) {
      const retryAfter =
        this.durations.emailVerificationCodeRetryAfter -
        Math.floor((Date.now() - new Date(codeStore.createdAt).getTime()) / 1000);
      // 验证码还未过期
      if (retryAfter > 0) {
        throw new ReqError(Codes.GENERAL_FLE, {
          retryAfter,
        });
      }
    }
    // 生成新验证码
    const { code } = await this.service.createEmailVerificationCode(email);
    // 发送邮件
    const expiresStr = this.utils.format.formatApproximateTime(
      this.durations.emailVerificationCodeExpires,
    );
    const subject = 'Your Verification Code';
    const content = `<p>Dear User:</p>
<p>Thanks for using ${this.siteName}. Your verification code: <strong style=\"font-size: 150%;\">${code}</strong></p>
<p>Please use it in ${expiresStr}.</p>
<p><br/></p>
<p>${this.siteTeam}</p>`;
    this.mailSender.singleSend(email, subject, content);
    return {
      retryAfter: this.durations.emailVerificationCodeRetryAfter,
    };
  }
}
