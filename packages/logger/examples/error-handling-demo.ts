#!/usr/bin/env node

/**
 * Error Handling Demo
 * Shows how to handle complex errors with our logger for better user experience
 */

import { logger } from '../src/index';

// Error types for better categorization
enum ErrorType {
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  INSTALLATION_FAILED = 'INSTALLATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

// User-friendly error messages
const USER_FRIENDLY_MESSAGES = {
  [ErrorType.DOWNLOAD_FAILED]: {
    title: 'Download Failed',
    message: 'Unable to download required files',
    suggestions: [
      'Check your internet connection',
      'Try again in a few minutes',
      'Contact support if the problem persists'
    ]
  },
  [ErrorType.INSTALLATION_FAILED]: {
    title: 'Installation Failed',
    message: 'Unable to install required components',
    suggestions: [
      'Ensure you have administrator privileges',
      'Check available disk space',
      'Try running as administrator'
    ]
  },
  [ErrorType.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Unable to connect to required services',
    suggestions: [
      'Check your internet connection',
      'Verify firewall settings',
      'Try using a different network'
    ]
  },
  [ErrorType.PERMISSION_ERROR]: {
    title: 'Permission Error',
    message: 'Insufficient permissions to perform operation',
    suggestions: [
      'Run the application as administrator',
      'Check folder permissions',
      'Contact your system administrator'
    ]
  },
  [ErrorType.CONFIGURATION_ERROR]: {
    title: 'Configuration Error',
    message: 'Invalid or missing configuration',
    suggestions: [
      'Check your configuration file',
      'Reset to default settings',
      'Contact support for assistance'
    ]
  }
};

// Enhanced error handler
class ErrorHandler {
  /**
   * Handle Whisper installation errors with detailed logging
   */
  static handleWhisperInstallationError(error: Error, context: any = {}) {
    const errorInfo = this.analyzeError(error);

    // Log the technical error for developers
    logger.error('Whisper installation failed', {
      error: error.message,
      stack: error.stack,
      errorType: errorInfo.type,
      context,
      timestamp: new Date().toISOString()
    });

    // Log user-friendly information
    const userMessage = USER_FRIENDLY_MESSAGES[errorInfo.type];

    logger.warn('User Action Required', {
      title: userMessage.title,
      message: userMessage.message,
      suggestions: userMessage.suggestions,
      errorCode: errorInfo.code,
      platform: process.platform,
      arch: process.arch
    });

    // Log specific troubleshooting steps
    this.logTroubleshootingSteps(errorInfo, context);
  }

  /**
   * Analyze error to determine type and provide context
   */
  private static analyzeError(error: Error) {
    const message = error.message.toLowerCase();
    const stack = error.stack || '';

    if (message.includes('404') || message.includes('not found')) {
      return {
        type: ErrorType.DOWNLOAD_FAILED,
        code: 'WHISPER_404',
        severity: 'high',
        retryable: true
      };
    }

    if (message.includes('permission') || message.includes('access denied')) {
      return {
        type: ErrorType.PERMISSION_ERROR,
        code: 'WHISPER_PERMISSION',
        severity: 'medium',
        retryable: true
      };
    }

    if (message.includes('network') || message.includes('timeout')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        code: 'WHISPER_NETWORK',
        severity: 'medium',
        retryable: true
      };
    }

    if (message.includes('install') || message.includes('setup')) {
      return {
        type: ErrorType.INSTALLATION_FAILED,
        code: 'WHISPER_INSTALL',
        severity: 'high',
        retryable: true
      };
    }

    return {
      type: ErrorType.CONFIGURATION_ERROR,
      code: 'WHISPER_UNKNOWN',
      severity: 'medium',
      retryable: false
    };
  }

  /**
   * Log specific troubleshooting steps based on error type
   */
  private static logTroubleshootingSteps(errorInfo: any, context: any) {
    const platform = process.platform;

    logger.info('Troubleshooting Steps', {
      platform,
      errorCode: errorInfo.code,
      steps: this.getTroubleshootingSteps(errorInfo, platform, context)
    });
  }

