/**
 * Structured logger utility with environment-aware filtering.
 *
 * In production: only warn and error are output
 * In development: all levels are output
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('Debug message', data);
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 */

const isProd = import.meta.env.PROD;

const noop = (): void => {};

export const logger = {
  debug: isProd ? noop : (...args: unknown[]) => console.debug('[DEBUG]', ...args),
  info: isProd ? noop : (...args: unknown[]) => console.info('[INFO]', ...args),
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
};

export default logger;
