import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Magx-Sparkline',
      fileName: 'Magx-Sparkline',
      formats: ['es']
    },
    rollupOptions: {
      external: /^lit/
    }
  }
})
