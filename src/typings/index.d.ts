import 'egg';
import { EPerm } from '@/common/configs/perm.config';

declare module 'egg' {
  interface Context {
    requestId: string;
    userId?: number;
    loggedIn: boolean;
    permissions: EPerm[];
    scope?: string | null;
    id?: number;
    detail?: any;
    list?: {
      count: number;
      rows: any[];
    };
    fullList?: {
      count: number;
      rows: any[];
    };
    pagination?: {
      page: number;
      offset: number;
      limit: number;
      order: Array<[string, 'ASC' | 'DESC']>;
    };
    session: {
      userId: number;
      username: string;
      nickname: string;
      permission: number;
      avatar: string | null;
      loginUa: string;
      loginIp: string;
      loginAt: string;
      lastAccessIp: string;
      lastAccessAt: string;
      contests: {
        [x: number]:
          | {
              userId: number;
              username: string;
              nickname: string;
              permission: number;
              avatar: string | null;
            }
          | undefined;
      };
    };
  }
}
