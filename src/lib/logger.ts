/**
 * Production-Safe Logger
 * 
 * Provides controlled logging that respects environment settings
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Info logs - always logged but formatted
   */
  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  /**
   * Error logs - always logged and sent to error tracking
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      errorName: error?.name,
      errorStack: isProduction ? undefined : error?.stack,
    };
    
    console.error(this.formatMessage('error', message, errorContext));
    
    // TODO: Send to error tracking service in production
    if (isProduction && error) {
      this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * Performance logging
   */
  perf(label: string, startTime: number, context?: LogContext): void {
    const duration = performance.now() - startTime;
    this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`, context);
  }

  /**
   * Log API requests (useful for debugging)
   */
  api(method: string, url: string, status?: number, duration?: number): void {
    const message = `${method} ${url}${status ? ` → ${status}` : ''}${duration ? ` (${duration}ms)` : ''}`;
    this.debug(message, { type: 'api' });
  }

  /**
   * TODO: Implement error tracking service integration
   */
  private sendToErrorTracking(message: string, error: Error, context?: LogContext): void {
    // Placeholder for Sentry, LogRocket, etc.
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: { message, ...context } });
    // }
  }
}

export const logger = new Logger();

/**
 * Performance measurement decorator
 */
export function measurePerformance(label: string) {
  const start = performance.now();
  return () => {
    logger.perf(label, start);
  };
}

/**
 * Create a logger instance with default context
 */
export function createLogger(defaultContext: LogContext): Logger {
  const contextLogger = new Logger();
  
  // Override methods to include default context
  const originalDebug = contextLogger.debug.bind(contextLogger);
  const originalInfo = contextLogger.info.bind(contextLogger);
  const originalWarn = contextLogger.warn.bind(contextLogger);
  const originalError = contextLogger.error.bind(contextLogger);
  
  contextLogger.debug = (message: string, context?: LogContext) => 
    originalDebug(message, { ...defaultContext, ...context });
  contextLogger.info = (message: string, context?: LogContext) => 
    originalInfo(message, { ...defaultContext, ...context });
  contextLogger.warn = (message: string, context?: LogContext) => 
    originalWarn(message, { ...defaultContext, ...context });
  contextLogger.error = (message: string, error?: Error, context?: LogContext) => 
    originalError(message, error, { ...defaultContext, ...context });
  
  return contextLogger;
}

