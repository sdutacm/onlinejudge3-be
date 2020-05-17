import { Codes, codeMsgs } from '@/common/codes';

/**
 * 请求错误对象。
 */
export class ReqError extends Error {
  code: Codes;
  msg: string;
  data?: any;

  /**
   * 抛出请求错误。
   * 需在 Controller 中配合 `route` 装饰器使用，效果等同于 `ctx.rFail()`
   * @param code 错误码
   * @param data 数据
   */
  constructor(code: Codes, data?: any) {
    super(codeMsgs[code]);
    this.code = code;
    this.msg = codeMsgs[code];
    this.data = data;
  }
}
