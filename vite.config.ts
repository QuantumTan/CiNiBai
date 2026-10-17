import react from '@vitejs/plugin-react'
// @ts-ignore -- @tailwindcss/vite does not ship type declarations
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/scraper-reelshort': {
        target: 'https://www.reelshort.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scraper-reelshort/, ''),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
})

