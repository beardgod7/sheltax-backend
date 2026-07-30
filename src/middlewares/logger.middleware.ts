import morgan, { StreamOptions, TokenIndexer } from 'morgan';
import { Request, Response } from 'express';
import chalk from 'chalk';
import logger from '../utils/logger';

export const httpLogger = morgan((tokens: TokenIndexer<Request, Response>, req: Request, res: Response) => {
  const status = tokens.status(req, res) || '200';
  const statusNum = parseInt(status, 10);

  let coloredStatus = chalk.green(status);
  if (statusNum >= 500) {
    coloredStatus = chalk.red.bold(status);
  } else if (statusNum >= 400) {
    coloredStatus = chalk.yellow.bold(status);
  } else if (statusNum >= 300) {
    coloredStatus = chalk.cyan(status);
  }

  const method = chalk.bold(tokens.method(req, res));
  const url = tokens.url(req, res);
  const responseTime = `${tokens['response-time'](req, res)} ms`;

  return `${method} ${url} ${coloredStatus} - ${responseTime}`;
}, {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    },
  } as StreamOptions,
});
