export { Logger } from './logger';
export { LogLevel } from './types';
export type { LoggerConfig, LogEntry, ILogger, LogData } from './types';
export { ErrorHandler, ErrorType, ErrorSeverity, USER_FRIENDLY_MESSAGES } from './error-handler';
export type { ErrorContext, ErrorAnalysis } from './error-handler';

// Default logger instance
import { Logger } from './logger';
import { LogLevel, LoggerConfig } from './types';

/**
 * Default logger instance with INFO level
 */
export const logger = new Logger();

/**
 * Convenience functions for quick logging
 */
export const log = {
  error: (message: string, data?: any) => logger.error(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  debug: (message: string, data?: any) => logger.debug(message, data),
  trace: (message: string, data?: any) => logger.trace(message, data),
};

/**
 * Create a logger with specific configuration
 */
export const createLogger = (config?: Partial<LoggerConfig>) => new Logger(config);

/**
 * Create a child logger with prefix
 */
export const createChildLogger = (prefix: string) => logger.child(prefix);

/**
 * Set the global log level
 */
export const setLogLevel = (level: LogLevel) => logger.setLevel(level);

/**
 * Configure the global logger
 */
export const configureLogger = (config: Partial<LoggerConfig>) => logger.setConfig(config);

// Export default logger
export default logger;
