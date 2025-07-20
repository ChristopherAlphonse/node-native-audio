#!/usr/bin/env node

/**
 * Whisper Service Example
 * Shows how to integrate the ErrorHandler into a real Whisper service
 */

import { Logger, ErrorHandler, ErrorType, ErrorContext } from '../src/index';

const logger = new Logger();

// Example Whisper Service with enhanced error handling
class WhisperService {
  private isInstalled = false;
  private installationPath = '';

  /**
   * Initialize the Whisper service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Whisper service');

      // Check if Whisper is installed
      await this.ensureWhisperBinary();

      // Load models
      await this.loadModels();

      logger.info('Whisper service initialized successfully');
    } catch (error) {
      // Use our enhanced error handler
      ErrorHandler.handleWhisperInstallationError(error as Error, {
        platform: process.platform,
        arch: process.arch,
        operation: 'Whisper Initialization'
      });

      // Re-throw the error for the calling code to handle
      throw error;
    }
  }

  /**
   * Ensure Whisper binary is installed
   */
  private async ensureWhisperBinary(): Promise<void> {
    if (this.isInstalled) {
      logger.debug('Whisper binary already installed');
      return;
    }

    try {
      logger.info('Checking Whisper installation');

      // Simulate installation check
      const isInstalled = await this.checkInstallation();

      if (!isInstalled) {
        logger.info('Whisper not found, attempting auto-installation');
        await this.autoInstall();
      }

      this.isInstalled = true;
      logger.info('Whisper binary verified');
    } catch (error) {
      // Handle installation errors with context
      const context: ErrorContext = {
        platform: process.platform,
        arch: process.arch,
        operation: 'Whisper Binary Installation',
        path: this.installationPath
      };

      ErrorHandler.handleError(error as Error, context, 'Whisper Installation');
      throw error;
    }
  }

  /**
   * Auto-install Whisper
   */
  private async autoInstall(): Promise<void> {
    const platform = process.platform;
    const arch = process.arch;

    logger.info('Starting auto-installation', { platform, arch });

    try {
      if (platform === 'win32') {
        await this.installWindows();
      } else if (platform === 'darwin') {
        await this.installMac();
      } else {
        await this.installLinux();
      }
    } catch (error) {
      // This is where your original error would be caught
      const context: ErrorContext = {
        platform,
        arch,
        operation: 'Auto Installation',
        url: this.getDownloadUrl(platform, arch)
      };

      // Enhanced error handling with retry logic
      await ErrorHandler.handleDownloadError(
        error as Error,
        context,
        () => this.retryInstallation(platform, arch)
      );

      throw error;
    }
  }

  /**
   * Install Whisper on Windows
   */
  private async installWindows(): Promise<void> {
    logger.info('Installing Whisper on Windows');

    // Simulate the error from your original code
    const downloadUrl = this.getDownloadUrl('win32', process.arch);

    try {
      // Simulate download attempt
      await this.downloadFile(downloadUrl);
      logger.info('Windows installation completed');
    } catch (error) {
      // This simulates your original 404 error
      const context: ErrorContext = {
        platform: 'win32',
        arch: process.arch,
        url: downloadUrl,
        operation: 'Windows Installation'
      };

      ErrorHandler.handleError(error as Error, context, 'Windows Installation');
      throw error;
    }
  }

  /**
   * Install Whisper on Mac
   */
  private async installMac(): Promise<void> {
    logger.info('Installing Whisper on macOS');
    // Implementation would go here
  }

  /**
   * Install Whisper on Linux
   */
  private async installLinux(): Promise<void> {
    logger.info('Installing Whisper on Linux');
    // Implementation would go here
  }

  /**
   * Get download URL for platform/arch
   */
  private getDownloadUrl(platform: string, arch: string): string {
    const baseUrl = 'https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.0';

    if (platform === 'win32') {
      return `${baseUrl}/whisper-bin-x64.zip`;
    } else if (platform === 'darwin') {
      return `${baseUrl}/whisper-bin-darwin-x64.zip`;
    } else {
      return `${baseUrl}/whisper-bin-linux-x64.zip`;
    }
  }

  /**
   * Simulate file download
   */
  private async downloadFile(url: string): Promise<void> {
    logger.debug('Downloading file', { url });

    // Simulate the 404 error from your original code
    if (url.includes('whisper-bin-x64.zip')) {
      throw new Error('Failed to install Whisper on Windows: Download failed: 404 Not Found');
    }

    // Simulate successful download
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Check if Whisper is installed
   */
  private async checkInstallation(): Promise<boolean> {
    // Simulate installation check
    return false; // Always return false to trigger installation
  }

  /**
   * Load Whisper models
   */
  private async loadModels(): Promise<void> {
    logger.info('Loading Whisper models');
    // Implementation would go here
  }

  /**
   * Retry installation with exponential backoff
   */
  private async retryInstallation(platform: string, arch: string): Promise<void> {
    logger.info('Retrying installation', { platform, arch });

    // Use the built-in retry logic
    return ErrorHandler.retryOperation(
      async () => {
        if (platform === 'win32') {
          await this.installWindows();
        } else if (platform === 'darwin') {
          await this.installMac();
        } else {
          await this.installLinux();
        }
      },
      3, // max retries
      2000 // base delay
    );
  }

  /**
   * Transcribe audio
   */
  async transcribe(audioData: Float32Array): Promise<string> {
    try {
      logger.info('Starting transcription', { samples: audioData.length });

      // Simulate transcription
      await new Promise(resolve => setTimeout(resolve, 500));

      return 'Hello, this is a simulated transcription result.';
    } catch (error) {
      ErrorHandler.handleError(error as Error, {
        operation: 'Transcription',
        samples: audioData.length
      });
      throw error;
    }
  }
}

// Example usage
async function demonstrateWhisperService() {
  logger.info('=== Whisper Service Error Handling Demo ===');

  const whisperService = new WhisperService();

  try {
    // This will trigger the installation error
    await whisperService.initialize();

    // If we get here, try transcription
    const result = await whisperService.transcribe(new Float32Array(16000));
    logger.info('Transcription result', { text: result });

  } catch (error) {
    logger.error('Service initialization failed', {
      error: (error as Error).message
    });

    // Show how to get user-friendly message
    const userMessage = ErrorHandler.createUserMessage(error as Error);
    logger.info('User-friendly message', { message: userMessage });

    // Show error analysis
    const isRetryable = ErrorHandler.isRetryable(error as Error);
    const severity = ErrorHandler.getSeverity(error as Error);

    logger.info('Error analysis', {
      isRetryable,
      severity,
      shouldRetry: isRetryable ? 'Yes, this error can be retried' : 'No, manual intervention required'
    });
  }
}

// Run the demo
demonstrateWhisperService().catch(error => {
  logger.error('Demo failed', { error: (error as Error).message });
  process.exit(1);
});

export { WhisperService };
