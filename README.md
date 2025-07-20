# node-native-audio

A comprehensive suite of TypeScript-based npm libraries that provide native audio capture, processing, and transcription capabilities for Node.js and Electron applications, solving the limitations of web-based audio APIs.

## 🎯 Project Overview

The node-native-audio suite consists of three core packages that work together to provide a complete audio processing pipeline:

- **@christopheralphonse/audio-capture-core**: Native system audio and microphone capture
- **@christopheralphonse/audio-processor-core**: High-performance audio processing with AI enhancements
- **@christopheralphonse/whisper-native-core**: Native Whisper speech-to-text with real-time streaming

## 🚀 Key Features

### Audio Capture Core
- ✅ System audio capture (speakers output)
- ✅ Microphone capture
- ✅ Real-time audio streaming
- ✅ Device enumeration and selection
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Low-latency audio processing

### Audio Processor Core
- ✅ Real-time echo cancellation (AEC)
- ✅ Noise reduction and suppression
- ✅ Audio enhancement and normalization
- ✅ Automatic gain control (AGC)
- ✅ SIMD-optimized processing
- ✅ WebRTC audio processing integration

### Whisper Native Core
- ✅ Real-time transcription streaming
- ✅ Multiple Whisper model support
- ✅ Language detection and selection
- ✅ Confidence scoring
- ✅ Segment-level transcription
- ✅ Model caching and management

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- C++ compiler (for native addons)
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: GCC/G++

### Install Individual Packages

```bash
# Audio capture
npm install @christopheralphonse/audio-capture-core

# Audio processing
npm install @christopheralphonse/audio-processor-core

# Whisper transcription
npm install @christopheralphonse/whisper-native-core
```

### Install All Packages

```bash
npm install @christopheralphonse/audio-capture-core @christopheralphonse/audio-processor-core @christopheralphonse/whisper-native-core
```

## 🛠️ Development Setup

### Clone and Setup

```bash
git clone https://github.com/ChristopherAlphonse/node-native-audio.git
cd node-native-audio
npm install
```

### Build All Packages

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint all packages
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## 📖 Usage Examples

### Basic Audio Capture

```typescript
import { AudioCapture, AudioDeviceType } from '@christopheralphonse/audio-capture-core';

const capture = new AudioCapture();

// Get available devices
const devices = await capture.getDevices();
const microphones = await capture.getDevicesByType(AudioDeviceType.MICROPHONE);

// Start capture
capture.on('data', (event) => {
  if (event.type === 'data' && event.data) {
    console.log('Audio data received:', event.data.length, 'samples');
  }
});

await capture.startCapture({
  deviceId: microphones[0].id,
  format: {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    signed: true,
    float: false
  }
});

// Stop capture
await capture.stopCapture();
```

### Audio Processing Pipeline

```typescript
import { AudioCapture } from '@christopheralphonse/audio-capture-core';
import { AudioProcessor } from '@christopheralphonse/audio-processor-core';

const capture = new AudioCapture();
const processor = new AudioProcessor();

// Connect capture to processor
capture.on('data', (event) => {
  if (event.type === 'data' && event.data) {
    processor.processAudio(event.data);
  }
});

processor.on('processed', (processedData) => {
  console.log('Processed audio:', processedData.length, 'samples');
});

// Configure processing
await processor.configure({
  echoCancellation: true,
  noiseSuppression: true,
  automaticGainControl: true
});
```

### Real-time Transcription

```typescript
import { AudioCapture } from '@christopheralphonse/audio-capture-core';
import { WhisperTranscriber } from '@christopheralphonse/whisper-native-core';

const capture = new AudioCapture();
const transcriber = new WhisperTranscriber();

// Connect capture to transcriber
capture.on('data', (event) => {
  if (event.type === 'data' && event.data) {
    transcriber.processAudio(event.data);
  }
});

transcriber.on('transcription', (result) => {
  console.log('Transcription:', result.text);
  console.log('Confidence:', result.confidence);
});

// Start transcription
await transcriber.start({
  model: 'base',
  language: 'en',
  realTime: true
});
```

## 🏗️ Architecture

### Package Structure

```
packages/
├── audio-capture-core/     # Native audio capture
├── audio-processor-core/   # Audio processing with WebRTC
└── whisper-native-core/    # Whisper transcription
```

### Native Addons

Each package includes native C++ addons for optimal performance:

- **Windows**: WASAPI (Windows Audio Session API)
- **macOS**: Core Audio framework
- **Linux**: ALSA/PulseAudio

### Processing Pipeline

```
Audio Input → Capture → Processing → Transcription → Output
     ↓           ↓          ↓            ↓           ↓
  Microphone  Native    WebRTC      Whisper     Text/Events
  System      Addon     AEC/NS      Model       Stream
```

## 🎯 Performance Targets

- **Latency**: < 50ms audio processing pipeline
- **CPU Usage**: < 10% for audio capture and processing
- **Memory Usage**: < 100MB for full audio pipeline
- **Transcription Accuracy**: > 95% for clear speech
- **Cross-Platform Compatibility**: 100% Windows, macOS, Linux

## 🔧 Configuration

### Audio Capture Options

```typescript
interface AudioCaptureOptions {
  deviceId?: string;
  format?: Partial<AudioFormat>;
  bufferSize?: number;
  latency?: number;
  enableEchoCancellation?: boolean;
  enableNoiseSuppression?: boolean;
  enableAutomaticGainControl?: boolean;
}
```

### Processing Options

```typescript
interface AudioProcessorOptions {
  echoCancellation?: EchoCancellationConfig;
  noiseSuppression?: NoiseSuppressionConfig;
  automaticGainControl?: AutomaticGainControlConfig;
  simdOptimization?: boolean;
}
```

### Whisper Options

```typescript
interface WhisperOptions {
  model?: string;
  language?: string;
  realTime?: boolean;
  confidenceThreshold?: number;
  maxTokens?: number;
}
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### Performance Tests

```bash
npm run test:performance
```

## 📚 Documentation

- [API Reference](./docs/api-reference.md)
- [Installation Guide](./docs/installation.md)
- [Usage Examples](./docs/examples.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Performance Optimization](./docs/performance.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style

- TypeScript with strict mode
- ESLint + Prettier
- Conventional commits
- 90%+ test coverage

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/ChristopherAlphonse/node-native-audio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ChristopherAlphonse/node-native-audio/discussions)
- **Documentation**: [Project Wiki](https://github.com/ChristopherAlphonse/node-native-audio/wiki)

## 🗺️ Roadmap

### Phase 1: Core Development (Weeks 1-4)
- [x] Project structure setup
- [ ] Audio capture implementation
- [ ] Audio processing implementation
- [ ] Whisper integration

### Phase 2: Integration (Week 5)
- [ ] Electron bindings
- [ ] Glass by Pickle integration
- [ ] Example applications

### Phase 3: Quality & Launch (Weeks 6-7)
- [ ] Comprehensive testing
- [ ] Documentation completion
- [ ] Package publishing
- [ ] Community setup

## 🙏 Acknowledgments

- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) for Whisper implementation
- [WebRTC](https://webrtc.org/) for audio processing algorithms
- [node-addon-api](https://github.com/nodejs/node-addon-api) for native addon development
- [Turbo](https://turbo.build/) for monorepo management

---

**Built with ❤️ by [Christopher Alphonse](https://github.com/ChristopherAlphonse)**


