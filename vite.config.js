import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // The native watcher can exhaust descriptors in some IDE/container setups.
      // Polling keeps HMR reliable without requiring an OS-level configuration change.
      usePolling: true,
      interval: 750,
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
})
