import { EventEmitter } from 'events';
import {
  AudioDevice,
  AudioDeviceType,
  AudioFormat,
  AudioCaptureOptions,
  AudioCaptureEvent,
  AudioCaptureError,
  AudioCaptureStats,
  AudioCaptureSession
} from './types';
import { DeviceManager } from './device-manager';
import { NativeAudioCapture } from './native-bindings';

/**
 * Main audio capture class providing high-level API for audio capture
 */
export class AudioCapture extends EventEmitter {
  private nativeCapture: NativeAudioCapture;
  private deviceManager: DeviceManager;
  private currentSession: AudioCaptureSession | null = null;
  private isCapturing = false;

  constructor() {
    super();
    this.nativeCapture = new NativeAudioCapture();
    this.deviceManager = new DeviceManager();

    // Forward native events
    this.nativeCapture.on('data', (data: Float32Array | Int16Array) => {
      this.emit('data', {
        type: 'data',
        timestamp: Date.now(),
        data
      } as AudioCaptureEvent);
    });

    this.nativeCapture.on('error', (error: AudioCaptureError) => {
      this.emit('error', {
        type: 'error',
        timestamp: Date.now(),
        error
      } as AudioCaptureEvent);
    });
  }

  /**
   * Get all available audio devices
   */
  async getDevices(): Promise<AudioDevice[]> {
    return this.deviceManager.getDevices();
  }

  /**
   * Get devices by type
   */
  async getDevicesByType(type: AudioDeviceType): Promise<AudioDevice[]> {
    const devices = await this.getDevices();
    return devices.filter(device => device.type === type);
  }

  /**
   * Get default device for a specific type
   */
  async getDefaultDevice(type: AudioDeviceType): Promise<AudioDevice | null> {
    const devices = await this.getDevicesByType(type);
    return devices.find(device => device.isDefault) || null;
  }

  /**
   * Start audio capture with specified options
   */
  async startCapture(options: AudioCaptureOptions = {}): Promise<void> {
    if (this.isCapturing) {
      throw new Error('Audio capture is already running');
    }

    try {
      // Get device if not specified
      if (!options.deviceId) {
        const defaultDevice = await this.getDefaultDevice(AudioDeviceType.MICROPHONE);
        if (!defaultDevice) {
          throw new Error('No default microphone device found');
        }
        options.deviceId = defaultDevice.id;
      }

      // Validate device exists
      const devices = await this.getDevices();
      const device = devices.find(d => d.id === options.deviceId);
      if (!device) {
        throw new Error(`Device with ID ${options.deviceId} not found`);
      }

      // Set default format if not specified
      if (!options.format) {
        options.format = {
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          signed: true,
          float: false
        };
      }

      // Start native capture
      await this.nativeCapture.start(options);

      // Create session
      this.currentSession = {
        id: `session_${Date.now()}`,
        deviceId: options.deviceId,
        format: options.format as AudioFormat,
        startTime: Date.now(),
        isActive: true,
        stats: {
          samplesCaptured: 0,
          bytesCaptured: 0,
          duration: 0,
          sampleRate: options.format!.sampleRate!,
          channels: options.format!.channels!,
          bufferUnderruns: 0,
          bufferOverruns: 0,
          errors: 0
        }
      };

      this.isCapturing = true;

      this.emit('start', {
        type: 'start',
        timestamp: Date.now(),
        deviceId: options.deviceId
      } as AudioCaptureEvent);

    } catch (error) {
      const captureError: AudioCaptureError = {
        code: 'START_FAILED',
        message: error instanceof Error ? error.message : 'Failed to start audio capture',
        details: error
      };

      this.emit('error', {
        type: 'error',
        timestamp: Date.now(),
        error: captureError
      } as AudioCaptureEvent);

      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  async stopCapture(): Promise<void> {
    if (!this.isCapturing) {
      return;
    }

    try {
      await this.nativeCapture.stop();

      if (this.currentSession) {
        this.currentSession.isActive = false;
        this.currentSession.stats.duration = Date.now() - this.currentSession.startTime;
      }

      this.isCapturing = false;

      this.emit('stop', {
        type: 'stop',
        timestamp: Date.now()
      } as AudioCaptureEvent);

    } catch (error) {
      const captureError: AudioCaptureError = {
        code: 'STOP_FAILED',
        message: error instanceof Error ? error.message : 'Failed to stop audio capture',
        details: error
      };

      this.emit('error', {
        type: 'error',
        timestamp: Date.now(),
        error: captureError
      } as AudioCaptureEvent);

      throw error;
    }
  }

  /**
   * Get current capture session
   */
  getCurrentSession(): AudioCaptureSession | null {
    return this.currentSession;
  }

  /**
   * Get capture statistics
   */
  getStats(): AudioCaptureStats | null {
    return this.currentSession?.stats || null;
  }

  /**
   * Check if capture is active
   */
  isActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.isCapturing) {
      await this.stopCapture();
    }

    await this.nativeCapture.dispose();
    await this.deviceManager.dispose();
  }
}
