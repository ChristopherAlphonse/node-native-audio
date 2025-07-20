import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'node-native-audioAudioCaptureCore',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['node-addon-api'],
      output: {
        globals: {
          'node-addon-api': 'nodeAddonApi'
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
