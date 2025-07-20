# @calphonse/logger

A modern, feature-rich logging utility for Node.js applications with chalk integration for beautiful colored output.

## Features

- **Colored Output**: Beautiful terminal output using chalk with visual hierarchy
  - **Bold level tags**: [ERROR], [WARN], [INFO], [DEBUG], [TRACE] in darker colors
  - **Dimmed messages**: Actual log messages in lighter colors for better readability
- **Multiple Log Levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Flexible Configuration**: Customizable timestamps, colors, prefixes, and more
- **JSON Output**: Optional JSON format for structured logging
- **Child Loggers**: Create prefixed child loggers for different modules
- **Source Tracking**: Optional source file and line number information
- **TypeScript Support**: Full TypeScript support with type definitions
- **Performance**: Lightweight and fast with minimal overhead

## Installation

```bash
npm install @calphonse/logger
```

## Quick Start

```typescript
import { logger, log } from '@calphonse/logger';

// Simple logging
logger.info('Application started');
logger.warn('Deprecated feature used');
logger.error('Something went wrong', { errorCode: 500 });

// Convenience functions
log.info('Quick info message');
log.error('Quick error message');
```

## Basic Usage

### Creating a Logger

```typescript
import { Logger, LogLevel } from '@calphonse/logger';

// Default logger
const logger = new Logger();

// Custom configuration
const customLogger = new Logger({
  level: LogLevel.DEBUG,
  timestamps: true,
  colors: true,
  showSource: true,
  prefix: 'MyApp',
});
```

### Log Levels

```typescript
logger.error('Critical error occurred');
logger.warn('Warning: deprecated API used');
logger.info('Application started successfully');
logger.debug('Processing user request', { userId: 123 });
logger.trace('Entering function processData');
```

**Color Scheme:**
- **ERROR**: Bold red `[ERROR]` + dim red message
- **WARN**: Bold yellow `[WARN]` + dim yellow message
- **INFO**: Bold blue `[INFO]` + dim blue message
- **DEBUG**: Bold green `[DEBUG]` + dim green message
- **TRACE**: Bold gray `[TRACE]` + dim gray message

### Configuration Options

```typescript
const logger = new Logger({
  level: LogLevel.DEBUG,        // Minimum log level to output
  timestamps: true,             // Enable timestamps
  colors: true,                 // Enable colored output
  timestampFormat: 'HH:mm:ss',  // Custom timestamp format
  showSource: false,            // Show source file information
  prefix: 'MyApp',              // Custom prefix for all messages
  json: false,                  // Output in JSON format
  output: process.stdout,       // Custom output stream
});
```

### Child Loggers

```typescript
const mainLogger = new Logger({ prefix: 'App' });
const dbLogger = mainLogger.child('Database');
const apiLogger = mainLogger.child('API');

dbLogger.info('Connected to database');
apiLogger.info('API request received');
// Output: [App] [Database] [INFO] Connected to database
// Output: [App] [API] [INFO] API request received
```

### JSON Output

```typescript
const jsonLogger = new Logger({ json: true });

jsonLogger.info('User logged in', { userId: 123, timestamp: Date.now() });
// Output: {"timestamp":"2024-01-15T10:30:00.000Z","level":"INFO","message":"User logged in","data":{"userId":123,"timestamp":1705315800000}}
```

## Advanced Usage

### Static Factory Methods

```typescript
import { Logger } from '@calphonse/logger';

// JSON logger for structured logging
const jsonLogger = Logger.createJsonLogger();

// Minimal logger for production
const minimalLogger = Logger.createMinimalLogger();

// Verbose logger for development
const verboseLogger = Logger.createVerboseLogger();
```

### Dynamic Configuration

```typescript
const logger = new Logger();

// Change log level at runtime
logger.setLevel(LogLevel.DEBUG);

// Update configuration
logger.setConfig({
  timestamps: false,
  prefix: 'NewPrefix',
});

// Check if level is enabled
if (logger.isEnabled(LogLevel.DEBUG)) {
  logger.debug('Debug information');
}
```

### Custom Output Streams

```typescript
import { createWriteStream } from 'fs';

const fileStream = createWriteStream('app.log');
const fileLogger = new Logger({
  output: fileStream,
  json: true, // JSON format for log files
});

fileLogger.info('Application event', { event: 'startup' });
```

## API Reference

### Logger Class

#### Constructor

```typescript
new Logger(config?: LoggerConfig)
```

#### Methods

- `error(message: string, data?: any): void`
- `warn(message: string, data?: any): void`
- `info(message: string, data?: any): void`
- `debug(message: string, data?: any): void`
- `trace(message: string, data?: any): void`
- `log(level: LogLevel, message: string, data?: any): void`
- `setLevel(level: LogLevel): void`
- `setConfig(config: Partial<LoggerConfig>): void`
- `getConfig(): LoggerConfig`
- `isEnabled(level: LogLevel): boolean`
- `child(prefix: string): Logger`

#### Static Methods

- `createJsonLogger(config?: Partial<LoggerConfig>): Logger`
- `createMinimalLogger(config?: Partial<LoggerConfig>): Logger`
- `createVerboseLogger(config?: Partial<LoggerConfig>): Logger`

### Types

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

interface LoggerConfig {
  level?: LogLevel;
  timestamps?: boolean;
  colors?: boolean;
  timestampFormat?: string;
  showSource?: boolean;
  prefix?: string;
  json?: boolean;
  output?: NodeJS.WritableStream;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  source?: string;
  data?: any;
  prefix?: string;
}
```

## Examples

### Express.js Integration

```typescript
import express from 'express';
import { logger } from '@calphonse/logger';

const app = express();
const apiLogger = logger.child('API');

app.use((req, res, next) => {
  apiLogger.info(`${req.method} ${req.path}`, {
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  next();
});

app.get('/api/users', (req, res) => {
  apiLogger.debug('Fetching users', { query: req.query });
  // ... handler logic
});
```

### Database Operations

```typescript
import { logger } from '@calphonse/logger';

const dbLogger = logger.child('Database');

async function connectToDatabase() {
  try {
    dbLogger.info('Connecting to database...');
    // ... connection logic
    dbLogger.info('Database connected successfully');
  } catch (error) {
    dbLogger.error('Database connection failed', { error: error.message });
    throw error;
  }
}
```

### Error Handling

```typescript
import { logger } from '@calphonse/logger';

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    promise: promise.toString(),
  });
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run format
```

## License

MIT License - see LICENSE file for details.