  /**
   * Get platform-specific troubleshooting steps
   */
  private static getTroubleshootingSteps(errorInfo: any, platform: string, context: any): string[] {
    const steps: string[] = [];

    switch (errorInfo.type) {
      case ErrorType.DOWNLOAD_FAILED:
        steps.push(
          'Verify the download URL is accessible',
          'Check if the file exists on the server',
          'Try downloading manually from the source'
        );
        break;

      case ErrorType.PERMISSION_ERROR:
        if (platform === 'win32') {
          steps.push(
            'Right-click the application and select "Run as administrator"',
            'Check Windows Defender settings',
            'Verify folder permissions in Program Files'
          );
        } else if (platform === 'darwin') {
          steps.push(
            'Grant necessary permissions in System Preferences > Security & Privacy',
            'Check if the app is blocked by Gatekeeper',
            'Try running: sudo chmod +x /path/to/whisper'
          );
        } else {
          steps.push(
            'Run with sudo if required',
            'Check file permissions: ls -la /path/to/whisper',
            'Verify user has execute permissions'
          );
        }
        break;

      case ErrorType.NETWORK_ERROR:
        steps.push(
          'Check firewall and antivirus settings',
          'Try using a VPN or different network',
          'Verify proxy settings if applicable'
        );
        break;

      case ErrorType.INSTALLATION_FAILED:
        steps.push(
          'Ensure sufficient disk space (at least 2GB free)',
          'Check if antivirus is blocking the installation',
          'Try installing in a different directory'
        );
        break;
    }

    return steps;
  }

  /**
   * Handle auto-retry logic with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          logger.error('Operation failed after all retries', {
            operation: operation.name || 'unknown',
            attempts: maxRetries,
            finalError: error.message
          });
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);

        logger.warn('Operation failed, retrying', {
          operation: operation.name || 'unknown',
          attempt,
          maxRetries,
          delay,
          error: error.message
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Example usage simulating the Whisper installation error
async function demonstrateErrorHandling() {
  logger.info('=== Error Handling Demo ===');
  logger.info('Demonstrating how to handle Whisper installation errors');

  // Simulate the original error
  const originalError = new Error('Failed to install Whisper on Windows: Download failed: 404 Not Found');
  originalError.stack = `Error: Failed to install Whisper on Windows: Download failed: 404 Not Found
    at WhisperService.installWindows (C:\\Users\\chris-desktop\\Desktop\\work\\glass-main\\glass-main\\src\\features\\common\\services\\whisperService.js:409:19)
    at async WhisperService.autoInstall (C:\\Users\\chris-desktop\\Desktop\\work\\glass-main\\glass-main\\src\\features\\common\\services\\localAIServiceBase.js:84:28)
    at async WhisperService.ensureWhisperBinary (C:\\Users\\chris-desktop\\Desktop\\work\\glass-main\\glass-main\\src\\features\\common\\services\\whisperService.js:108:9)
    at async WhisperService.initialize (C:\\Users\\chris-desktop\\Desktop\\work\\glass-main\\glass-main\\src\\features\\common\\services\\whisperService.js:58:13)
    at async WhisperService.handleGetInstalledModels (C:\\Users\\chris-desktop\\Desktop\\work\\glass-main\\glass-main\\src\\features\\common\\services\\whisperService.js:204:17)
    at async C:\\Users\\chris-desktop\\Desktop\\work\\glass-main\\glass-main\\src\\bridge\\featureBridge.js:55:64
    at async WebContents.<anonymous> (node:electron/js2c/browser_init:2:82941)`;

  logger.info('Original error would look like this:');
  console.log('\n[WhisperService] Auto-installation failed:', originalError.message);
  console.log('    at WhisperService.installWindows (...)\n');

  logger.info('With our logger, it becomes much more helpful:');

  // Handle the error with our enhanced error handler
  ErrorHandler.handleWhisperInstallationError(originalError, {
    platform: 'win32',
    arch: 'x64',
    whisperVersion: '1.5.0',
    downloadUrl: 'https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.0/whisper-bin-x64.zip'
  });

  // Demonstrate retry logic
  logger.info('=== Retry Logic Demo ===');

  let attemptCount = 0;
  const failingOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Temporary network error');
    }
    return 'Success!';
  };

  try {
    const result = await ErrorHandler.retryOperation(failingOperation, 3, 500);
    logger.info('Retry operation succeeded', { result });
  } catch (error) {
    logger.error('Retry operation failed', { error: (error as Error).message });
  }
}

// Run the demo
demonstrateErrorHandling().catch(error => {
  logger.error('Demo failed', { error: error.message });
  process.exit(1);
});

export { ErrorHandler, ErrorType, USER_FRIENDLY_MESSAGES };
