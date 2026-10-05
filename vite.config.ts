import react from '@vitejs/plugin-react'
// @ts-ignore -- @tailwindcss/vite does not ship type declarations
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/dramabox-proxy': {
        target: 'https://www.dramabox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dramabox-proxy/, ''),
        headers: {
          'Referer': 'https://www.dramabox.com',
          'Origin': 'https://www.dramabox.com',
        },
      },
    },
  },
})

