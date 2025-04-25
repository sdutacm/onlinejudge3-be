import config from '../config';
import { TencentCosHelper } from './tencent-cos';
import { TencentCdnHelper } from './tencent-cdn';

export interface IDataHelper {
  downloadFile(url: string): Promise<Buffer>;
  downloadFileTo(url: string, savePath: string): Promise<void>;
}

export function getDataHelper(): IDataHelper {
  if (config.judgerData.remoteSource.type === 'CDN' && config.cdn.provider === 'TencentCloud') {
    return new TencentCdnHelper();
  } else if (
    config.judgerData.remoteSource.type === 'ObjectStorage' &&
    config.objectStorage.provider === 'TencentCloud'
  ) {
    return new TencentCosHelper();
  }
  throw new Error('Invalid data helper configuration');
}

export const dataHelper = getDataHelper();
