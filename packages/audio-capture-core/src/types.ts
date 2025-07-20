/**
 * Audio device types supported by the capture system
 */
export enum AudioDeviceType {
  MICROPHONE = 'microphone',
  SPEAKERS = 'speakers',
  SYSTEM_AUDIO = 'system_audio',
  LOOPBACK = 'loopback',
}

/**
 * Audio format specifications
 */
export interface AudioFormat {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  signed: boolean;
  float: boolean;
}

/**
 * Audio device information
 */
export interface AudioDevice {
  id: string;
  name: string;
  type: AudioDeviceType;
  isDefault: boolean;
  isActive: boolean;
  supportedFormats: AudioFormat[];
  maxChannels: number;
  maxSampleRate: number;
  minSampleRate: number;
}

/**
 * Audio capture configuration options
 */
export interface AudioCaptureOptions {
  deviceId?: string;
  format?: Partial<AudioFormat>;
  bufferSize?: number;
  latency?: number;
  enableEchoCancellation?: boolean;
  enableNoiseSuppression?: boolean;
  enableAutomaticGainControl?: boolean;
}

/**
 * Audio capture events
 */
export interface AudioCaptureEvent {
  type: 'data' | 'error' | 'start' | 'stop' | 'device-change';
  timestamp: number;
  data?: Float32Array | Int16Array;
  error?: AudioCaptureError;
  deviceId?: string;
}

/**
 * Audio capture error types
 */
export interface AudioCaptureError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Audio capture statistics
 */
export interface AudioCaptureStats {
  samplesCaptured: number;
  bytesCaptured: number;
  duration: number;
  sampleRate: number;
  channels: number;
  bufferUnderruns: number;
  bufferOverruns: number;
  errors: number;
}

/**
 * Platform-specific audio APIs
 */
export enum AudioAPI {
  WASAPI = 'wasapi', // Windows
  CORE_AUDIO = 'core_audio', // macOS
  ALSA = 'alsa', // Linux
  PULSE_AUDIO = 'pulse_audio', // Linux
}

/**
 * Audio capture session information
 */
export interface AudioCaptureSession {
  id: string;
  deviceId: string;
  format: AudioFormat;
  startTime: number;
  isActive: boolean;
  stats: AudioCaptureStats;
}
