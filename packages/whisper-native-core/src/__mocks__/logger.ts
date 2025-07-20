// Mock logger for testing
interface MockLogger {
  info: jest.Mock;
  debug: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  trace: jest.Mock;
  child: jest.Mock<MockLogger>;
  setLevel: jest.Mock;
  dispose: jest.Mock;
}

const mockLogger: MockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  trace: jest.fn(),
  child: jest.fn(() => mockLogger),
  setLevel: jest.fn(),
  dispose: jest.fn()
};

export const logger = mockLogger;

export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace'
} as const;
