import os from 'os';
import env from './environment';
import { logger } from './utils/logger';

if (!env.debug) {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err.toString());
    if (err.stack) {
      logger.error(err.stack);
    }
  });
}
