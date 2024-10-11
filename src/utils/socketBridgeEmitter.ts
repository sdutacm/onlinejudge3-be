import Axios from 'axios';
import http from 'http';
import https from 'https';
import { provide, config, logger, EggLogger } from 'midway';
import { IAppConfig } from '@/config/config.interface';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const axiosSocketBrideInstance = Axios.create({
  httpAgent,
  httpsAgent,
  timeout: 5000,
});

@provide()
export default class SocketBridgeEmitter {
  @config('socketBridge')
  private config: IAppConfig['socketBridge'];

  @logger()
  private logger: EggLogger;

  public async emit(action: string, data: any) {
    try {
      const res = await axiosSocketBrideInstance({
        url: `${this.config.baseUrl}/${action}`,
        method: 'POST',
        data,
        headers: {
          'x-emit-auth': this.config.emitAuthKey,
        },
      });
      if (!res.data || 'success' in res.data === false) {
        this.logger.error('[SocketBrideEmitter] Invalid response:', res);
        throw new Error('Invalid response');
      }
      if (!res.data.success) {
        throw new Error(`Rejected request: ${res.data.msg} (${res.data.code})`);
      }
      return res.data.data;
    } catch (e) {
      this.logger.error(`[SocketBrideEmitter] Emit failed. action: ${action}, err:`, e.message);
      throw e;
    }
  }
}

export type CSocketBridgeEmitter = SocketBridgeEmitter;
