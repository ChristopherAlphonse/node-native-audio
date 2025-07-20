/**
 * Enhanced Error Handler
 * Provides structured error handling with user-friendly messages and troubleshooting steps
 */

import { Logger } from './logger';

const logger = new Logger();

// Error types for better categorization
export enum ErrorType {
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  INSTALLATION_FAILED = 'INSTALLATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// User-friendly error messages
export const USER_FRIENDLY_MESSAGES = {
  [ErrorType.DOWNLOAD_FAILED]: {
    title: 'Download Failed',
    message: 'Unable to download required files',
    suggestions: [
      'Check your internet connection',
      'Try again in a few minutes',
      'Verify if the [URL] string provided is correct'
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
  },
  [ErrorType.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Invalid input or data format',
    suggestions: [
      'Check your input data',
      'Verify file formats',
      'Review the documentation'
    ]
  },
  [ErrorType.RESOURCE_ERROR]: {
    title: 'Resource Error',
    message: 'Required resource is unavailable',
    suggestions: [
      'Check if the resource exists',
      'Verify access permissions',
      'Try again later'
    ]
  }
};

// Error context interface
export interface ErrorContext {
  platform?: string;
  arch?: string;
  version?: string;
  url?: string;
  path?: string;
  operation?: string;
  [key: string]: any;
}

// Error analysis result
export interface ErrorAnalysis {
  type: ErrorType;
  code: string;
  severity: ErrorSeverity;
  retryable: boolean;
  userActionable: boolean;
}

/**
 * Enhanced Error Handler Class
 * Provides comprehensive error handling with user-friendly messages and troubleshooting
 */
export class ErrorHandler {
  /**
   * Handle any error with detailed logging and user guidance
   */
  static handleError(
    error: Error,
    context: ErrorContext = {},
    operation?: string
  ): ErrorAnalysis {
    const errorInfo = this.analyzeError(error);

    // Log the technical error for developers
    logger.error('Operation failed', {
      operation: operation || 'unknown',
      error: error.message,
      stack: error.stack,
      errorType: errorInfo.type,
      errorCode: errorInfo.code,
      severity: errorInfo.severity,
      context,
      timestamp: new Date().toISOString()
    });

    // Log user-friendly information
    this.logUserGuidance(errorInfo, context);

    // Log specific troubleshooting steps
    this.logTroubleshootingSteps(errorInfo, context);

    return errorInfo;
  }

  /**
   * Handle Whisper-specific installation errors
   */
  static handleWhisperInstallationError(
    error: Error,
    context: ErrorContext = {}
  ): ErrorAnalysis {
    return this.handleError(error, context, 'Whisper Installation');
  }

  /**
   * Handle download errors with retry logic
   */
  static async handleDownloadError(
    error: Error,
    context: ErrorContext = {},
    retryOperation?: () => Promise<any>
  ): Promise<ErrorAnalysis> {
    const errorInfo = this.handleError(error, context, 'Download');

    if (errorInfo.retryable && retryOperation) {
      logger.info('Attempting automatic retry for download error');
      try {
        await this.retryOperation(retryOperation, 3, 2000);
        logger.info('Download retry successful');
        return errorInfo;
      } catch (retryError) {
        logger.error('Download retry failed', {
          error: (retryError as Error).message
        });
      }
    }

    return errorInfo;
  }

  /**
   * Analyze error to determine type and provide context
   */
  private static analyzeError(error: Error): ErrorAnalysis {
    const message = error.message.toLowerCase();
    const stack = error.stack || '';

    // Download errors
    if (message.includes('404') || message.includes('not found')) {
      return {
        type: ErrorType.DOWNLOAD_FAILED,
        code: 'RESOURCE_404',
        severity: ErrorSeverity.HIGH,
        retryable: true,
        userActionable: true
      };
    }

    if (message.includes('download') || message.includes('fetch')) {
      return {
        type: ErrorType.DOWNLOAD_FAILED,
        code: 'DOWNLOAD_FAILED',
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        userActionable: true
      };
    }

    // Permission errors
    if (message.includes('permission') || message.includes('access denied') ||
        message.includes('eacces') || message.includes('eperm')) {
      return {
        type: ErrorType.PERMISSION_ERROR,
        code: 'PERMISSION_DENIED',
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        userActionable: true
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('timeout') ||
        message.includes('enotfound') || message.includes('econnrefused')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        userActionable: true
      };
    }

    // Installation errors
    if (message.includes('install') || message.includes('setup') ||
        message.includes('binary') || message.includes('executable')) {
      return {
        type: ErrorType.INSTALLATION_FAILED,
        code: 'INSTALLATION_FAILED',
        severity: ErrorSeverity.HIGH,
        retryable: true,
        userActionable: true
      };
    }

    // Configuration errors
    if (message.includes('config') || message.includes('invalid') ||
        message.includes('missing') || message.includes('required')) {
      return {
        type: ErrorType.CONFIGURATION_ERROR,
        code: 'CONFIGURATION_ERROR',
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        userActionable: true
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('format') ||
        message.includes('invalid input')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        code: 'VALIDATION_ERROR',
        severity: ErrorSeverity.LOW,
        retryable: false,
        userActionable: true
      };
    }

    // Default to resource error
    return {
      type: ErrorType.RESOURCE_ERROR,
      code: 'UNKNOWN_ERROR',
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userActionable: false
    };
  }

  /**
   * Log user-friendly guidance
   */
  private static logUserGuidance(errorInfo: ErrorAnalysis, context: ErrorContext) {
    const userMessage = USER_FRIENDLY_MESSAGES[errorInfo.type];

    if (errorInfo.userActionable) {
      logger.warn('User Action Required', {
        title: userMessage.title,
        message: userMessage.message,
        suggestions: userMessage.suggestions,
        errorCode: errorInfo.code,
        platform: context.platform || process.platform,
        arch: context.arch || process.arch
      });
    } else {
      logger.error('System Error - Contact Support', {
        title: userMessage.title,
        message: userMessage.message,
        errorCode: errorInfo.code,
        severity: errorInfo.severity
      });
    }
  }

  /**
   * Log specific troubleshooting steps
   */
  private static logTroubleshootingSteps(errorInfo: ErrorAnalysis, context: ErrorContext) {
    const platform = context.platform || process.platform;

    logger.info('Troubleshooting Steps', {
      platform,
      errorCode: errorInfo.code,
      steps: this.getTroubleshootingSteps(errorInfo, platform, context)
    });
  }

  /**
   * Get platform-specific troubleshooting steps
   */
  private static getTroubleshootingSteps(
    errorInfo: ErrorAnalysis,
    platform: string,
    context: ErrorContext
  ): string[] {
    const steps: string[] = [];

    switch (errorInfo.type) {
      case ErrorType.DOWNLOAD_FAILED:
        steps.push(
          'Verify the download URL is accessible',
          'Check if the file exists on the server',
          'Try downloading manually from the source'
        );
        if (context.url) {
          steps.push(`Verify URL: ${context.url}`);
        }
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
        if (context.path) {
          steps.push(`Verify installation path: ${context.path}`);
        }
        break;

      case ErrorType.CONFIGURATION_ERROR:
        steps.push(
          'Check configuration file syntax',
          'Verify all required fields are present',
          'Reset configuration to defaults'
        );
        break;

      case ErrorType.VALIDATION_ERROR:
        steps.push(
          'Check input data format',
          'Verify file extensions and content',
          'Review documentation for required formats'
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
             finalError: (error as Error).message
           });
           throw error;
         }

        const delay = baseDelay * Math.pow(2, attempt - 1);

                 logger.warn('Operation failed, retrying', {
           operation: operation.name || 'unknown',
           attempt,
           maxRetries,
           delay,
           error: (error as Error).message
         });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Create a user-friendly error message
   */
  static createUserMessage(error: Error, context: ErrorContext = {}): string {
    const errorInfo = this.analyzeError(error);
    const userMessage = USER_FRIENDLY_MESSAGES[errorInfo.type];

    return `${userMessage.title}: ${userMessage.message}`;
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: Error): boolean {
    const errorInfo = this.analyzeError(error);
    return errorInfo.retryable;
  }

  /**
   * Get error severity
   */
  static getSeverity(error: Error): ErrorSeverity {
    const errorInfo = this.analyzeError(error);
    return errorInfo.severity;
  }
}
