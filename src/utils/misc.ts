import { update as lodashUpdate } from 'lodash';
import md5 from 'md5';
import cryptoRandomString from 'crypto-random-string';

/**
 * 去除对象中的 undefined 属性。
 * @param {any} obj
 * @returns {any}
 */
export function ignoreUndefined<T = any>(obj: T): Partial<T> {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 将从 json 解析的对象中的字符串日期属性格式化为 Date（会改变原对象）。
 * @param obj 对象
 * @param paths 要格式化 Date 的属性路径
 */
export function processDateFromJson<T = any>(obj: T, paths: Array<keyof T | string>): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  paths.forEach((path) => {
    // @ts-ignore
    lodashUpdate(obj, path, (value) => new Date(value));
  });
  return obj;
}

/**
 * 哈希密码（follow twg's algorithm）。
 * @param str 密码
 */
export function hashPassword(str: string): string {
  const PASSWORD_SLOT = 'AtG$o*p^2~V';
  str = md5(str);
  const len1 = str.length;
  const len2 = PASSWORD_SLOT.length;
  let ret = '';
  let i = 0;
  let j = 0;
  while (i < len1 && j < len2) {
    ret += str.substr(i, 1) + PASSWORD_SLOT.substr(j, 1);
    i++;
    j++;
  }
  if (i < str.length) {
    ret += str.substr(i);
  }
  if (j < PASSWORD_SLOT.length) {
    ret += PASSWORD_SLOT.substr(j);
  }
  return md5(ret);
}

/**
 * 随机字符串。
 * @param options 参数
 * @ref https://www.npmjs.com/package/crypto-random-string
 */
export const randomString = cryptoRandomString;

/**
 * 计算最大公约数
 * @param m
 * @param n
 */
export function gcd(m: number, n: number): number {
  let a = m;
  let b = n;
  while (a !== b) {
    if (a > b) a -= b;
    else b -= a;
  }
  return a;
}

/**
 * 计算所有约数
 * @param m
 * @param n
 */
export function cdAll(m: number, n: number): number[] {
  let gcdValue = gcd(m, n);
  const res = [];
  for (let i = 1, pow = 1; pow <= gcdValue; pow += i + i + 1, ++i) {
    if (gcdValue % i === 0) {
      res.push(i);
      if (pow !== gcdValue) {
        res.push(gcdValue / i);
      }
    }
  }
  res.sort();
  return res;
}
