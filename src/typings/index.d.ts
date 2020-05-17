import 'egg';

declare module 'egg' {
  interface Context {
    // session: ISession;
    id?: number;
    detail?: any;
    data: any;
    pagination?: {
      page: number;
      offset: number;
      limit: number;
      order: Array<[string, 'ASC' | 'DESC']>;
    };
    session: {
      userId?: number;
      username?: string;
      nickname?: string;
      permission?: number;
      avatar?: string | null;
      contests?: {
        [x: number]: boolean;
      };
    };
  }
}
