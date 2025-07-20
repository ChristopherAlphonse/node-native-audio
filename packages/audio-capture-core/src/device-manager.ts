import { AudioDevice, AudioDeviceType, AudioFormat, AudioAPI } from './types';
import { NativeAudioCapture } from './native-bindings';

/**
 * Manages audio device enumeration and selection
 */
export class DeviceManager {
  private nativeCapture: NativeAudioCapture;
  private cachedDevices: AudioDevice[] = [];
  private lastRefreshTime = 0;
  private readonly CACHE_DURATION = 5000; // 5 seconds

  constructor() {
    this.nativeCapture = new NativeAudioCapture();
  }

  /**
   * Get all available audio devices
   */
  async getDevices(): Promise<AudioDevice[]> {
    const now = Date.now();

    // Return cached devices if still valid
    if (
      this.cachedDevices.length > 0 &&
      now - this.lastRefreshTime < this.CACHE_DURATION
    ) {
      return this.cachedDevices;
    }

    try {
      // Get devices from native layer
      const devices = await this.nativeCapture.getDevices();

      // Process and cache devices
      this.cachedDevices = devices.map(device => this.processDevice(device));
      this.lastRefreshTime = now;

      return this.cachedDevices;
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
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
   * Refresh device list
   */
  async refreshDevices(): Promise<AudioDevice[]> {
    this.cachedDevices = [];
    this.lastRefreshTime = 0;
    return this.getDevices();
  }

  /**
   * Get supported audio formats for a device
   */
  async getSupportedFormats(deviceId: string): Promise<AudioFormat[]> {
    try {
      return await this.nativeCapture.getSupportedFormats(deviceId);
    } catch (error) {
      console.error(
        `Failed to get supported formats for device ${deviceId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Check if a device supports a specific format
   */
  async supportsFormat(
    deviceId: string,
    format: AudioFormat
  ): Promise<boolean> {
    const supportedFormats = await this.getSupportedFormats(deviceId);
    return supportedFormats.some(
      supported =>
        supported.sampleRate === format.sampleRate &&
        supported.channels === format.channels &&
        supported.bitsPerSample === format.bitsPerSample &&
        supported.signed === format.signed &&
        supported.float === format.float
    );
  }

  /**
   * Get the current audio API being used
   */
  getCurrentAudioAPI(): AudioAPI {
    const platform = process.platform;

    switch (platform) {
      case 'win32':
        return AudioAPI.WASAPI;
      case 'darwin':
        return AudioAPI.CORE_AUDIO;
      case 'linux':
        return AudioAPI.ALSA; // Default to ALSA, can be overridden
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Process raw device data from native layer
   */
  private processDevice(rawDevice: any): AudioDevice {
    return {
      id: rawDevice.id,
      name: rawDevice.name,
      type: this.mapDeviceType(rawDevice.type),
      isDefault: rawDevice.isDefault || false,
      isActive: rawDevice.isActive || false,
      supportedFormats: rawDevice.supportedFormats || [],
      maxChannels: rawDevice.maxChannels || 2,
      maxSampleRate: rawDevice.maxSampleRate || 48000,
      minSampleRate: rawDevice.minSampleRate || 8000,
    };
  }

  /**
   * Map native device type to AudioDeviceType enum
   */
  private mapDeviceType(nativeType: string): AudioDeviceType {
    switch (nativeType.toLowerCase()) {
      case 'microphone':
      case 'mic':
      case 'input':
        return AudioDeviceType.MICROPHONE;
      case 'speakers':
      case 'output':
        return AudioDeviceType.SPEAKERS;
      case 'system_audio':
      case 'system':
        return AudioDeviceType.SYSTEM_AUDIO;
      case 'loopback':
        return AudioDeviceType.LOOPBACK;
      default:
        return AudioDeviceType.MICROPHONE;
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    await this.nativeCapture.dispose();
  }
}
