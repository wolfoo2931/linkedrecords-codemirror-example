import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    port: 3001,
    host: 'localhost',
    open: true,
    proxy: {
      '/login': 'http://localhost:6543',
      '/logout': 'http://localhost:6543',
      '/callback': 'http://localhost:6543',
    }
  }
})
