import fs from 'fs';
import { provide, config } from 'midway';
import { IAppConfig } from '@/config/config.interface';
import COS from 'cos-nodejs-sdk-v5';

@provide()
export default class CosUploader {
  private config: IAppConfig['tencentCloud']['cos'];
  private cos?: COS;

  constructor(@config('tencentCloud') tencentCloud: IAppConfig['tencentCloud']) {
    this.config = tencentCloud.cos;
    if (tencentCloud.cos) {
      this.cos = new COS({
        SecretId: tencentCloud.cos.secretId,
        SecretKey: tencentCloud.cos.secretKey,
      });
    }
  }

  public async uploadFile(file: Buffer | fs.ReadStream, remoteFilePath: string): Promise<void> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!file || !remoteFilePath) {
      throw new Error('Invalid COS upload parameters');
    }
    await this.cos.putObject({
      Bucket: this.config!.bucket,
      Region: this.config!.region,
      Key: remoteFilePath,
      Body: file,
    });
  }
}

export type CCosUploader = CosUploader;
