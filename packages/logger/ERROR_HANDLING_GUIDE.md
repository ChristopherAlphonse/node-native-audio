# Error Handling Guide

## Transforming Cryptic Errors into User-Friendly Messages

This guide shows how our `ErrorHandler` transforms cryptic technical errors into clear, actionable information for users.

## Before: Cryptic Error

Your original error was completely unhelpful to users:

```
[WhisperService] Auto-installation failed: Error: Failed to install Whisper on Windows: Download failed: 404 Not Found
    at WhisperService.installWindows (C:\Users\chris-desktop\Desktop\work\glass-main\glass-main\src\features\common\services\whisperService.js:409:19)
    at async WhisperService.autoInstall (C:\Users\chris-desktop\Desktop\work\glass-main\glass-main\src\features\common\services\localAIServiceBase.js:84:28)
    at async WhisperService.ensureWhisperBinary (C:\Users\chris-desktop\Desktop\work\glass-main\glass-main\src\features\common\services\whisperService.js:108:9)
    at async WhisperService.initialize (C:\Users\chris-desktop\Desktop\work\glass-main\glass-main\src\features\common\services\whisperService.js:58:13)
    at async WhisperService.handleGetInstalledModels (C:\Users\chris-desktop\Desktop\work\glass-main\glass-main\src\features\common\services\whisperService.js:204:17)
    at async C:\Users\chris-desktop\Desktop\work\glass-main\glass-main\src\bridge\featureBridge.js:55:64
    at async WebContents.<anonymous> (node:electron/js2c/browser_init:2:82941)
```

**Problems with this error:**
- ❌ Technical jargon users don't understand
- ❌ No clear action the user can take
- ❌ No context about what went wrong
- ❌ No suggestions for fixing the issue
- ❌ Stack trace is overwhelming and unhelpful

## After: User-Friendly Error Handling

With our `ErrorHandler`, the same error becomes:

### 🔴 **Technical Error (for developers)**
```
[ERROR] Operation failed {
  "operation": "Windows Installation",
  "error": "Failed to install Whisper on Windows: Download failed: 404 Not Found",
  "errorType": "DOWNLOAD_FAILED",
  "errorCode": "RESOURCE_404",
  "severity": "high",
  "context": {
    "platform": "win32",
    "arch": "x64",
    "url": "https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.0/whisper-bin-x64.zip"
  }
}
```

### 🟡 **User Action Required (for users)**
```
[WARN] User Action Required {
  "title": "Download Failed",
  "message": "Unable to download required files",
  "suggestions": [
    "Check your internet connection",
    "Try again in a few minutes",
    "Contact support if the problem persists"
  ],
  "errorCode": "RESOURCE_404"
}
```

### 🔵 **Troubleshooting Steps (actionable guidance)**
```
[INFO] Troubleshooting Steps {
  "platform": "win32",
  "errorCode": "RESOURCE_404",
  "steps": [
    "Verify the download URL is accessible",
    "Check if the file exists on the server",
    "Try downloading manually from the source",
    "Verify URL: https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.0/whisper-bin-x64.zip"
  ]
}
```

## Key Benefits

### ✅ **For Users**
- **Clear Problem Description**: "Download Failed: Unable to download required files"
- **Actionable Suggestions**: Specific steps they can take
- **Platform-Specific Guidance**: Different advice for Windows/Mac/Linux
- **Error Codes**: For support reference
- **No Technical Jargon**: Plain language explanations

### ✅ **For Developers**
- **Full Technical Details**: Complete error context and stack traces
- **Error Classification**: Automatic categorization (DOWNLOAD_FAILED, PERMISSION_ERROR, etc.)
- **Structured Data**: JSON format for logging systems
- **Retry Logic**: Automatic retry with exponential backoff
- **Severity Levels**: High/Medium/Low for prioritization

### ✅ **For Support Teams**
- **Error Codes**: Easy to search and categorize issues
- **Context Information**: Platform, architecture, URLs, paths
- **Reproducible Steps**: Clear troubleshooting guidance
- **User-Friendly Messages**: Ready to share with users

## Implementation Example

```typescript
import { ErrorHandler, ErrorContext } from '@calphonse/logger';

// In your Whisper service
async installWindows(): Promise<void> {
  try {
    await this.downloadFile(downloadUrl);
  } catch (error) {
    // Transform cryptic error into user-friendly guidance
    const context: ErrorContext = {
      platform: 'win32',
      arch: process.arch,
      url: downloadUrl,
      operation: 'Windows Installation'
    };

    ErrorHandler.handleError(error as Error, context, 'Windows Installation');
    throw error; // Re-throw for calling code to handle
  }
}
```

## Error Types Supported

| Error Type | Description | Retryable | User Actionable |
|------------|-------------|-----------|-----------------|
| `DOWNLOAD_FAILED` | File download issues | ✅ Yes | ✅ Yes |
| `PERMISSION_ERROR` | Access denied issues | ❌ No | ✅ Yes |
| `NETWORK_ERROR` | Connection problems | ✅ Yes | ✅ Yes |
| `INSTALLATION_FAILED` | Setup issues | ✅ Yes | ✅ Yes |
| `CONFIGURATION_ERROR` | Config problems | ❌ No | ✅ Yes |
| `VALIDATION_ERROR` | Input validation | ❌ No | ✅ Yes |
| `RESOURCE_ERROR` | Missing resources | ❌ No | ❌ No |

## Automatic Features

### 🔄 **Retry Logic**
- Automatic retry for retryable errors
- Exponential backoff (1s, 2s, 4s delays)
- Configurable retry counts
- Smart retry decisions based on error type

### 🎯 **Error Analysis**
- Automatic error categorization
- Severity assessment
- Retryability detection
- User actionability determination

### 🌍 **Platform-Specific Guidance**
- Windows-specific troubleshooting
- macOS-specific troubleshooting
- Linux-specific troubleshooting
- Architecture-aware suggestions

## Usage in Your Code

### Basic Usage
```typescript
import { ErrorHandler } from '@calphonse/logger';

try {
  await someOperation();
} catch (error) {
  ErrorHandler.handleError(error as Error, {
    operation: 'Some Operation',
    platform: process.platform
  });
  throw error;
}
```

### With Retry Logic
```typescript
import { ErrorHandler } from '@calphonse/logger';

try {
  await someOperation();
} catch (error) {
  await ErrorHandler.handleDownloadError(
    error as Error,
    { url: downloadUrl },
    () => retryOperation()
  );
  throw error;
}
```

### Custom Error Analysis
```typescript
import { ErrorHandler } from '@calphonse/logger';

const error = new Error('Some error');
const isRetryable = ErrorHandler.isRetryable(error);
const severity = ErrorHandler.getSeverity(error);
const userMessage = ErrorHandler.createUserMessage(error);
```

## Result: Happy Users, Happy Developers

### Before ErrorHandler
- ❌ Users see cryptic technical errors
- ❌ No clear path to resolution
- ❌ Support tickets with no context
- ❌ Developers can't easily debug issues

### After ErrorHandler
- ✅ Users get clear, actionable guidance
- ✅ Automatic retry for transient issues
- ✅ Platform-specific troubleshooting
- ✅ Structured logging for debugging
- ✅ Error categorization for analytics
- ✅ Professional user experience

This transforms your application from showing technical errors to providing a professional, user-friendly experience that helps users solve problems independently while giving developers the technical details they need.
