# Node Native Audio - Architecture Documentation

## Overview

The node-native-audio suite is a comprehensive TypeScript-based audio processing ecosystem designed to provide native audio capture, processing, and transcription capabilities for Node.js and Electron applications. The architecture follows a modular, event-driven design with clear separation of concerns and high-performance native bindings.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Audio Input   │───▶│  Audio Capture  │───▶│ Audio Processor │───▶│   Transcription │
│                 │    │      Core       │    │      Core       │    │      Core       │
│ • Microphone    │    │                 │    │                 │    │                 │
│ • System Audio  │    │ • Device Mgmt   │    │ • Echo Cancel   │    │ • Whisper Model │
│ • File Input    │    │ • Native Bind   │    │ • Noise Supp    │    │ • Real-time STT │
└─────────────────┘    │ • Event Stream  │    │ • Audio Enhance │    │ • Confidence    │
                       └─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │                       │
                                ▼                       ▼                       ▼
                       ┌─────────────────────────────────────────────────────────────────┐
                       │                        Logger Core                              │
                       │                                                                 │
                       │ • Structured Logging    • Error Handling    • Performance Track │
                       │ • Colored Output        • Debug Info        • Audit Trail       │
                       └─────────────────────────────────────────────────────────────────┘
```

### Package Dependencies

```
@calphonse/logger (Foundation)
    ↑
    ├── @calphonse/audio-capture-core
    ├── @calphonse/audio-processor-core
    └── @calphonse/whisper-native-core
```

## Package Architecture

### 1. Logger Core (`@calphonse/logger`)

**Purpose**: Centralized logging and error handling for the entire suite.

**Key Components**:
- `Logger`: Main logging class with configurable levels and output formats
- `ErrorHandler`: Centralized error processing with user-friendly messages
- `LogLevel`: Enumeration of log levels (ERROR, WARN, INFO, DEBUG, TRACE)
- `LoggerConfig`: Configuration interface for logger customization

**Features**:
- Colored terminal output using chalk
- JSON structured logging support
- Child logger creation for module-specific logging
- Source file tracking and timestamps
- Performance monitoring capabilities
- Error categorization and severity levels

**Usage Pattern**:
```typescript
import { logger } from '@calphonse/logger';

// All packages use the same logger instance
logger.info('Audio capture started', { deviceId: 'mic-1' });
logger.error('Processing failed', { error: 'Invalid format' });
```

### 2. Audio Capture Core (`@calphonse/audio-capture-core`)

**Purpose**: Native audio capture from system audio and microphones.

**Key Components**:
- `AudioCapture`: Main capture class with event-driven API
- `DeviceManager`: Audio device enumeration and management
- `NativeBindings`: Platform-specific native addon bindings
- `AudioFormat`: Audio format specification and validation

**Native Bindings**:
- **Windows**: WASAPI (Windows Audio Session API)
- **macOS**: Core Audio framework
- **Linux**: ALSA/PulseAudio

**Event Flow**:
```
Device Enumeration → Device Selection → Capture Start → Audio Stream → Event Emission
```

**Integration Points**:
- Emits `data` events for real-time audio streaming
- Integrates with logger for device and capture status
- Provides device information for processor configuration

### 3. Audio Processor Core (`@calphonse/audio-processor-core`)

**Purpose**: High-performance audio processing with AI-enhanced algorithms.

**Key Components**:
- `AudioProcessor`: Main processing pipeline orchestrator
- `WebRTCProcessor`: WebRTC-based audio processing (AEC, NS, AGC)
- `SIMDProcessor`: SIMD-optimized audio processing operations
- `ProcessingConfig`: Configuration for different processing modes

**Processing Pipeline**:
```
Raw Audio → Echo Cancellation → Noise Suppression → Audio Enhancement → Output
```

**WebRTC Integration**:
- Real-time echo cancellation (AEC)
- Noise suppression and reduction
- Automatic gain control (AGC)
- Voice activity detection (VAD)

**SIMD Optimizations**:
- Vectorized audio processing operations
- Platform-specific SIMD instruction sets
- Performance-critical audio transformations

### 4. Whisper Native Core (`@calphonse/whisper-native-core`)

**Purpose**: Native Whisper speech-to-text transcription with real-time streaming.

**Key Components**:
- `WhisperTranscriber`: Main transcription orchestrator
- `ModelManager`: Whisper model loading and caching
- `NativeWhisper`: Native C++ Whisper implementation
- `TranscriptionConfig`: Configuration for transcription parameters

**Model Management**:
- Dynamic model loading and caching
- Multiple model size support (tiny, base, small, medium, large)
- Language-specific model optimization
- Memory-efficient model handling

**Real-time Processing**:
- Streaming audio input processing
- Segment-level transcription output
- Confidence scoring and filtering
- Language detection and selection

## Data Flow Architecture

### Audio Pipeline Flow

```
1. Audio Input
   ↓
2. Device Capture (audio-capture-core)
   ↓
