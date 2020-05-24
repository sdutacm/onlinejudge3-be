import * as chalk from 'chalk';

type TLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const consoleColors: Record<TLogLevel, chalk.Chalk> = {
  DEBUG: chalk.blue,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

/**
 * 格式化 Logger。
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

/**
 * 格式化大致时间。
 * @param secs 秒数
 */
export function formatApproximateTime(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const hours = Math.floor(secs / 3600);
  if (secs < 0) {
    return 'unknown time';
  } else if (secs <= 1) {
    return `${secs} second`;
  } else if (secs < 60) {
    return `${secs} seconds`;
  } else if (secs < 120) {
    return '1 minute';
  } else if (secs < 3600) {
    return `${minutes} minutes`;
  } else if (secs < 7200) {
    return '1 hour';
  }
  return `${hours} hours`;
}
