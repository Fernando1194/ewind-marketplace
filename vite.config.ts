import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // permite top-level await (necessário para pdfjs-dist)
  },
  esbuild: {
    // garante o mesmo target na transformação
  },
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' },
  },
})
