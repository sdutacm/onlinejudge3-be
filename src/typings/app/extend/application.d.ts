import 'egg';
import ExtendIApplication from '@/app/extend/application';

declare module 'egg' {
  type ExtendIApplicationType = typeof ExtendIApplication;
  interface Application extends ExtendIApplicationType {}
}
