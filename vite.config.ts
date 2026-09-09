import react from '@vitejs/plugin-react'
// @ts-ignore -- @tailwindcss/vite does not ship type declarations
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
