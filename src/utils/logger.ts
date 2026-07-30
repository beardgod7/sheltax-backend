import chalk from 'chalk';

const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.blue.bold('[INFO]')} ${message}`, ...args);
  },

  success: (message: string, ...args: any[]) => {
    console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.green.bold('[SUCCESS]')} ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.yellow.bold('[WARN]')} ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.red.bold('[ERROR]')} ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.magenta.bold('[DEBUG]')} ${message}`, ...args);
    }
  },

  http: (message: string, ...args: any[]) => {
    console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.cyan.bold('[HTTP]')} ${message}`, ...args);
  },
};

export default logger;
