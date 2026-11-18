import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev: /api goes to the Express server, so no CORS is needed.
  server: {
    proxy: { '/api': 'http://localhost:3001' },
    // Visual Studio locks files in .vs/, which crashes the watcher with EBUSY.
    watch: { ignored: ['**/.vs/**'] },
  },
})
