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
      const startPromise = capture.startCapture();

      // Mock the native capture to resolve immediately
      jest.spyOn(capture as any, 'nativeCapture').mockImplementation({
        start: jest.fn().mockResolvedValue(undefined),
      });

      await startPromise;
      expect(capture.isActive()).toBe(true);
    });

    it('should throw error if already capturing', async () => {
      // Mock to simulate already capturing
      jest.spyOn(capture, 'isActive').mockReturnValue(true);

      await expect(capture.startCapture()).rejects.toThrow(
        'Audio capture is already running'
      );
    });
  });

  describe('stopCapture', () => {
    it('should stop capture when active', async () => {
      // Mock to simulate active capture
      jest.spyOn(capture, 'isActive').mockReturnValue(true);
      jest.spyOn(capture as any, 'nativeCapture').mockImplementation({
        stop: jest.fn().mockResolvedValue(undefined),
      });

      await capture.stopCapture();
      expect(capture.isActive()).toBe(false);
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
      jest.spyOn(capture as any, 'nativeCapture').mockImplementation({
        start: jest.fn().mockResolvedValue(undefined),
      });

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
      jest.spyOn(capture as any, 'nativeCapture').mockImplementation({
        stop: jest.fn().mockResolvedValue(undefined),
      });

      capture.stopCapture();
    });
  });
});
