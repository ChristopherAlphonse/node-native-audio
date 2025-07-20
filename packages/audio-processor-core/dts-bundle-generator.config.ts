import { DtsBundleGeneratorOptions } from 'dts-bundle-generator';

const config: DtsBundleGeneratorOptions = {
  preferredConfigPath: './tsconfig.json',
  outFile: './dist/index.d.ts',
  noHeader: true,
  sort: true,
  respectPreserveConstEnums: true,
  removeReferencedImport: true,
      untransformModules: ['node-addon-api', '@calphonse/audio-capture-core']
};

export default config;
