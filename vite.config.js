import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    strictPort: false,
    open: false,
    host: true,
    watch: {
      ignored: ['**/public/models/**', '**/*.png']
    }
  },
  preview: {
    port: 5174,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
