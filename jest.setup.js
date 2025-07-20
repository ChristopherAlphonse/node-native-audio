// Global test setup
process.env.NODE_ENV = 'test';

// Mock native addons for testing
jest.mock('node-addon-api', () => ({
  Napi: {
    Object: class MockObject {},
    String: class MockString {},
    Number: class MockNumber {},
    Boolean: class MockBoolean {},
    Array: class MockArray {},
    Function: class MockFunction {},
  },
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock EventEmitter for testing
jest.mock('events', () => {
  const EventEmitter = jest.requireActual('events').EventEmitter;
  return {
    EventEmitter,
  };
});
