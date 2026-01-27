import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
   optimizeDeps: {
    include: ["axios"],
  },
  build: {
    chunkSizeWarningLimit: 1500, // Set to 1.5 MB
  }
})
