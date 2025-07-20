#!/usr/bin/env node

import { logger, createLogger, LogLevel } from '../src/index';

console.log('=== Logger Color Scheme Demo ===\n');

// Create a logger with colors enabled and show source
const demoLogger = createLogger({
  colors: true,
  timestamps: false, // Disable timestamps to focus on colors
  showSource: false,
  level: LogLevel.TRACE,
});

console.log('Notice the color differences:');
console.log('- [ERROR] tag is darker/bolder red');
console.log('- Error message is lighter/dimmer red\n');

demoLogger.error('This is an error message');
demoLogger.warn('This is a warning message');
demoLogger.info('This is an info message');
demoLogger.debug('This is a debug message');
demoLogger.trace('This is a trace message');

console.log('\n=== With Data ===\n');

demoLogger.error('Error with data', { errorCode: 500, details: 'Something went wrong' });
demoLogger.warn('Warning with data', { retryCount: 3, timeout: 5000 });
demoLogger.info('Info with data', { userId: 123, action: 'login' });

console.log('\n=== With Source Information ===\n');

const sourceLogger = createLogger({
  colors: true,
  timestamps: false,
  showSource: true,
  level: LogLevel.TRACE,
});

sourceLogger.error('Error with source info');
sourceLogger.warn('Warning with source info');
sourceLogger.info('Info with source info');

