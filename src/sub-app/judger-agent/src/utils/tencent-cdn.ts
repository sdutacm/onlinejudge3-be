import http from 'http';
import https from 'https';
import Axios from 'axios';
import type { AxiosInstance } from 'axios';
import md5 from 'crypto-js/md5';
import sha256 from 'crypto-js/sha256';
import config from '../config';

export class TencentCdnHelper {
  private readonly authConfig = config.cdn.auth;
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true });

    this.axiosInstance = Axios.create({
      baseURL: config.cdn.cdnOrigin,
      httpAgent,
      httpsAgent,
      timeout: 5 * 60 * 1000,
      headers: {},
    });
  }

  private getAuthUrlByTypeD(url: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString(this.authConfig.timestampRadix);
    const signStr = `${this.authConfig.pkey}${url}${timestamp}`;
    let sign = '';
    if (this.authConfig.algorithm === 'md5') {
      sign = md5(signStr).toString();
    } else if (this.authConfig.algorithm === 'sha256') {
      sign = sha256(signStr).toString();
    } else {
      throw new Error('Invalid algorithm');
    }

    return `${url}${url.includes('?') ? '&' : '?'}${this.authConfig.signParam}=${sign}&${
      this.authConfig.timestampParam
    }=${timestamp}`;
  }

  getAuthUrl(url: string) {
    if (!this.authConfig.useAuth) {
      return url;
    }

    if (this.authConfig.mode === 'TypeD') {
      return this.getAuthUrlByTypeD(url);
    }

    throw new Error('Not implemented');
  }

  async downloadFile(url: string): Promise<Buffer> {
    const usingUrl = this.getAuthUrl(url);
    const res = await this.axiosInstance.get<Buffer>(usingUrl, {
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return res.data;
  }
}

export function getTencentCdnHelper() {
  return new TencentCdnHelper();
}
