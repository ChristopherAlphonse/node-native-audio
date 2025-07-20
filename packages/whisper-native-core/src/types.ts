/**
 * Whisper transcription types and interfaces
 */

export interface WhisperConfig {
  model: string;
  language?: string;
  realTime?: boolean;
  confidenceThreshold?: number;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  startTime: number;
  endTime: number;
  segments?: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  text: string;
  confidence: number;
  startTime: number;
  endTime: number;
  tokens?: number[];
}

export interface WhisperModel {
  name: string;
  size: string;
  language: string;
  url: string;
  localPath?: string;
  isDownloaded: boolean;
}

export interface WhisperError {
  code: string;
  message: string;
  details?: any;
}

export interface WhisperStats {
  processingTime: number;
  tokensProcessed: number;
  segmentsGenerated: number;
  averageConfidence: number;
}

export interface ModelDownloadProgress {
  model: string;
  downloaded: number;
  total: number;
  percentage: number;
  speed: number;
}
