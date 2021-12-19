import { provide, config, logger, EggLogger } from 'midway';
import { IAppConfig } from '@/config/config.interface';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import type { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/tms/v20201229/tms_client';

@provide()
export default class ContentChecker {
  private client: Client;

  @logger('contentCheckLogger')
  logger: EggLogger;

  constructor(@config('tencentCloud') cloudConfig: IAppConfig['tencentCloud']) {
    const TmsClient = tencentcloud.tms.v20201229.Client;
    const clientConfig = {
      credential: {
        secretId: cloudConfig.secretId,
        secretKey: cloudConfig.secretKey,
      },
      region: 'ap-beijing',
      profile: {
        httpProfile: {
          endpoint: 'tms.tencentcloudapi.com',
        },
      },
    };
    this.client = new TmsClient(clientConfig);
  }

  public async check(content: string, bizType?: 'nickname' | 'topic' | 'comment') {
    try {
      const res = await this.client.TextModeration({
        Content: Buffer.from(content).toString('base64'),
        BizType: bizType,
      });
      if (res.Suggestion !== 'Pass') {
        this.logger.info('[content check] hit:', {
          content,
          res,
        });
      }
      return res;
    } catch (err) {
      this.logger.error('[content check] fail:', err);
      throw err;
    }
  }

  public async simpleCheck(content: string, bizType?: 'nickname' | 'topic' | 'comment') {
    const res = await this.check(content, bizType);
    return res.Suggestion === 'Pass';
  }
}

export type CContentChecker = ContentChecker;
