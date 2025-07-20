// Main exports for @node-native-audio/audio-capture-core
export * from './types';
export * from './audio-capture';
export * from './device-manager';
export * from './native-bindings';

// Re-export common types
export type {
  AudioDevice,
  AudioDeviceType,
  AudioFormat,
  AudioCaptureOptions,
  AudioCaptureEvent,
  AudioCaptureError
} from './types';
