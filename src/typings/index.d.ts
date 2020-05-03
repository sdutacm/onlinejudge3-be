import 'egg';

declare module 'egg' {
  interface Context {
    // session: ISession;
    id?: number;
    detail?: any;
    pagination?: {
      page: number;
      offset: number;
      limit: number;
      order: Array<[string, 'ASC' | 'DESC']>;
    };
  }
}
