/**
 * 去除对象中的 undefined 属性
 * @param {any} obj
 * @returns {any}
 */
export function ignoreUndefined<T = any>(obj: T): Partial<T> {
  return JSON.parse(JSON.stringify(obj));
}
