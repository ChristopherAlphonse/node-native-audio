#!/usr/bin/env node

/**
 * Basic usage example for node-native-audio Audio Libraries Suite
 *
 * This example demonstrates:
 * - Audio capture from microphone
 * - Real-time audio processing
 * - Speech-to-text transcription
 */

const { AudioCapture, AudioDeviceType } = require('@christopheralphonse/audio-capture-core');
const { AudioProcessor } = require('@christopheralphonse/audio-processor-core');
const { WhisperTranscriber } = require('@christopheralphonse/whisper-native-core');

async function main() {
  console.log('🎵 node-native-audio Audio Libraries Suite - Basic Usage Example\n');

  try {
    // Initialize components
    const capture = new AudioCapture();
    const processor = new AudioProcessor();
    const transcriber = new WhisperTranscriber();

    // Get available devices
    console.log('📱 Available audio devices:');
    const devices = await capture.getDevices();
    const microphones = devices.filter(d => d.type === AudioDeviceType.MICROPHONE);

    microphones.forEach((device, index) => {
      console.log(`  ${index + 1}. ${device.name} ${device.isDefault ? '(Default)' : ''}`);
    });

    if (microphones.length === 0) {
      console.log('❌ No microphone devices found');
      return;
    }

    // Set up audio processing pipeline
    console.log('\n🔧 Setting up audio processing pipeline...');

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
        console.log(`🎤 "${result.text}" (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
      }
    });

    // Handle errors
    capture.on('error', (error) => {
      console.error('❌ Capture error:', error.message);
    });

    processor.on('error', (error) => {
      console.error('❌ Processing error:', error.message);
    });

    transcriber.on('error', (error) => {
      console.error('❌ Transcription error:', error.message);
    });

    // Start the pipeline
    console.log('\n🎤 Starting audio capture...');
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

    console.log('✅ Audio capture started! Speak into your microphone...');
    console.log('Press Ctrl+C to stop\n');

    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping audio capture...');
      await capture.stopCapture();
      await processor.dispose();
      await transcriber.dispose();
      await capture.dispose();
      console.log('✅ Cleanup completed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}

module.exports = { main };
