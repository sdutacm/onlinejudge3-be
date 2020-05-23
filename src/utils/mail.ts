// @ts-ignore
import * as AliMailSDK from 'alimail-sdk';
import { provide, config, logger, EggLogger } from 'midway';
import { DefaultConfig } from '@/config/config.interface';
import { AxiosResponse } from 'axios';

@provide()
export default class MailSender {
  private config: DefaultConfig['mail'];
  private mailer: any;

  @logger()
  private logger: EggLogger;

  constructor(@config('mail') mailConfig: DefaultConfig['mail']) {
    this.config = mailConfig;
    this.mailer = new AliMailSDK({
      AccessKeyId: mailConfig.accessKeyId,
      AccessKeySecret: mailConfig.accessSecret,
      Version: mailConfig.regionId === 'cn-hangzhou' ? '2015-11-23' : '2017-06-22', // RegionID 是 cn-hangzhou version 是 2015-11-23，其他一律 2017-06-22
      SignatureVersion: '1.0', // 默认并仅支持 1.0
      SignatureMethod: 'HMAC-SHA1', // 默认并仅支持 HMAC-SHA1
      RegionId: mailConfig.regionId || 'cn-hangzhou', // 可选
      Format: 'json', // 可选
    });
  }

  /**
   * 单发邮件。
   * @param toAddress 邮件地址
   * @param subject 邮件主题（无需手动添加【SDUTACM】前缀）
   * @param htmlBody 邮件正文
   */
  public async singleSend(toAddress: string, subject: string, htmlBody: string) {
    try {
      const res: AxiosResponse<{ EnvId: string; RequestId: string }> = await this.mailer.send(
        {
          Action: 'single',
          AccountName: this.config.accountName,
          ReplyToAddress: false, // 默认 false
          AddressType: 0, // 默认 0
          ToAddress: toAddress,
          FromAlias: this.config.fromAlias, // 可选
          Subject: `【SDUTACM】${subject}`, // 可选
          TagName: this.config.tagName, // 可选
          HtmlBody: htmlBody, // 可选
          // TextBody: 'TextBody', // 可选
          // ClickTrace: '0', // 默认 0
          // Timestamp: new Date().toISOString(), // 默认 new Date().toISOString()
          // SignatureNonce: uuid() // 默认 UUID
        },
        {}, // 传入 axios config 设置代理等
      );
      return res;
    } catch (e) {
      this.logger.error(
        `Mail send error. {to: ${toAddress}, subject: ${subject}, body: ${htmlBody}}`,
        e,
      );
      return null;
    }
  }
}

export type CMailSender = MailSender;
