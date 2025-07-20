#!/usr/bin/env node

/**
 * Basic usage example for node-native-audio Audio Libraries Suite
 *
 * This example demonstrates:
 * - Audio capture from microphone
 * - Real-time audio processing
 * - Speech-to-text transcription
 */

const { AudioCapture, AudioDeviceType } = require('@calphonse/audio-capture-core');
const { AudioProcessor } = require('@calphonse/audio-processor-core');
const { WhisperTranscriber } = require('@calphonse/whisper-native-core');
const { logger } = require('@calphonse/logger');

async function main() {
  logger.info('🎵 node-native-audio Audio Libraries Suite - Basic Usage Example');

  try {
    // Initialize components
    const capture = new AudioCapture();
    const processor = new AudioProcessor();
    const transcriber = new WhisperTranscriber();

    // Get available devices
    logger.info('📱 Available audio devices:');
    const devices = await capture.getDevices();
    const microphones = devices.filter(d => d.type === AudioDeviceType.MICROPHONE);

    microphones.forEach((device, index) => {
      logger.info(`  ${index + 1}. ${device.name} ${device.isDefault ? '(Default)' : ''}`);
    });

    if (microphones.length === 0) {
      logger.warn('❌ No microphone devices found');
      return;
    }

    // Set up audio processing pipeline
    logger.info('🔧 Setting up audio processing pipeline...');

    // Configure processor
    await processor.configure({
      echoCancellation: true,
      noiseSuppression: true,
      automaticGainControl: true
    });

    // Configure transcriber
    await transcriber.configure({
      model: 'base',
      language: 'en',
      realTime: true
    });

    // Connect the pipeline
    capture.on('data', (event) => {
      if (event.type === 'data' && event.data) {
        // Process audio
        processor.processAudio(event.data);
      }
    });

    processor.on('processed', (processedData) => {
      // Send to transcriber
      transcriber.processAudio(processedData);
    });

    transcriber.on('transcription', (result) => {
      if (result.text.trim()) {
        logger.info(`🎤 "${result.text}"`, { confidence: (result.confidence * 100).toFixed(1) + '%' });
      }
    });

    // Handle errors
    capture.on('error', (error) => {
      logger.error('❌ Capture error', { error: error.message });
    });

    processor.on('error', (error) => {
      logger.error('❌ Processing error', { error: error.message });
    });

    transcriber.on('error', (error) => {
      logger.error('❌ Transcription error', { error: error.message });
    });

    // Start the pipeline
    logger.info('🎤 Starting audio capture...');
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

    logger.info('✅ Audio capture started! Speak into your microphone...');
    logger.info('Press Ctrl+C to stop');

    // Keep the process running
    process.on('SIGINT', async () => {
      logger.info('🛑 Stopping audio capture...');
      await capture.stopCapture();
      await processor.dispose();
      await transcriber.dispose();
      await capture.dispose();
      logger.info('✅ Cleanup completed');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Error', { error: error.message });
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}

module.exports = { main };
