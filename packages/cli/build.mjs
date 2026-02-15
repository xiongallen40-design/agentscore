import { build } from 'esbuild';
build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  format: 'cjs',
  banner: { js: '#!/usr/bin/env node' },
  external: [],
}).catch(() => process.exit(1));
