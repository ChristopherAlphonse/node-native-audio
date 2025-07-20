import { DtsBundleGeneratorOptions } from 'dts-bundle-generator';

const config: DtsBundleGeneratorOptions = {
  preferredConfigPath: './tsconfig.json',
  outFile: './dist/index.d.ts',
  noHeader: true,
  sort: true,
  respectPreserveConstEnums: true,
  removeReferencedImport: true,
  untransformModules: [
    'node-addon-api',
    '@christopheralphonse/audio-capture-core',
    '@christopheralphonse/audio-processor-core',
    'node-fetch'
  ]
};

export default config;
