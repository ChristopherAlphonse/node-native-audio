// Main exports for @christopheralphonse/audio-processor-core
export * from './types';
export * from './audio-processor';
export * from './webrtc-processor';
export * from './simd-processor';

// Re-export common types
export type {
  AudioProcessorConfig,
  AudioProcessorError,
  AudioProcessorStats,
  EchoCancellationConfig,
  NoiseSuppressionConfig,
  AutomaticGainControlConfig,
  ProcessedAudioData,
} from './types';
