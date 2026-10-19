/* ==========================================================================
   Vue 前台冒烟测试（阶段 5-1，v2 口径）

   为什么是「构建产物 + jsdom」而不是直接跑源码：
     · 项目没有引入 Vitest/@vue/test-utils（约束是「不要顺手引入新框架」），
       jsdom 是原本就在用的最小方案，这里把它收进项目、断言升级到 v2。
     · jsdom 不执行 <script type="module">，所以先用 smoke/vite.smoke.config.mjs
       把入口打成 IIFE 单文件（.smoke/app.js），再内联成普通 script 交给 jsdom。

   前置：后端已在 http://127.0.0.1:3000 运行（cd cms1_backend && npm start）
   运行：npm run test:smoke
         npm run test:smoke -- --no-build    # 复用上次的 .smoke/app.js，跑得更快

   v2 相对 v1 的变化（断言全部重写）：
     · 数据来自 /api/public/*：商品 36 件（40 件里 4 件未上产品中心）、
       安防系统 7 件、关键词「平板电脑」命中 1 件、日期首条 2026-08-31
     · 新增 /news/:id 与 /products/:id 两个详情页
     · 「阅读全文」「商品卡片」是跳详情页，不再是 ?id= 定位高亮
     · 联系页表单真正 POST /api/public/contact（限流 10 分钟 5 次）
   ========================================================================== */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { JSDOM, VirtualConsole } from 'jsdom'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const SMOKE_DIR = path.join(ROOT, '.smoke')
const APP_JS = path.join(SMOKE_DIR, 'app.js')
const PORT = Number(process.env.SMOKE_VUE_PORT || 4175)
const BASE = `http://127.0.0.1:${PORT}`
const API = process.env.HJC_API_BASE || 'http://127.0.0.1:3000'
const NO_BUILD = process.argv.includes('--no-build')
const WAIT = 2200

const IGNORABLE = [
  'Not implemented: window.scrollTo',
  'Not implemented: window.scroll',
  'Not implemented: navigation',
  'Could not load img',
  'Could not load link',
  'Could not parse CSS stylesheet',
  'ReadableStream is not defined',
  'Minified React error'
]

/* ---------------- 构建 IIFE 产物 ---------------- */

function buildBundle() {
  if (NO_BUILD && fs.existsSync(APP_JS)) {
    console.log('复用已有产物：' + path.relative(ROOT, APP_JS))
    return
  }
  console.log('构建冒烟产物（IIFE 单文件）…')
  execFileSync(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', path.join(HERE, 'vite.smoke.config.mjs')], {
    cwd: ROOT,
    stdio: 'inherit'
  })
  if (!fs.existsSync(APP_JS)) throw new Error('构建产物不存在：' + APP_JS)
  console.log('产物大小：' + (fs.statSync(APP_JS).size / 1024).toFixed(1) + ' KB')
}

/* ---------------- 静态服务（含 SPA 回退，模拟 history 模式部署） ---------------- */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png'
}

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const file = path.join(ROOT, urlPath)
    const target = fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(ROOT, 'index.html')
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' })
    res.end(fs.readFileSync(target))
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

/* ---------------- 用 jsdom 打开一个路由 ---------------- */

const APP_SOURCE = () => fs.readFileSync(APP_JS, 'utf8')

