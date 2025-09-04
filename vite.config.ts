import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  optimizeDeps: {
    // exclude: ['linkedrecords'],
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: true,
    open: true,
  }
})
