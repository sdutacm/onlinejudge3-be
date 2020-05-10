import * as chalk from 'chalk';
import { update as lodashUpdate } from 'lodash';

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

type TLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const consoleColors: Record<TLogLevel, chalk.Chalk> = {
  DEBUG: chalk.blue,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

/**
 * 格式化 formatLogger。
 * @param meta formatLogger meta
 * @param customContent 自定义 message 前的额外的输出信息（如 `${meta.hostname}`）
 */
export function formatLoggerHelper(meta: any, customContent = '') {
  const level = meta.level as TLogLevel;
  const color: chalk.Chalk = consoleColors[level];
  let formattedLevel = `[${level}]`;
  if (formattedLevel.length < 7) {
    formattedLevel += ' ';
  }
  if (customContent && !customContent.endsWith('\n') && !customContent.endsWith(' ')) {
    customContent += ' ';
  }
  return (
    color(`[${meta.date.replace(',', '.')}] ${formattedLevel} ${customContent}`) + `${meta.message}`
  );
}
