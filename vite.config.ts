import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['crypto']
    })
  ],
  define: {
    // Fallback for crypto.randomUUID
    'crypto.randomUUID': 'crypto.randomUUID || (() => Math.random().toString(36).substring(2))'
  }
})