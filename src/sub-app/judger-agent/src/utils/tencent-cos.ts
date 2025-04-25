import fs from 'fs-extra';
import COS from 'cos-nodejs-sdk-v5';
import config from '../config';
import { timeout } from './index';
import { dataManagerLogger } from './logger';
import { IDataHelper } from './data-helper';

const TIMEOUT = 2 * 60 * 1000;

export class TencentCosHelper implements IDataHelper {
  private cos?: COS;

  constructor() {
    if (config.objectStorage.provider !== 'TencentCloud' || !config.objectStorage.auth) {
      throw new Error('Tencent Cloud COS is not configured');
    }

    this.cos = new COS({
      SecretId: config.objectStorage.auth.secretId,
      SecretKey: config.objectStorage.auth.secretKey,
      Domain: config.objectStorage.domain,
      Timeout: TIMEOUT,
    });
  }

  async downloadFile(url: string): Promise<Buffer> {
    dataManagerLogger.info(`Downloading file from cos:${url}`);
    const res = await this.cos.getObject({
      Bucket: config.objectStorage.bucket,
      Region: config.objectStorage.region,
      Key: url,
    });
    if (res.statusCode >= 400) {
      throw new Error(`Failed to download COS file: ${res.statusCode} ${res.RequestId}`);
    }
    return res.Body;
  }

  private async downloadFileToImpl(url: string, savePath: string): Promise<void> {
    dataManagerLogger.info(`Downloading file from cos:${url} to ${savePath}`);
    const res = await this.cos.getObject({
      Bucket: config.objectStorage.bucket,
      Region: config.objectStorage.region,
      Key: url,
      Output: fs.createWriteStream(savePath),
    });
    if (res.statusCode >= 400) {
      throw new Error(`Failed to download COS file: ${res.statusCode} ${res.RequestId}`);
    }
  }

  downloadFileTo(url: string, savePath: string): Promise<void> {
    return timeout(this.downloadFileToImpl(url, savePath), TIMEOUT);
  }
}

export function getTencentCosHelper() {
  return new TencentCosHelper();
}

export const tencentCosHelper = getTencentCosHelper();
