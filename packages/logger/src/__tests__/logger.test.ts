import { Logger, LogLevel, logger, log, createLogger, createChildLogger, LoggerConfig } from '../index';

describe('Logger', () => {
  let logger: Logger;
  let mockOutput: { write: jest.Mock };

  beforeEach(() => {
    mockOutput = { write: jest.fn() };
    logger = new Logger({ output: mockOutput as any, level: LogLevel.TRACE });
  });

  describe('constructor', () => {
    it('should create a logger with default configuration', () => {
      const defaultLogger = new Logger();
      const config = defaultLogger.getConfig();

      expect(config.level).toBe(LogLevel.INFO);
      expect(config.timestamps).toBe(true);
      expect(config.colors).toBe(true);
      expect(config.showSource).toBe(false);
      expect(config.json).toBe(false);
    });

    it('should create a logger with custom configuration', () => {
      const customLogger = new Logger({
        level: LogLevel.DEBUG,
        timestamps: false,
        colors: false,
        showSource: true,
        prefix: 'TEST',
      });

      const config = customLogger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.timestamps).toBe(false);
      expect(config.colors).toBe(false);
      expect(config.showSource).toBe(true);
      expect(config.prefix).toBe('TEST');
    });
  });

  describe('log levels', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });

    it('should log trace messages', () => {
      logger.trace('Test trace message');
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[TRACE]')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test trace message')
      );
    });
  });

  describe('log level filtering', () => {
    it('should not log messages below the set level', () => {
      logger.setLevel(LogLevel.WARN);

      logger.info('This should not be logged');
      logger.debug('This should not be logged');
      logger.trace('This should not be logged');

      expect(mockOutput.write).not.toHaveBeenCalled();
    });

    it('should log messages at or above the set level', () => {
      logger.setLevel(LogLevel.WARN);

      logger.error('This should be logged');
      logger.warn('This should be logged');

      expect(mockOutput.write).toHaveBeenCalledTimes(2);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      logger.setConfig({
        level: LogLevel.DEBUG,
        timestamps: false,
        prefix: 'CUSTOM',
      });

      const config = logger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.timestamps).toBe(false);
      expect(config.prefix).toBe('CUSTOM');
    });

    it('should check if log level is enabled', () => {
      logger.setLevel(LogLevel.WARN);

      expect(logger.isEnabled(LogLevel.ERROR)).toBe(true);
      expect(logger.isEnabled(LogLevel.WARN)).toBe(true);
      expect(logger.isEnabled(LogLevel.INFO)).toBe(false);
      expect(logger.isEnabled(LogLevel.DEBUG)).toBe(false);
    });
  });

  describe('data logging', () => {
    it('should log messages with data', () => {
      const testData = { key: 'value', number: 42 };
      logger.info('Test message', testData);

      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('"key": "value"')
      );
    });

    it('should handle undefined data', () => {
      logger.info('Test message', undefined);

      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      expect(mockOutput.write).not.toHaveBeenCalledWith(
        expect.stringContaining('undefined')
      );
    });
  });

  describe('JSON output', () => {
    it('should output JSON format when enabled', () => {
      const jsonLogger = new Logger({
        json: true,
        output: mockOutput as any
      });

      jsonLogger.info('Test message', { data: 'value' });

      const output = mockOutput.write.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.data).toEqual({ data: 'value' });
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('child logger', () => {
    it('should create a child logger with prefix', () => {
      const childLogger = logger.child('CHILD');
      childLogger.info('Test message');

      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[CHILD]')
      );
      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });
  });

  describe('static factory methods', () => {
    it('should create JSON logger', () => {
      const jsonLogger = Logger.createJsonLogger({ output: mockOutput as any });
      jsonLogger.info('Test message');

      const output = mockOutput.write.mock.calls[0][0];
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should create minimal logger', () => {
      const minimalLogger = Logger.createMinimalLogger({ output: mockOutput as any });
      minimalLogger.info('Test message');

      const output = mockOutput.write.mock.calls[0][0];
      expect(output).not.toContain('[TIMESTAMP]');
      expect(output).toContain('Test message');
    });

    it('should create verbose logger', () => {
      const verboseLogger = Logger.createVerboseLogger({ output: mockOutput as any });
      verboseLogger.trace('Test message');

      expect(mockOutput.write).toHaveBeenCalledWith(
        expect.stringContaining('[TRACE]')
      );
    });
  });
});

describe('Default logger exports', () => {
  it('should export default logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should export convenience log functions', () => {
    expect(log.error).toBeDefined();
    expect(log.warn).toBeDefined();
    expect(log.info).toBeDefined();
    expect(log.debug).toBeDefined();
    expect(log.trace).toBeDefined();
  });

  it('should export factory functions', () => {
    expect(createLogger).toBeDefined();
    expect(createChildLogger).toBeDefined();
  });
});
