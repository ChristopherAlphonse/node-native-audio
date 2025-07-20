#!/usr/bin/env node

import { logger, log, createLogger, LogLevel } from '../src/index';

console.log('=== Basic Logger Usage Example ===\n');

// Using the default logger
logger.info('Application started');
logger.warn('This is a warning message');
logger.error('This is an error message', { errorCode: 500, context: 'example' });

// Using convenience functions
log.debug('Debug information', { userId: 123, action: 'login' });
log.trace('Entering function processData');

console.log('\n=== Custom Logger Configuration ===\n');

// Create a custom logger with prefix
const customLogger = createLogger({
  prefix: 'MyApp',
  showSource: true,
  level: LogLevel.DEBUG,
});

customLogger.info('Custom logger with prefix');
customLogger.debug('Debug message with source info');

console.log('\n=== Child Logger Example ===\n');

// Create child loggers for different modules
const dbLogger = customLogger.child('Database');
const apiLogger = customLogger.child('API');

dbLogger.info('Connected to database');
apiLogger.info('API request received', { method: 'GET', path: '/users' });

console.log('\n=== JSON Logger Example ===\n');

// Create a JSON logger for structured logging
const jsonLogger = createLogger({
  json: true,
  level: LogLevel.INFO,
});

jsonLogger.info('User logged in', {
  userId: 456,
  timestamp: new Date().toISOString(),
  userAgent: 'Mozilla/5.0...',
});

console.log('\n=== Minimal Logger Example ===\n');

// Create a minimal logger
const minimalLogger = createLogger({
  timestamps: false,
  colors: false,
  showSource: false,
});

minimalLogger.info('Minimal output without timestamps or colors');

console.log('\n=== Verbose Logger Example ===\n');

// Create a verbose logger
const verboseLogger = createLogger({
  level: LogLevel.TRACE,
  timestamps: true,
  colors: true,
  showSource: true,
});

verboseLogger.trace('Very detailed trace information');
verboseLogger.debug('Debug information with full context');

console.log('\n=== Dynamic Configuration ===\n');

// Change log level at runtime
logger.setLevel(LogLevel.WARN);
logger.info('This info message will not be logged');
logger.warn('This warning will be logged');
logger.error('This error will be logged');

// Reset to show all levels
logger.setLevel(LogLevel.TRACE);
logger.info('Info messages are now enabled again');

console.log('\n=== Example Complete ===');