3. Raw Audio Events
   ↓
4. Audio Processing (audio-processor-core)
   ↓
5. Processed Audio Events
   ↓
6. Transcription (whisper-native-core)
   ↓
7. Text Output + Confidence
```

### Event-Driven Communication

All packages use Node.js EventEmitter for inter-package communication:

```typescript
// Audio capture emits data events
capture.on('data', (event) => {
  if (event.type === 'data' && event.data) {
    processor.processAudio(event.data);
  }
});

// Processor emits processed events
processor.on('processed', (processedData) => {
  transcriber.processAudio(processedData);
});

// Transcriber emits transcription events
transcriber.on('transcription', (result) => {
  logger.info('Transcription', { text: result.text });
});
```

## Performance Architecture

### Latency Optimization

**Target**: < 50ms end-to-end audio processing pipeline

**Optimization Strategies**:
- Native C++ bindings for performance-critical operations
- SIMD vectorization for audio processing
- Efficient memory management with pre-allocated buffers
- Minimal data copying between processing stages
- Asynchronous processing with non-blocking I/O

### Memory Management

**Target**: < 100MB for full audio pipeline

**Memory Strategies**:
- Object pooling for frequently allocated objects
- Streaming processing to avoid large buffer accumulation
- Efficient audio format conversions
- Model caching with LRU eviction
- Garbage collection optimization

### CPU Optimization

**Target**: < 10% CPU usage for audio capture and processing

**Optimization Techniques**:
- SIMD instruction utilization
- Multi-threading for parallel processing
- Efficient algorithm implementations
- Platform-specific optimizations
- Profiling-driven performance tuning

## Error Handling Architecture

### Centralized Error Management

The logger package provides centralized error handling across all packages:

```typescript
import { ErrorHandler, ErrorType, ErrorSeverity } from '@calphonse/logger';

// Error categorization
ErrorHandler.categorize(error, {
  type: ErrorType.AUDIO_CAPTURE,
  severity: ErrorSeverity.HIGH,
  context: { deviceId: 'mic-1' }
});

// User-friendly error messages
const message = ErrorHandler.getUserFriendlyMessage(error);
```

### Error Recovery Strategies

1. **Device Failures**: Automatic device fallback and reconnection
2. **Processing Errors**: Graceful degradation with error reporting
3. **Model Loading**: Retry mechanisms with alternative models
4. **Memory Issues**: Dynamic buffer resizing and garbage collection
5. **Network Issues**: Offline mode with local processing

## Security Architecture

### Audio Data Security

- **No Persistent Storage**: Audio data is processed in-memory only
- **Secure Transmission**: Encrypted audio streams for network transmission
- **Access Control**: Device-level permissions and user consent
- **Data Minimization**: Only necessary audio data is processed

### Native Addon Security

- **Input Validation**: Comprehensive validation of all native addon inputs
- **Memory Safety**: Bounds checking and memory leak prevention
- **Error Isolation**: Fail-safe mechanisms for native addon failures
- **Platform Security**: Platform-specific security best practices

## Testing Architecture

### Testing Strategy

1. **Unit Tests**: Individual component testing with mocked dependencies
2. **Integration Tests**: End-to-end pipeline testing
3. **Performance Tests**: Latency and resource usage validation
4. **Cross-Platform Tests**: Platform-specific functionality validation
5. **Error Handling Tests**: Error scenarios and recovery testing

### Test Coverage Targets

- **Code Coverage**: > 90% for all packages
- **Integration Coverage**: 100% for main use cases
- **Performance Coverage**: All performance targets validated
- **Error Coverage**: All error scenarios tested

## Deployment Architecture

### Package Distribution

- **NPM Packages**: Individual packages published to npm registry
- **TypeScript Support**: Full TypeScript definitions included
- **Platform Binaries**: Pre-compiled native addons for major platforms
- **Documentation**: Comprehensive API documentation and examples

### Build System

- **Monorepo Management**: Turbo for efficient build orchestration
- **Cross-Platform Builds**: Platform-specific native addon compilation
- **Type Generation**: Automated TypeScript definition generation
- **Bundle Optimization**: Tree-shaking and code splitting

## Future Architecture Considerations

### Scalability

- **Microservices**: Potential for distributed audio processing
- **Load Balancing**: Multi-instance processing for high throughput
- **Caching**: Distributed caching for model and configuration data
- **Monitoring**: Comprehensive metrics and alerting system

### Extensibility

- **Plugin System**: Extensible processing pipeline with custom processors
- **Custom Models**: Support for custom Whisper model integration
- **Audio Formats**: Extensible audio format support
- **Processing Algorithms**: Pluggable audio processing algorithms

### Integration

- **Electron Support**: Enhanced Electron integration with preload scripts
- **WebAssembly**: WASM-based processing for web environments
- **Cloud Integration**: Cloud-based processing and model serving
- **Real-time Collaboration**: Multi-user audio processing capabilities
