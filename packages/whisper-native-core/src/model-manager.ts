/**
 * Whisper model management
 * Handles downloading, caching, and managing Whisper models
 */

import { WhisperModel, ModelDownloadProgress } from './types';

export class ModelManager {
  private models: Map<string, WhisperModel> = new Map();
  private downloadPath: string;

  constructor(downloadPath: string = './models') {
    this.downloadPath = downloadPath;
    this.initializeDefaultModels();
  }

  /**
   * Initialize default Whisper models
   */
  private initializeDefaultModels(): void {
    const defaultModels: WhisperModel[] = [
      {
        name: 'tiny',
        size: '39 MB',
        language: 'multilingual',
        url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
        isDownloaded: false
      },
      {
        name: 'base',
        size: '74 MB',
        language: 'multilingual',
        url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
        isDownloaded: false
      },
      {
        name: 'small',
        size: '244 MB',
        language: 'multilingual',
        url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
        isDownloaded: false
      },
      {
        name: 'medium',
        size: '769 MB',
        language: 'multilingual',
        url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
        isDownloaded: false
      },
      {
        name: 'large',
        size: '1550 MB',
        language: 'multilingual',
        url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large.bin',
        isDownloaded: false
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.name, model);
    });
  }

  /**
   * Get available models
   */
  getAvailableModels(): WhisperModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Get a specific model
   */
  getModel(name: string): WhisperModel | undefined {
    return this.models.get(name);
  }

  /**
   * Check if model is downloaded
   */
  isModelDownloaded(name: string): boolean {
    const model = this.models.get(name);
    return model?.isDownloaded || false;
  }

  /**
   * Download a model
   */
  async downloadModel(name: string, onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    const model = this.models.get(name);
    if (!model) {
      throw new Error(`Model '${name}' not found`);
    }

    if (model.isDownloaded) {
      console.log(`Model '${name}' is already downloaded`);
      return;
    }

    try {
      console.log(`Downloading model '${name}' from ${model.url}`);

      // TODO: Implement actual model downloading
      // This is a placeholder that simulates download progress
      await this.simulateDownload(model, onProgress);

      model.isDownloaded = true;
      model.localPath = `${this.downloadPath}/${name}.bin`;

      console.log(`Model '${name}' downloaded successfully`);
    } catch (error) {
      console.error(`Failed to download model '${name}':`, error);
      throw error;
    }
  }

  /**
   * Simulate model download (placeholder)
   */
  private async simulateDownload(model: WhisperModel, onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    const totalSize = this.parseModelSize(model.size);
    let downloaded = 0;
    const chunkSize = totalSize / 100;

    while (downloaded < totalSize) {
      downloaded += chunkSize;
      const percentage = Math.min((downloaded / totalSize) * 100, 100);

      if (onProgress) {
        onProgress({
          model: model.name,
          downloaded: Math.floor(downloaded),
          total: totalSize,
          percentage: Math.floor(percentage),
          speed: chunkSize * 10 // Simulated speed
        });
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Parse model size string to bytes
   */
  private parseModelSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(MB|GB)$/i);
    if (!match) {
      return 100 * 1024 * 1024; // Default to 100MB
    }

    const size = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case 'MB':
        return size * 1024 * 1024;
      case 'GB':
        return size * 1024 * 1024 * 1024;
      default:
        return size * 1024 * 1024;
    }
  }

  /**
   * Remove a downloaded model
   */
  async removeModel(name: string): Promise<void> {
    const model = this.models.get(name);
    if (!model) {
      throw new Error(`Model '${name}' not found`);
    }

    if (!model.isDownloaded) {
      console.log(`Model '${name}' is not downloaded`);
      return;
    }

    try {
      // TODO: Implement actual file removal
      console.log(`Removing model '${name}'`);

      model.isDownloaded = false;
      model.localPath = undefined;

      console.log(`Model '${name}' removed successfully`);
    } catch (error) {
      console.error(`Failed to remove model '${name}':`, error);
      throw error;
    }
  }

  /**
   * Get download path
   */
  getDownloadPath(): string {
    return this.downloadPath;
  }

  /**
   * Set download path
   */
  setDownloadPath(path: string): void {
    this.downloadPath = path;
  }
}
