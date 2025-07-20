# Contributing to node-native-audio

Thank you for your interest in contributing to the node-native-audio Audio Libraries Suite! This document provides guidelines and information for contributors.

## Project Overview

The node-native-audio Audio Libraries Suite is a collection of TypeScript-based npm libraries that provide native audio capture, processing, and transcription capabilities for Node.js and Electron applications.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- C++ compiler (for native addons)
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: GCC/G++

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/node-native-audio.git
   cd node-native-audio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure

```
packages/
├── audio-capture-core/     # Native audio capture
│   ├── src/
│   │   ├── types.ts        # Type definitions
│   │   ├── audio-capture.ts # Main capture class
│   │   ├── device-manager.ts # Device management
│   │   └── native-bindings.ts # Native addon interface
│   └── binding.gyp         # Native addon build config
├── audio-processor-core/   # Audio processing with WebRTC
│   ├── src/
│   │   ├── types.ts        # Type definitions
│   │   ├── audio-processor.ts # Main processor class
│   │   ├── webrtc-processor.ts # WebRTC integration
│   │   └── simd-processor.ts # SIMD optimizations
│   └── binding.gyp         # Native addon build config
└── whisper-native-core/    # Whisper transcription
    ├── src/
    │   ├── types.ts        # Type definitions
    │   ├── whisper-transcriber.ts # Main transcriber class
    │   ├── model-manager.ts # Model management
    │   └── native-whisper.ts # Native addon interface
    └── binding.gyp         # Native addon build config
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 4. Run Code Quality Checks

```bash
# Lint all packages
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### 5. Build Packages

```bash
npm run build
```

### 6. Submit a Pull Request

- Create a descriptive PR title
- Include a detailed description of changes
- Reference any related issues
- Ensure all CI checks pass

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use enums for constants
- Use async/await over Promises

### Code Style

- Follow Prettier formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use early returns to reduce nesting

### Example

```typescript
/**
 * Processes audio data with the specified configuration
 * @param audioData - Raw audio data to process
 * @param config - Processing configuration
 * @returns Processed audio data
 */
export async function processAudio(
  audioData: Float32Array,
  config: AudioProcessorConfig
): Promise<Float32Array> {
  if (!audioData || audioData.length === 0) {
    throw new Error('Audio data cannot be empty');
  }

  if (!config) {
    throw new Error('Processing configuration is required');
  }

  // Process audio data
  const processedData = await applyProcessing(audioData, config);

  return processedData;
}
```

## Testing

### Test Structure

- Unit tests: `src/__tests__/`
- Integration tests: `tests/integration/`
- Performance tests: `tests/performance/`

### Writing Tests

```typescript
import { AudioCapture } from '../audio-capture';

describe('AudioCapture', () => {
  let capture: AudioCapture;

  beforeEach(() => {
    capture = new AudioCapture();
  });

  afterEach(async () => {
    await capture.dispose();
  });

  it('should start capture successfully', async () => {
    // Arrange
    const options = { deviceId: 'test-device' };

    // Act
    await capture.startCapture(options);

    // Assert
    expect(capture.isActive()).toBe(true);
  });
});
```

### Test Coverage

- Aim for 90%+ code coverage
- Test both success and error cases
- Mock external dependencies
- Test edge cases and boundary conditions

## Native Addon Development

### C++ Guidelines

- Use modern C++ (C++17 or later)
- Follow RAII principles
- Use smart pointers over raw pointers
- Handle errors gracefully
- Add comprehensive error handling

### Example Native Addon

```cpp
#include <napi.h>

class AudioCaptureAddon : public Napi::ObjectWrap<AudioCaptureAddon> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "AudioCaptureAddon", {
      InstanceMethod("start", &AudioCaptureAddon::Start),
      InstanceMethod("stop", &AudioCaptureAddon::Stop),
    });

    exports.Set("AudioCaptureAddon", func);
    return exports;
  }

  AudioCaptureAddon(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<AudioCaptureAddon>(info) {}

private:
  Napi::Value Start(const Napi::CallbackInfo& info) {
    try {
      // Implementation
      return info.Env().Undefined();
    } catch (const std::exception& e) {
      throw Napi::Error::New(info.Env(), e.what());
    }
  }
};
```

## Documentation

### API Documentation

- Use JSDoc comments for all public APIs
- Include examples in documentation
- Document error conditions
- Keep documentation up to date

### Example

```typescript
/**
 * Audio capture configuration options
 */
export interface AudioCaptureOptions {
  /** Device ID to capture from */
  deviceId?: string;

  /** Audio format configuration */
  format?: Partial<AudioFormat>;

  /** Buffer size in samples */
  bufferSize?: number;

  /** Target latency in milliseconds */
  latency?: number;
}

/**
 * Starts audio capture with the specified options
 *
 * @param options - Capture configuration options
 * @throws {Error} If capture is already running
 * @throws {Error} If device is not found
 *
 * @example
 * ```typescript
 * const capture = new AudioCapture();
 * await capture.startCapture({
 *   deviceId: 'default-microphone',
 *   format: { sampleRate: 16000, channels: 1 }
 * });
 * ```
 */
async startCapture(options: AudioCaptureOptions = {}): Promise<void>
```

## Bug Reports

### Before Submitting

1. Check existing issues
2. Try to reproduce the bug
3. Check if it's a platform-specific issue
4. Gather relevant information

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11, macOS 12, Ubuntu 22.04]
- Node.js version: [e.g., 18.15.0]
- Package version: [e.g., 1.0.0]

## Additional Information
- Error messages
- Screenshots
- Logs
```

## Feature Requests

### Before Submitting

1. Check if the feature already exists
2. Consider if it fits the project scope
3. Think about implementation complexity
4. Consider backward compatibility

### Feature Request Template

```markdown
## Feature Description
Brief description of the requested feature

## Use Case
Why this feature is needed

## Proposed Implementation
How you think it should be implemented

## Alternatives Considered
Other approaches you've considered

## Additional Information
Any other relevant details
```

## Pull Request Process

### Before Submitting

1. **Ensure code quality**
   - All tests pass
   - Linting passes
   - Code is formatted
   - Documentation is updated

2. **Write a good description**
   - Explain what the PR does
   - Reference related issues
   - Include testing instructions
   - Note any breaking changes

3. **Request review**
   - Assign appropriate reviewers
   - Respond to feedback promptly
   - Make requested changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #123
```

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/) with [Changesets](https://github.com/changesets/changesets):
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

1. **Create changeset**
   ```bash
   npx changeset
   ```

2. **Update versions**
   ```bash
   npm run version
   ```

3. **Publish packages**
   ```bash
   npm run publish
   ```

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow project conventions

### Communication

- Use GitHub Issues for bugs and features
- Use GitHub Discussions for questions
- Be clear and concise
- Provide context and examples

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/ChristopherAlphonse/node-native-audio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ChristopherAlphonse/node-native-audio/discussions)
- **Documentation**: [Project Wiki](https://github.com/ChristopherAlphonse/node-native-audio/wiki)

## Acknowledgments

Thank you for contributing to the node-native-audio Audio Libraries Suite! Your contributions help make this project better for everyone.

---

**Happy coding! **
