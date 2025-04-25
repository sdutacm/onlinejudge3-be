import config from '../config';
import { TencentCosHelper } from './tencent-cos';
import { TencentCdnHelper } from './tencent-cdn';

export interface IDataHelper {
  downloadFile(url: string): Promise<Buffer>;
  downloadFileTo(url: string, savePath: string): Promise<void>;
}

let singletonDataHelper: IDataHelper;

export function getSingletonDataHelper(): IDataHelper {
  if (singletonDataHelper) {
    return singletonDataHelper;
  }
  if (config.judgerData.remoteSource.type === 'CDN' && config.cdn.provider === 'TencentCloud') {
    singletonDataHelper = new TencentCdnHelper();
    return singletonDataHelper;
  } else if (
    config.judgerData.remoteSource.type === 'ObjectStorage' &&
    config.objectStorage.provider === 'TencentCloud'
  ) {
    singletonDataHelper = new TencentCosHelper();
    return singletonDataHelper;
  }
  throw new Error('Invalid data helper configuration');
}