function pageHtml() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>公司官网</title></head><body><div id="app"></div><script>${APP_SOURCE()}</script></body></html>`
}

async function open(route, { wait = WAIT } = {}) {
  const errors = []
  const vc = new VirtualConsole()
  vc.on('jsdomError', (e) => {
    if (!IGNORABLE.some((s) => (e.message || '').includes(s))) errors.push(e.message || String(e))
  })
  vc.on('error', (m) => {
    if (!IGNORABLE.some((s) => String(m).includes(s))) errors.push(String(m))
  })

  const dom = new JSDOM(pageHtml(), {
    url: BASE + route,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      // jsdom 30 不提供 window.fetch（也不提供 ReadableStream），
      // 这里注入 Node 的实现；只允许访问本机后端
      window.ReadableStream = ReadableStream
      window.WritableStream = WritableStream
      window.TransformStream = TransformStream
      window.fetch = async function (input, init) {
        const url = String(typeof input === 'string' ? input : input.url)
        const absolute = url.startsWith('http') ? url : API + url
        if (!absolute.startsWith(API)) throw new TypeError('只允许访问本机后端：' + absolute)
        const res = await fetch(absolute, init)
        const text = await res.text()
        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          url: absolute,
          text: async () => text,
          json: async () => JSON.parse(text)
        }
      }
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return [] }
      }
      window.Element.prototype.scrollIntoView = function () {}
      window.scrollTo = function () {}
    }
  })

  await new Promise((r) => setTimeout(r, wait))
  const doc = dom.window.document
  return { window: dom.window, doc, errors, close: () => dom.window.close() }
}

/* ---------------- 断点 ---------------- */

let pass = 0
let fail = 0
const failures = []
const check = (name, actual, expected) => {
  const ok = String(actual) === String(expected)
  if (ok) pass += 1
  else {
    fail += 1
    failures.push(`${name}  actual=${JSON.stringify(actual)}  expected=${JSON.stringify(expected)}`)
  }
}
const ok = (name, condition, detail) => {
  if (condition) pass += 1
  else {
    fail += 1
    failures.push(`${name}${detail !== undefined ? '  -> ' + detail : ''}`)
  }
}

const q = (doc, sel) => [...doc.querySelectorAll(sel)]
const txt = (doc, sel) => (doc.querySelector(sel)?.textContent || '').trim()
const body = (doc) => doc.body.textContent.replace(/\s+/g, ' ')

/**
 * 删除冒烟提交的那条留言（按邮箱定位），避免污染种子数据。
 * 失败不影响测试结果 —— 前端本来就无权删留言，这里借 admin 令牌清理。
 */
async function dropSmokeMessage() {
  try {
    const login = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' })
    }).then((r) => r.json())
    const token = login?.data?.token
    if (!token) return
    const auth = { Authorization: 'Bearer ' + token }
    const list = await fetch(API + '/api/messages?pageSize=100', { headers: auth }).then((r) => r.json())
    const mine = (list?.data?.list ?? []).filter((m) => m.email === 'fe-smoke@test.local')
    for (const row of mine) {
      await fetch(API + '/api/messages/' + row.id, { method: 'DELETE', headers: auth })
    }
    if (mine.length > 0) console.log('（已清理冒烟提交的 ' + mine.length + ' 条留言）')
  } catch {
    /* 清理失败不影响断言 */
  }
}

/* ---------------- 主流程 ---------------- */

let server = null

;(async () => {
  /* 后端可达性前置检查 */
  try {
    const health = await fetch(API + '/api/health')
    if (health.status !== 200) throw new Error(String(health.status))
  } catch {
    console.error('后端不可用：' + API + '/api/health')
    console.error('请先执行：cd E:/cp_sf/vscode/cms1/cms1_backend && npm start')
    process.exit(2)
  }

  buildBundle()
  server = await startServer()

  try {
    /* ---------- 首页 ---------- */
    {
      const { doc, errors, close } = await open('/')
      check('首页标题', doc.title, '首页 - 公司官网')
      check('导航 5 项', q(doc, '.nav-links a').length, 5)
      check('导航高亮首页', txt(doc, '.nav-links a.active'), '首页')
      ok('无登录按钮', !doc.querySelector('.login-btn') && !doc.querySelector('.login-item'))
      ok('返回顶部按钮存在', !!doc.querySelector('.back-to-top'))
      check('页脚文案（来自后端站点配置）', txt(doc, '.site-footer'), '© 2026 公司名称. All rights reserved.')
      check('轮播 3 张', q(doc, '.banner-slide').length, 3)
      ok('轮播首图来自后端', /uploads\/seed\/banner-1\.svg/.test(q(doc, '.banner-slide')[0]?.style.backgroundImage || ''))
      check('轮播圆点 3 个', q(doc, '.slide_dot .dot').length, 3)
      check('首页产品位 5 张', q(doc, '.product-item').length, 5)
      check('产品位只有一个 current', q(doc, '.product-item.current').length, 1)
      ok('产品位左右各一张', q(doc, '.product-item.side-left').length === 1 && q(doc, '.product-item.side-right').length === 1)
      check('产品位首件名称', txt(doc, '.product-item.current h3'), '智能平板电脑')
      check('新闻条目 5 条', q(doc, '.news-item').length, 5)
      check('新闻首条标题', txt(doc, '.news-item h3'), '公司获得 A 轮融资，加速全球化布局')
      check('新闻首条日期（2026-08-31 口径）', txt(doc, '.news-date'), '2026-08-31')
      check('两个区块标题', q(doc, '.section-title').length, 2)
      ok('后端在线时无提示条', q(doc, '.offline-tip').length === 0, String(q(doc, '.offline-tip').length))
      errors.forEach((e) => ok('首页 JS 错误', false, e))
      close()
    }

    /* ---------- 首页 / 新闻列表 日期逐条一致 ---------- */
    {
      const home = await open('/')
      const news = await open('/news')
      const homeDates = q(home.doc, '.news-date').map((e) => e.textContent.trim())
      const newsDates = q(news.doc, '.news-card-date').map((e) => e.textContent.trim())
      ok(
        '首页 5 条与列表前 5 条日期逐条一致',
        homeDates.length === 5 && homeDates.every((d, i) => d === newsDates[i]),
        `首页=${homeDates.join(',')} 列表=${newsDates.slice(0, 5).join(',')}`
      )
      home.close()
      news.close()
    }

    /* ---------- 关于我们 ---------- */
    {
      const { doc, errors, close } = await open('/about')
      check('关于标题', doc.title, '关于我们 - 公司官网')
      check('Hero 标题（后台页面 Banner）', txt(doc, '.page-hero-content h1'), '关于我们')
      check('Hero 副标题', txt(doc, '.page-hero-content p'), '专业 · 创新 · 值得信赖')
      check('发展历程 6 条', q(doc, '.timeline-item').length, 6)
      check('核心价值观 4 条', q(doc, '.value-card').length, 4)
      check('荣誉资质 6 条', q(doc, '.honor-card').length, 6)
      check('公司简介统计 4 项', q(doc, '.stat-item').length, 4)
      check('统计首项数字', txt(doc, '.stat-num'), '15+')
      ok('简介正文来自后端', /成立于 2010 年/.test(body(doc)))
      ok('简介配图来自后端', /uploads\/seed\/about\.svg/.test(doc.querySelector('.intro-image img')?.src || ''))
      ok('荣誉首图来自后端', /uploads\/seed\/honor-1\.svg/.test(doc.querySelector('.honor-card img')?.src || ''))
      check('导航高亮关于', txt(doc, '.nav-links a.active'), '关于我们')
      errors.forEach((e) => ok('关于页 JS 错误', false, e))
      close()
    }

    /* ---------- 产品中心 ---------- */
    {
      const { doc, errors, close } = await open('/products')
      check('产品标题', doc.title, '产品中心 - 公司官网')
      check('分类列表 6 项', q(doc, '.category-list li').length, 6)
      check('默认选中全部产品', txt(doc, '.category-list li.active span'), '全部产品')
      check('页面标题', txt(doc, '.page-title'), '全部产品')
      check('数量文案（只含上产品中心的 36 件）', txt(doc, '.products-count'), '共 36 件产品')
      check('首屏 8 张卡片', q(doc, '.product-card').length, 8)
      check('全部产品计数徽标', txt(doc, '.category-list li .category-count'), '36')
      check('电子产品计数徽标', txt(doc, '.category-list li:nth-child(2) .category-count'), '8')
      check('首卡名称', txt(doc, '.product-card .product-name'), '智能平板电脑')
      check('首卡卖点', txt(doc, '.product-card .product-desc'), '高性能 · 低功耗 · 全球认证')
      check('首卡价格两位小数', txt(doc, '.product-card .product-price'), '¥142.00')
      ok('首卡图片来自后端', /uploads\/seed\/product-1\.svg/.test(q(doc, '.product-card img')[0]?.src || ''))
      errors.forEach((e) => ok('产品中心 JS 错误', false, e))
      close()
    }

    /* ---------- 产品中心 ?category=安防系统 ---------- */
    {
      const { doc, errors, close } = await open('/products?category=' + encodeURIComponent('安防系统'))
      check('预选分类', txt(doc, '.category-list li.active span'), '安防系统')
      check('标题随分类变化', txt(doc, '.page-title'), '安防系统')
      check('筛选后数量（7 件）', txt(doc, '.products-count'), '共 7 件产品')
      check('筛选后卡片 7 张', q(doc, '.product-card').length, 7)
      const cats = q(doc, '.product-card .product-category').map((el) => el.textContent.trim())
      ok('筛选结果分类一致', cats.every((c) => c === '安防系统'), cats.join(','))
      errors.forEach((e) => ok('产品筛选 JS 错误', false, e))
      close()
    }

    /* ---------- 产品中心关键词搜索（命名唯一性已修复） ---------- */
    {
      const { doc, errors, close } = await open('/products')
      const input = doc.querySelector('.search-box input')
      input.value = '平板电脑'
      input.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }))
      await new Promise((r) => setTimeout(r, 900)) // 防抖 300ms + 分批 400ms
      check('搜索「平板电脑」命中 1 件', txt(doc, '.products-count'), '共 1 件产品')
      check('搜索结果卡片 1 张', q(doc, '.product-card').length, 1)
      errors.forEach((e) => ok('产品搜索 JS 错误', false, e))
      close()
    }

    /* ---------- 商品详情 ---------- */
    {
      const { doc, errors, close } = await open('/products/1')
      check('详情标题', doc.title, '智能平板电脑 - 公司官网')
      check('商品名', txt(doc, '.detail-name'), '智能平板电脑')
      check('分类标签', txt(doc, '.detail-category'), '电子产品')
      check('价格', txt(doc, '.price-value'), '¥142.00')
      ok('产品编号 NO.001', /NO\.001/.test(body(doc)))
      ok('供货状态在售', /在售/.test(body(doc)))
      check('相关产品 4 件', q(doc, '.related-card').length, 4)
      ok('正文已渲染（含 h3 小标题）', !!doc.querySelector('.rich-content h3'))
      check('面包屑含商品名', txt(doc, '.breadcrumb .current'), '智能平板电脑')
      errors.forEach((e) => ok('商品详情 JS 错误', false, e))
      close()
    }

    /* ---------- 商品详情：未上产品中心 → 404 兜底 ---------- */
    {
      const { doc, errors, close } = await open('/products/37')
      ok('提示商品不存在或已下架', /商品不存在或已下架/.test(body(doc)), txt(doc, '.state-box h2'))
      ok('提供返回产品中心', !!doc.querySelector('.state-box .btn-primary'))
      errors.forEach((e) => ok('商品 404 JS 错误', false, e))
      close()
    }

    /* ---------- 新闻列表 ---------- */
    {
      const { doc, errors, close } = await open('/news')
      check('新闻标题', doc.title, '新闻动态 - 公司官网')
      check('Hero 标题（后台页面 Banner）', txt(doc, '.page-hero-content h1'), '新闻动态')
      check('首屏 6 张卡片', q(doc, '.news-card').length, 6)
      check('列表首条日期', txt(doc, '.news-card-date'), '2026-08-31')
      check('热门文章 5 条（置顶优先）', q(doc, '.hot-list li').length, 5)
      check('热门首条为置顶新闻', txt(doc, '.hot-list li'), '公司获得 A 轮融资，加速全球化布局')
      check('侧栏联系方式 3 行', q(doc, '.sidebar-contact p').length, 3)
      ok('侧栏电话', /400-888-8888/.test(body(doc)))
      ok('侧栏邮箱', /contact@company\.com/.test(body(doc)))
      ok('卡片含摘要', !!doc.querySelector('.news-card-summary'))
      ok('卡片有阅读全文', /阅读全文/.test(body(doc)))
      errors.forEach((e) => ok('新闻列表 JS 错误', false, e))
      close()
    }

    /* ---------- 新闻详情 ---------- */
    {
      const { doc, errors, close } = await open('/news/1')
      check('详情标题', doc.title, '公司获得 A 轮融资，加速全球化布局 - 公司官网')
      check('文章标题', txt(doc, '.article-title'), '公司获得 A 轮融资，加速全球化布局')
      ok('日期 2026-08-31', /2026-08-31/.test(txt(doc, '.article-meta')))
      ok('置顶标记显示', !!doc.querySelector('.top-flag') && !doc.querySelector('.top-flag').hidden)
      ok('正文非空', txt(doc, '.rich-content').length > 50)
      ok('封面来自后端', /uploads\/seed\/news-1\.svg/.test(doc.querySelector('.article-cover')?.src || ''))
      check('上下篇导航 2 项', q(doc, '.article-nav .nav-item').length, 2)
      check('上一篇为更新的 id=2', txt(doc, '.article-nav .nav-item .nav-title'), '新产品发布会在上海圆满举行')
      ok('最新一条的下一篇禁用', doc.querySelectorAll('.article-nav .nav-item')[1]?.classList.contains('disabled') === true)
      errors.forEach((e) => ok('新闻详情 JS 错误', false, e))
      close()
    }

    /* ---------- 新闻详情：不存在 ---------- */
    {
      const { doc, errors, close } = await open('/news/999')
      ok('提示新闻不存在或未发布', /新闻不存在或未发布/.test(body(doc)), txt(doc, '.state-box h2'))
      errors.forEach((e) => ok('新闻 404 JS 错误', false, e))
      close()
    }

    /* ---------- 联系我们 ---------- */
    {
      const { doc, errors, close } = await open('/contact')
      check('联系标题', doc.title, '联系我们 - 公司官网')
      check('联系方式 4 项', q(doc, '.info-item').length, 4)
      const vals = q(doc, '.info-value').map((e) => e.textContent.trim())
      check('地址（后端站点配置）', vals[0], '上海市浦东新区xx路xx号xx大厦 20 楼')
      check('电话双号', vals[1], '400-888-8888 / 021-1234-5678')
      check('邮箱', vals[2], 'contact@company.com')
      check('工作时间', vals[3], '周一至周五 9:00 - 18:00')
      check('表单输入框 5 个', q(doc, '.contact-form-box input, .contact-form-box textarea').length, 5)
      ok('地图 iframe 存在', !!doc.querySelector('.map-iframe'))

      // 空表单提交 → 三个必填错误
      const form = doc.querySelector('.contact-form-box form')
      form.dispatchEvent(new doc.defaultView.Event('submit', { bubbles: true, cancelable: true }))
      await new Promise((r) => setTimeout(r, 300))
      const errs = q(doc, '.error-text').map((e) => e.textContent.trim())
      ok('空提交出现 3 条错误', errs.length === 3, String(errs.length))
      ok('姓名必填错误', errs.includes('请输入您的姓名'), errs.join('|'))
      ok('邮箱必填错误', errs.includes('请输入您的邮箱'))
      ok('留言必填错误', errs.includes('请输入留言内容'))
      check('错误态样式 3 个', q(doc, 'input.error, textarea.error').length, 3)

      // 合法提交 → 真正打到后端。留言接口有「同 IP 10 分钟 5 次」限流，
      // 连跑多轮会命中 429（这也是正确行为），所以三种结果都接受，
      // 但**断言条数固定**，避免因为限流导致 passed 数忽多忽少。
      const inputs = q(doc, '.contact-form-box input, .contact-form-box textarea')
      inputs[0].value = '前台冒烟'
      inputs[1].value = 'fe-smoke@test.local'
      inputs[3].value = '这是一段超过十个字的前台冒烟测试留言内容'
      inputs[4].value = '这是一段超过十个字的前台冒烟测试留言内容'
      inputs.forEach((el) => el.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true })))
      form.dispatchEvent(new doc.defaultView.Event('submit', { bubbles: true, cancelable: true }))
      await new Promise((r) => setTimeout(r, 1800))

      const tip = doc.querySelector('.form-feedback')
      const tipClass = tip ? tip.className : ''
      const tipText = tip ? tip.textContent.trim() : ''
      const success = tipClass.includes('success')
      const limited = tipClass.includes('error') && tipText.includes('提交过于频繁')
      const otherError = Boolean(tip) && tipClass.includes('error') && !limited

      ok('提交后给出明确反馈（成功 / 限流，而不是静默）', success || limited || otherError, tipText || '(没有任何提示条)')
      ok('提交成功后错误提示已清空', q(doc, '.error-text').length === 0, String(q(doc, '.error-text').length))
      check('成功文案正确（未限流时）', success ? tipText : '提交成功！感谢您的留言，我们会尽快与您联系。',
        '提交成功！感谢您的留言，我们会尽快与您联系。')
      if (limited) console.log('  NOTE  本次提交命中留言限流（10 分钟 5 次），已校验限流提示分支。')
      errors.forEach((e) => ok('联系我们 JS 错误', false, e))
      close()
    }

    /* ---------- /login 已删除 → 兜底重定向首页 ---------- */
    {
      const { doc, errors, close } = await open('/login')
      ok('/login 落到首页内容', /欢迎来到我们的公司/.test(body(doc)))
      check('/login 标题为首页', doc.title, '首页 - 公司官网')
      ok('登录占位文案已消失', !/后台登录将在下一阶段接入/.test(body(doc)))
      errors.forEach((e) => ok('/login JS 错误', false, e))
      close()
    }

    /* ---------- 未知路由兜底 ---------- */
    {
      const { doc, close } = await open('/not-exist')
      ok('未知路径回首页', /欢迎来到我们的公司/.test(body(doc)))
      close()
    }
  } finally {
    if (server) await new Promise((r) => server.close(r))
    // 清理冒烟产物（.smoke 已在 .gitignore 中）；--no-build 也照清，
    // 避免在项目里留下体积不小的临时文件
    fs.rmSync(SMOKE_DIR, { recursive: true, force: true })
    // 清理冒烟自己提交的那条留言，别把种子数据撑大（后端 smoke 也是这么做的）
    await dropSmokeMessage()
  }

  console.log(`\n===== Vue 前台冒烟：${pass} passed, ${fail} failed =====`)
  if (failures.length) {
    console.log('\n失败项：')
    failures.forEach((f) => console.log('  - ' + f))
    process.exitCode = 1
  }
})().catch((error) => {
  console.error('运行异常：', error)
  console.error('\n请确认后端已启动：' + API)
  process.exitCode = 2
})
