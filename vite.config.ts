import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/terraria-compass/',
  plugins: [react()],
  // Dev server pinned to 3003 (keeps 5173 free for other local work)
  server: { port: 3003, strictPort: true },
  build: {
    // Each content pack's data (vanilla ~0.9 MB, Calamity ~5 MB pre-gzip) is a
    // dynamic import, so it is already its own chunk fetched only when the pack
    // is opened - the default 500 kB warning's advice (split with manualChunks)
    // is therefore already satisfied. Raised so the build output is not noisy
    // about chunks that are large by design and off the initial load path.
    chunkSizeWarningLimit: 6000,
  },
});
