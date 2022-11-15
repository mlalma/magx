import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Magx-Panel',      
      fileName: 'Magx-Panel',
      formats: ['es']
    },
    rollupOptions: {
      external: /^lit/
    }
  }
})
