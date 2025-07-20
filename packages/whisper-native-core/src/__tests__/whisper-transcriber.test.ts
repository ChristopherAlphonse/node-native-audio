import { WhisperTranscriber } from '../whisper-transcriber';

describe('WhisperTranscriber', () => {
  let transcriber: WhisperTranscriber;

  beforeEach(() => {
    transcriber = new WhisperTranscriber();
  });

  afterEach(async () => {
    await transcriber.dispose();
  });

  describe('constructor', () => {
    it('should create a WhisperTranscriber instance', () => {
      expect(transcriber).toBeInstanceOf(WhisperTranscriber);
    });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await transcriber.initialize();
      expect(transcriber.isReady()).toBe(true);
    });
  });

    describe('transcription', () => {
    beforeEach(async () => {
      await transcriber.initialize();
    });

    it('should start transcription', async () => {
      await transcriber.start();
      expect(transcriber.isActive()).toBe(true);
    });

    it('should process audio data', async () => {
      await transcriber.start();

      // Set up event listeners for transcription
      const transcriptionPromise = new Promise(resolve => {
        transcriber.once('transcription', resolve);
      });

      const audioData = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);

      // Process multiple audio chunks to trigger transcription
      for (let i = 0; i < 15; i++) {
        await transcriber.processAudio(audioData);
      }

      const result = await transcriptionPromise as any;
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    it('should emit stats after transcription', async () => {
      await transcriber.start();

      // Set up event listeners for stats
      const statsPromise = new Promise(resolve => {
        transcriber.once('stats', resolve);
      });

      const audioData = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);

      // Process multiple audio chunks to trigger transcription
      for (let i = 0; i < 15; i++) {
        await transcriber.processAudio(audioData);
      }

      const stats = await statsPromise as any;
      expect(stats).toBeDefined();
      expect(stats.processingTime).toBeDefined();
      expect(stats.tokensProcessed).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should configure transcriber settings', async () => {
      await transcriber.configure({
        model: 'medium',
        language: 'es',
        confidenceThreshold: 0.8,
        realTime: false
      });

      const config = transcriber.getConfig();
      expect(config.model).toBe('medium');
      expect(config.language).toBe('es');
      expect(config.confidenceThreshold).toBe(0.8);
      expect(config.realTime).toBe(false);
    });
  });
});
