import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ChristopherAlphonseAudioProcessorCore',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['node-addon-api', '@christopheralphonse/audio-capture-core', 'events'],
      output: {
        globals: {
          'node-addon-api': 'nodeAddonApi',
          '@christopheralphonse/audio-capture-core': 'ChristopherAlphonseAudioCaptureCore',
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
