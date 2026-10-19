/* ==========================================================================
   smoke 专用的 Vite 构建配置（仅测试用，不参与 npm run build）

   为什么需要单独一份：
     真正的 `npm run build` 产物是 ESM + 代码分割（动态 import 各个路由），
     而 jsdom 不执行 `<script type="module">`、也不支持动态 import 的按需加载。
     所以这里把入口打成一个 **IIFE 单文件**（inlineDynamicImports），
     注入一个内联到页面里的普通 <script>，jsdom 才能跑起来。

   产物写到 `.smoke/`（已在 .gitignore 里忽略），跑完由测试脚本清理。
   ========================================================================== */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root: ROOT,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    }
  },
  define: {
    // jsdom 里没有 process，必须显式替换，否则库代码会 ReferenceError
    'process.env.NODE_ENV': JSON.stringify('production'),
    // 冒烟脚本会把 window.fetch 指向真实后端 3000；这里留空走相对路径即可
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('')
  },
  build: {
    outDir: '.smoke',
    emptyOutDir: false, // 交给测试脚本自己清理，避免触发 safe-delete 包装器
    cssCodeSplit: false,
    minify: false,
    lib: {
      entry: fileURLToPath(new URL('../src/main.ts', import.meta.url)),
      name: 'Cms1FrontSmoke',
      formats: ['iife'],
      fileName: () => 'app.js'
    },
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  }
})
