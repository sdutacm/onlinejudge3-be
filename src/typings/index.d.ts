import 'egg';

declare module 'egg' {
  interface Context {
    // session: ISession;
    id?: number;
    detail?: any;
  }
}
