import { AudioCapture } from '../audio-capture';
import { AudioDeviceType } from '../types';

describe('AudioCapture', () => {
  let capture: AudioCapture;

  beforeEach(() => {
    capture = new AudioCapture();
  });

  afterEach(async () => {
    await capture.dispose();
  });

  describe('constructor', () => {
    it('should create an AudioCapture instance', () => {
      expect(capture).toBeInstanceOf(AudioCapture);
    });

    it('should not be capturing initially', () => {
      expect(capture.isActive()).toBe(false);
    });
  });

  describe('getDevices', () => {
    it('should return an array of devices', async () => {
      const devices = await capture.getDevices();
      expect(Array.isArray(devices)).toBe(true);
    });
  });

  describe('getDevicesByType', () => {
    it('should return devices of specified type', async () => {
      const microphones = await capture.getDevicesByType(
        AudioDeviceType.MICROPHONE
      );
      expect(Array.isArray(microphones)).toBe(true);

      // All returned devices should be microphones
      microphones.forEach(device => {
        expect(device.type).toBe(AudioDeviceType.MICROPHONE);
      });
    });
  });

  describe('getDefaultDevice', () => {
    it('should return default device for type', async () => {
      const defaultMic = await capture.getDefaultDevice(
        AudioDeviceType.MICROPHONE
      );
      if (defaultMic) {
        expect(defaultMic.type).toBe(AudioDeviceType.MICROPHONE);
        expect(defaultMic.isDefault).toBe(true);
      }
    });
  });

  describe('startCapture', () => {
    it('should start capture with default options', async () => {
      // Mock the getDefaultDevice to return a mock device
      jest.spyOn(capture, 'getDefaultDevice').mockResolvedValue({
        id: 'mock-device-id',
        name: 'Mock Microphone',
        type: AudioDeviceType.MICROPHONE,
        isDefault: true,
        isActive: false,
        supportedFormats: [
          {
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            signed: true,
            float: false,
          },
        ],
        maxChannels: 2,
        maxSampleRate: 48000,
        minSampleRate: 8000,
      });

      // Mock the native capture start method
      const mockNativeCapture = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        dispose: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      };
      (capture as any).nativeCapture = mockNativeCapture;

      // Mock the device manager to return the mock device
      const mockDeviceManager = {
        getDevices: jest.fn().mockResolvedValue([
          {
            id: 'mock-device-id',
            name: 'Mock Microphone',
            type: AudioDeviceType.MICROPHONE,
            isDefault: true,
            isActive: false,
            supportedFormats: [
              {
                sampleRate: 16000,
                channels: 1,
                bitsPerSample: 16,
                signed: true,
                float: false,
              },
            ],
            maxChannels: 2,
            maxSampleRate: 48000,
            minSampleRate: 8000,
          },
        ]),
        dispose: jest.fn().mockResolvedValue(undefined),
      };
      (capture as any).deviceManager = mockDeviceManager;

      await capture.startCapture();
      expect(capture.isActive()).toBe(true);
      expect(mockNativeCapture.start).toHaveBeenCalled();
    });

    it('should throw error if already capturing', async () => {
      // Mock to simulate already capturing
      jest.spyOn(capture, 'isActive').mockReturnValue(true);

      // Mock the device manager to avoid device lookup errors
      const mockDeviceManager = {
        getDevices: jest.fn().mockResolvedValue([]),
        dispose: jest.fn().mockResolvedValue(undefined),
      };
      (capture as any).deviceManager = mockDeviceManager;

      await expect(capture.startCapture()).rejects.toThrow(
        'Audio capture is already running'
      );
    });
  });

  describe('stopCapture', () => {
    it('should stop capture when active', async () => {
      // Mock to simulate active capture
      jest.spyOn(capture, 'isActive').mockReturnValueOnce(true).mockReturnValueOnce(false);

      // Mock the native capture stop method
      const mockNativeCapture = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        dispose: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      };
      (capture as any).nativeCapture = mockNativeCapture;

      await capture.stopCapture();
      expect(capture.isActive()).toBe(false);
      expect(mockNativeCapture.stop).toHaveBeenCalled();
    });

    it('should not throw error if not capturing', async () => {
      // Mock to simulate not capturing
      jest.spyOn(capture, 'isActive').mockReturnValue(false);

      await expect(capture.stopCapture()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentSession', () => {
    it('should return null when no session is active', () => {
      expect(capture.getCurrentSession()).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return null when no session is active', () => {
      expect(capture.getStats()).toBeNull();
    });
  });

  describe('events', () => {
    it('should emit start event when capture starts', done => {
      capture.on('start', event => {
        expect(event.type).toBe('start');
        expect(event.timestamp).toBeDefined();
        done();
      });

      // Mock successful start
      jest.spyOn(capture, 'getDefaultDevice').mockResolvedValue({
        id: 'mock-device-id',
        name: 'Mock Microphone',
        type: AudioDeviceType.MICROPHONE,
        isDefault: true,
        isActive: false,
        supportedFormats: [
          {
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            signed: true,
            float: false,
          },
        ],
        maxChannels: 2,
        maxSampleRate: 48000,
        minSampleRate: 8000,
      });

      const mockNativeCapture = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        dispose: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      };
      (capture as any).nativeCapture = mockNativeCapture;

      // Mock the device manager to return the mock device
      const mockDeviceManager = {
        getDevices: jest.fn().mockResolvedValue([
          {
            id: 'mock-device-id',
            name: 'Mock Microphone',
            type: AudioDeviceType.MICROPHONE,
            isDefault: true,
            isActive: false,
            supportedFormats: [
              {
                sampleRate: 16000,
                channels: 1,
                bitsPerSample: 16,
                signed: true,
                float: false,
              },
            ],
            maxChannels: 2,
            maxSampleRate: 48000,
            minSampleRate: 8000,
          },
        ]),
        dispose: jest.fn().mockResolvedValue(undefined),
      };
      (capture as any).deviceManager = mockDeviceManager;

      capture.startCapture();
    });

    it('should emit stop event when capture stops', done => {
      capture.on('stop', event => {
        expect(event.type).toBe('stop');
        expect(event.timestamp).toBeDefined();
        done();
      });

      // Mock successful stop
      jest.spyOn(capture, 'isActive').mockReturnValue(true);

      const mockNativeCapture = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        dispose: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      };
      (capture as any).nativeCapture = mockNativeCapture;

      capture.stopCapture();
    });
  });
});
