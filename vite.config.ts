import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // GitHub Pages 部署时使用仓库名作为 base，本地开发用 '/'
  base: command === 'build' ? '/PixelWorld/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
}))
