import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/webcloset/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api-production-d9dd.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
})



