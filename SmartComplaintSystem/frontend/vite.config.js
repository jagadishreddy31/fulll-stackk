import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expose on 0.0.0.0 (LAN accessible)
    port: 5173,
  },
})
