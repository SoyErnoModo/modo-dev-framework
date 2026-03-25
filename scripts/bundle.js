import { build } from 'esbuild';

await build({
  entryPoints: ['dist/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.bundled.js',
  external: [],
  banner: { js: '#!/usr/bin/env node' },
  minify: false,
});

console.log('Bundled to dist/index.bundled.js');
