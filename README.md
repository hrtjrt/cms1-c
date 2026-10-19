# cms1 —— 公司官网前台

Vue 3 + TypeScript + Vite + Pinia + Vue Router。
v2 起**不再使用本地 mock**：所有数据来自后端 `cms1_backend` 的公开接口 `/api/public/*`。

- 开发：`npm run dev` → http://localhost:5173（`/api` 与 `/uploads` 代理到后端 3000）
- 路由（history 模式）：`/`、`/about`、`/products`、`/products/:id`、`/news`、`/news/:id`、`/contact`，其余回落首页
- 原生静态站 `hjc` 与本项目展示同一批数据，改动需一起验证

## 常用命令

```sh
npm install
npm run dev            # 开发（5173）
npm run type-check     # vue-tsc，必须 0 错误
npm run build          # 类型检查 + 生产构建到 dist/
npm run test:smoke     # 渲染冒烟（jsdom，101 项断言）
npm run test:smoke -- --no-build   # 复用上次的 .smoke/app.js，跑得更快
```

## 渲染冒烟（`npm run test:smoke`）

为什么用「构建产物 + jsdom」：项目没有引入 Vitest / @vue/test-utils，
而 jsdom 不需要新框架就能验渲染；jsdom 不执行 `<script type="module">`，
所以先按 `smoke/vite.smoke.config.mjs` 把入口打成 IIFE 单文件（`.smoke/app.js`，已在 .gitignore），
内联成普通 script 再交给 jsdom。

覆盖的关键口径（与后端、原生 hjc 一致）：

| 项 | 期望 |
|---|---|
| 首页 | 轮播 3 张（首图来自后端）、**新闻 5 条**、产品位 5 张且只有一张 `current` |
| 日期 | 首页 5 条与新闻列表前 5 条**逐条一致**，首条 `2026-08-31` |
| 产品中心 | 共 **36 件**（40 件里 4 件未上产品中心）、分类计数 8/7/7/7/7、首屏 8 张、价格两位小数 |
| 搜索 | 关键词「平板电脑」命中 **1 件**（命名唯一性已修复） |
| 商品详情 | `/products/1` 名称/价格/正文/相关产品；`/products/37` 显示「商品不存在或已下架」 |
| 新闻详情 | `/news/1` 正文、置顶标记、上下篇（最新一条的下一篇禁用） |
| 联系 | 联系方式来自后端；空提交 3 条校验错误；合法提交有明确反馈（成功或限流提示） |
| 兜底 | `/login` 与未知路径都回首页 |

前置：后端在 3000 运行。产物 `.smoke/` 跑完会自动清理。

## 说明

- 生产构建是 history 路由，部署时静态服务器需把未知路径回落到 `index.html`
- `jsdom` 是 devDependency，仅测试用，不影响生产依赖
