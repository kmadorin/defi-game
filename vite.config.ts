import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['crypto']
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'crypto.randomUUID': 'crypto.randomUUID || (() => Math.random().toString(36).substring(2))'
  },
  server: {
    allowedHosts: ['deffi.flowlyapp.live']
  }
})