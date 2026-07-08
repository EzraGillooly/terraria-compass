import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/terraria-compass/',
  plugins: [react()],
  // Dev server pinned to 3003 (keeps 5173 free for other local work)
  server: { port: 3003, strictPort: true },
});
