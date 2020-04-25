import 'egg';
import ExtendIHelper from '../../../../src/app/extend/helper';

declare module 'egg' {
  type ExtendIHelperType = typeof ExtendIHelper;
  interface IHelper extends ExtendIHelperType {}
}
