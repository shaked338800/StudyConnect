// Vite is used only as a development server and build tool for React.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Development only: forward /api requests to the Express server,
    // so the browser sees one origin (no CORS needed).
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
