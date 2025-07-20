/**
 * Audio processing types and interfaces
 */

export interface AudioProcessorConfig {
  echoCancellation?: EchoCancellationConfig;
  noiseSuppression?: NoiseSuppressionConfig;
  automaticGainControl?: AutomaticGainControlConfig;
  simdOptimization?: boolean;
}

export interface EchoCancellationConfig {
  enabled: boolean;
  delay?: number;
  filterLength?: number;
}

export interface NoiseSuppressionConfig {
  enabled: boolean;
  level?: 'low' | 'moderate' | 'high' | 'very-high';
}

export interface AutomaticGainControlConfig {
  enabled: boolean;
  targetLevel?: number;
  compressionGain?: number;
}

export interface ProcessedAudioData {
  data: Float32Array;
  sampleRate: number;
  channels: number;
  timestamp: number;
}

export interface AudioProcessorError {
  code: string;
  message: string;
  details?: any;
}

export interface AudioProcessorStats {
  processingTime: number;
  samplesProcessed: number;
  echoSuppression: number;
  noiseSuppression: number;
  gainAdjustment: number;
}
