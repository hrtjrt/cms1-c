import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 全局样式必须在 main.ts 顶层引入：variables.css 提供设计令牌，
// base.css 提供 reset 与共享 @keyframes，其余样式均在组件内 scoped。
import '@/assets/styles/variables.css'
import '@/assets/styles/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
