import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const KRATE_ORIGIN = 'https://kratecms.ddev.site'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: KRATE_ORIGIN,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
