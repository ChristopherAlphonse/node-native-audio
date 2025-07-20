import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ChristopherAlphonseWhisperNativeCore',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'node-addon-api',
        '@calphonse/audio-capture-core',
        '@calphonse/audio-processor-core',
        'node-fetch',
        'events'
      ],
      output: {
        globals: {
          'node-addon-api': 'nodeAddonApi',
                      '@calphonse/audio-capture-core': 'CalphonseAudioCaptureCore',
            '@calphonse/audio-processor-core': 'CalphonseAudioProcessorCore',
          'node-fetch': 'nodeFetch',
          'events': 'events'
        }
      }
    },
    sourcemap: true,
    minify: false
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
