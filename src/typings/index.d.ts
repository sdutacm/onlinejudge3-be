import 'egg';

declare module 'egg' {
  interface Context {
    userId?: number;
    loggedIn: boolean;
    id?: number;
    detail?: any;
    list?: {
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
      contests?: {
        [x: number]: boolean;
      };
    };
  }
}
