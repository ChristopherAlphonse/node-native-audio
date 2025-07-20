import { AudioProcessor } from '../audio-processor';

describe('AudioProcessor', () => {
  let processor: AudioProcessor;

  beforeEach(() => {
    processor = new AudioProcessor();
  });

  afterEach(async () => {
    await processor.dispose();
  });

  describe('constructor', () => {
    it('should create an AudioProcessor instance', () => {
      expect(processor).toBeInstanceOf(AudioProcessor);
    });

    it('should have default configuration', () => {
      const config = processor.getConfig();
      expect(config.echoCancellation?.enabled).toBe(true);
      expect(config.noiseSuppression?.enabled).toBe(true);
      expect(config.automaticGainControl?.enabled).toBe(true);
      expect(config.simdOptimization).toBe(true);
    });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await processor.initialize();
      expect(processor.isReady()).toBe(true);
    });
  });

  describe('configuration', () => {
    it('should configure echo cancellation', async () => {
      await processor.configure({
        echoCancellation: { enabled: false, delay: 100, filterLength: 512 }
      });
      const config = processor.getConfig();
      expect(config.echoCancellation?.enabled).toBe(false);
      expect(config.echoCancellation?.delay).toBe(100);
      expect(config.echoCancellation?.filterLength).toBe(512);
    });

    it('should configure noise suppression', async () => {
      await processor.configure({
        noiseSuppression: { enabled: false, level: 'high' }
      });
      const config = processor.getConfig();
      expect(config.noiseSuppression?.enabled).toBe(false);
      expect(config.noiseSuppression?.level).toBe('high');
    });

    it('should configure automatic gain control', async () => {
      await processor.configure({
        automaticGainControl: {
          enabled: false,
          targetLevel: -20,
          compressionGain: 12
        }
      });
      const config = processor.getConfig();
      expect(config.automaticGainControl?.enabled).toBe(false);
      expect(config.automaticGainControl?.targetLevel).toBe(-20);
      expect(config.automaticGainControl?.compressionGain).toBe(12);
    });
  });

  describe('audio processing', () => {
    beforeEach(async () => {
      await processor.initialize();
    });

    it('should process audio data', async () => {
      const inputData = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);

      // Set up event listeners
      const processedPromise = new Promise(resolve => {
        processor.once('processed', resolve);
      });

      await processor.processAudio(inputData, 16000, 1);

      const processedData = await processedPromise;
      expect(processedData).toBeDefined();
    });

    it('should emit stats after processing', async () => {
      const inputData = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);

      // Set up event listeners
      const statsPromise = new Promise(resolve => {
        processor.once('stats', resolve);
      });

      await processor.processAudio(inputData, 16000, 1);

      const stats = await statsPromise as any;
      expect(stats).toBeDefined();
      expect(stats.samplesProcessed).toBe(inputData.length);
    });
  });

  describe('state management', () => {
    it('should track ready state', async () => {
      expect(processor.isReady()).toBe(false);
      await processor.initialize();
      expect(processor.isReady()).toBe(true);
    });

    it('should track active state', async () => {
      await processor.initialize();
      expect(processor.isActive()).toBe(false);

      const inputData = new Float32Array([0.1, 0.2, 0.3]);
      await processor.processAudio(inputData);
      expect(processor.isActive()).toBe(true);
    });
  });
});
