import chalk from 'chalk';
import { LogLevel, LoggerConfig, LogEntry, ILogger, LogData, ChalkColor } from './types';

/**
 * Colored logger implementation using chalk
 */
export class Logger implements ILogger {
  private config: LoggerConfig;
  private levelNames = {
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.TRACE]: 'TRACE',
  };



  private levelTagColors: Record<LogLevel, ChalkColor> = {
    [LogLevel.ERROR]: chalk.red.bold,
    [LogLevel.WARN]: chalk.yellow.bold,
    [LogLevel.INFO]: chalk.blue.bold,
    [LogLevel.DEBUG]: chalk.green.bold,
    [LogLevel.TRACE]: chalk.gray.bold,
  };

  private messageColors: Record<LogLevel, ChalkColor> = {
    [LogLevel.ERROR]: chalk.red.dim,
    [LogLevel.WARN]: chalk.yellow.dim,
    [LogLevel.INFO]: chalk.blue.dim,
    [LogLevel.DEBUG]: chalk.green.dim,
    [LogLevel.TRACE]: chalk.gray.dim,
  };

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: LogLevel.INFO,
      timestamps: true,
      colors: true,
      timestampFormat: 'HH:mm:ss',
      showSource: false,
      prefix: '',
      json: false,
      output: process.stdout,
      ...config,
    };
  }

  /**
   * Log an error message
   */
  error(message: string, data?: LogData): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: LogData): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: LogData): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: LogData): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log a trace message
   */
  trace(message: string, data?: LogData): void {
    this.log(LogLevel.TRACE, message, data);
  }

  /**
   * Log a message with the specified level
   */
  log(level: LogLevel, message: string, data?: LogData): void {
    if (!this.isEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      prefix: this.config.prefix,
    };

    // Add source information if enabled
    if (this.config.showSource) {
      entry.source = this.getSourceInfo();
    }

    const output = this.formatLogEntry(entry);
    this.write(output);
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Update logger configuration
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current logger configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Check if a log level is enabled
   */
  isEnabled(level: LogLevel): boolean {
    return level <= (this.config.level || LogLevel.INFO);
  }

  /**
   * Format a log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.json) {
      return this.formatJson(entry);
    }
    return this.formatText(entry);
  }

  /**
   * Format log entry as JSON
   */
  private formatJson(entry: LogEntry): string {
    const jsonEntry = {
      timestamp: entry.timestamp.toISOString(),
      level: this.levelNames[entry.level],
      message: entry.message,
      ...(entry.source && { source: entry.source }),
      ...(entry.data && { data: entry.data }),
      ...(entry.prefix && { prefix: entry.prefix }),
    };

    return JSON.stringify(jsonEntry) + '\n';
  }

  /**
   * Format log entry as colored text
   */
  private formatText(entry: LogEntry): string {
    const parts: string[] = [];

    // Add timestamp
    if (this.config.timestamps) {
      const timestamp = entry.timestamp.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      parts.push(this.config.colors ? chalk.gray(`[${timestamp}]`) : `[${timestamp}]`);
    }

    // Add prefix
    if (entry.prefix) {
      parts.push(this.config.colors ? chalk.cyan(`[${entry.prefix}]`) : `[${entry.prefix}]`);
    }

    // Add level tag (darker/bolder color)
    const levelName = this.levelNames[entry.level];
    const levelTagColor = this.levelTagColors[entry.level];
    parts.push(
      this.config.colors
        ? levelTagColor(`[${levelName}]`)
        : `[${levelName}]`
    );

    // Add source
    if (entry.source) {
      parts.push(this.config.colors ? chalk.magenta(`[${entry.source}]`) : `[${entry.source}]`);
    }

    // Add message (lighter/dimmer color)
    const messageColor = this.messageColors[entry.level];
    parts.push(
      this.config.colors
        ? messageColor(entry.message)
        : entry.message
    );

    // Add data if present
    if (entry.data !== undefined) {
      const dataStr = typeof entry.data === 'object'
        ? JSON.stringify(entry.data, null, 2)
        : String(entry.data);
      parts.push(this.config.colors ? chalk.gray(dataStr) : dataStr);
    }

    return parts.join(' ') + '\n';
  }

  /**
   * Write output to the configured stream
   */
  private write(output: string): void {
    const stream = this.config.output || process.stdout;
    stream.write(output);
  }

  /**
   * Get source file information for the calling function
   */
  private getSourceInfo(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    // Skip the first few lines (Error constructor, Logger methods)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('node_modules') || line.includes('packages/logger')) {
        continue;
      }

      // Extract file and line information
      const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
      if (match) {
        const [, functionName, filePath, lineNum] = match;
        const fileName = filePath.split('/').pop()?.split('\\').pop() || 'unknown';
        return `${fileName}:${lineNum}`;
      }
    }

    return 'unknown';
  }

  /**
   * Create a child logger with a prefix
   */
  child(prefix: string): Logger {
    const childConfig = { ...this.config, prefix };
    return new Logger(childConfig);
  }

  /**
   * Create a logger with JSON output
   */
  static createJsonLogger(config: Partial<LoggerConfig> = {}): Logger {
    return new Logger({ ...config, json: true, colors: false });
  }

  /**
   * Create a logger with minimal output
   */
  static createMinimalLogger(config: Partial<LoggerConfig> = {}): Logger {
    return new Logger({
      ...config,
      timestamps: false,
      colors: false,
      showSource: false,
    });
  }

  /**
   * Create a logger with verbose output
   */
  static createVerboseLogger(config: Partial<LoggerConfig> = {}): Logger {
    return new Logger({
      ...config,
      level: LogLevel.TRACE,
      timestamps: true,
      colors: true,
      showSource: true,
    });
  }
}
