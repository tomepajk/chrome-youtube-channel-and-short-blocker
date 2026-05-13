import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json' with { type: 'json' };
import { bumpManifestVersion } from './scripts/bumpManifest';

export default defineConfig(({ command }) => {
  const activeManifest = command === 'build' ? bumpManifestVersion() : manifest;

  return {
    plugins: [crx({ manifest: activeManifest })],
    server: {
      port: 5173,
      strictPort: true,
      cors: {
        origin: [/^chrome-extension:\/\//],
      },
      hmr: {
        port: 5173,
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});