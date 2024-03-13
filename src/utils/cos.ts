import fs from 'fs';
import { provide, config } from 'midway';
import { IAppConfig } from '@/config/config.interface';
import COS from 'cos-nodejs-sdk-v5';

export interface ICosCommonOptions {
  bucket?: string;
  region?: string;
}

@provide()
export default class CosHelper {
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

  public async uploadFile(
    file: Buffer | fs.ReadStream,
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<void> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!file || !remoteFilePath) {
      throw new Error('Invalid COS upload parameters');
    }
    await this.cos.putObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Key: remoteFilePath,
      Body: file,
    });
  }

  public async downloadFile(
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<Buffer> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteFilePath) {
      throw new Error('Invalid COS download parameters');
    }
    const res = await this.cos.getObject({
      Bucket: options.bucket || this.config!.bucket,
      Region: options.region || this.config!.region,
      Key: remoteFilePath,
    });
    return res.Body;
  }

  public async isFileExist(
    remoteFilePath: string,
    options: ICosCommonOptions = {},
  ): Promise<boolean> {
    if (!this.cos) {
      throw new Error('COS is not configured');
    }
    if (!remoteFilePath) {
      throw new Error('Invalid COS file exist check parameters');
    }
    try {
      await this.cos.headObject({
        Bucket: options.bucket || this.config!.bucket,
        Region: options.region || this.config!.region,
        Key: remoteFilePath,
      });
      return true;
    } catch (e) {
      if (e.statusCode === 404) {
        return false;
      }
      throw e;
    }
  }
}

export type CCosHelper = CosHelper;
