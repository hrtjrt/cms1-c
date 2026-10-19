<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import PageHero from '@/components/common/PageHero.vue'
import { useSiteStore } from '@/stores/site'
import { submitContactMessage } from '@/api/contact'
import { RequestError } from '@/utils/request'
import { createEmptyContactForm, isFormValid, validateContactForm } from '@/utils/validate'
import type { ContactFormErrors, PageHeroConfig } from '@/types'

/* ==========================================================================
   联系我们
   对应 hjc/contact.html + js/contact.js：
   左侧联系方式、右侧留言表单（逐字段校验）、底部地图

   v2 的变化：
     · 联系方式与地图地址来自后台「站点管理」（store 里统一拉取）
     · 表单真正提交到后端 /api/public/contact，会落库并在后台「留言管理」里出现
     · 用页面内提示替代 window.alert（alert 在移动端体验差，也不利于自动化验证）
   ========================================================================== */

const site = useSiteStore()

const form = reactive(createEmptyContactForm())
const errors = ref<ContactFormErrors>({})
const submitting = ref(false)
const hero = ref<PageHeroConfig | null>(null)

/** 提交结果提示：成功 / 失败（含后端返回的具体原因，例如限流提示） */
const feedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const submitLabel = computed(() => (submitting.value ? '提交中...' : '提交留言'))

const heroProps = computed(() => ({
  title: hero.value?.title || '联系我们',
  subtitle: hero.value?.subtitle || 'CONTACT US',
  image: hero.value?.image || '',
  height: hero.value?.height || '380px',
  heightSm: hero.value?.heightSm || '280px',
  mask: hero.value?.mask || 'rgba(10, 23, 218, 0.55)'
}))

/** 输入时实时清除该字段的错误提示 */
function clearError(field: keyof ContactFormErrors): void {
  if (errors.value[field] === undefined) return
  const next = { ...errors.value }
  delete next[field]
  errors.value = next
}

async function handleSubmit(): Promise<void> {
  feedback.value = null
  errors.value = validateContactForm(form)
  if (!isFormValid(errors.value)) return

  submitting.value = true
  try {
    await submitContactMessage(form)
    feedback.value = { type: 'success', text: '提交成功！感谢您的留言，我们会尽快与您联系。' }
    Object.assign(form, createEmptyContactForm())
    errors.value = {}
  } catch (error) {
    // 后端会把「提交过于频繁」这类具体原因带回来，直接展示给用户
    const text =
      error instanceof RequestError ? error.message : '提交失败，请稍后重试'
    feedback.value = { type: 'error', text }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  hero.value = await site.loadPageHero('contact')
})
</script>

<template>
  <main class="contact-page">
    <PageHero v-bind="heroProps" />

    <section class="contact-section">
      <div class="container">
        <div class="contact-layout">
          <!-- 左侧：联系方式 -->
          <div class="contact-info">
            <h2 class="contact-title">与我们取得联系</h2>
            <p class="contact-intro">
              无论是产品咨询、合作洽谈还是售后服务，我们都随时欢迎您的联系。我们会尽快回复您。
            </p>

            <div
              v-for="item in site.contactInfoList"
              :key="item.label"
              class="info-item"
            >
              <div class="info-icon">{{ item.icon }}</div>
              <div>
                <div class="info-label">{{ item.label }}</div>
                <div class="info-value">{{ item.value }}</div>
              </div>
            </div>
          </div>

          <!-- 右侧：留言表单 -->
          <div class="contact-form-box">
            <h2 class="contact-title">在线留言</h2>
            <form novalidate @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">您的姓名 <span>*</span></label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="请输入您的姓名"
                  :class="{ error: errors.name }"
                  @input="clearError('name')"
                />
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
              </div>

              <div class="form-group">
                <label for="email">电子邮箱 <span>*</span></label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  :class="{ error: errors.email }"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="phone">联系电话</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="请输入您的电话（选填）"
                  :class="{ error: errors.phone }"
                  @input="clearError('phone')"
                />
                <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
              </div>

              <div class="form-group">
                <label for="subject">主题</label>
                <input
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  placeholder="请输入咨询主题（选填）"
                />
              </div>

              <div class="form-group">
                <label for="message">留言内容 <span>*</span></label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                  placeholder="请输入您想咨询的内容（至少 10 个字）"
                  :class="{ error: errors.message }"
                  @input="clearError('message')"
                />
                <span v-if="errors.message" class="error-text">{{ errors.message }}</span>
              </div>

              <div v-if="feedback" class="form-feedback" :class="feedback.type">
                {{ feedback.text }}
              </div>

              <button type="submit" class="submit-btn" :disabled="submitting">
                {{ submitLabel }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- 地图 -->
    <section class="map-section">
      <iframe
        class="map-iframe"
        :src="site.mapEmbedUrl"
        loading="lazy"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
        title="公司位置"
      />
    </section>
  </main>
</template>

<style scoped>
.contact-section {
  padding: var(--gap-section, 80px) 0;
  background: var(--c-bg-soft);
}

.contact-layout {
  display: flex;
  gap: 50px;
  align-items: flex-start;
}

/* 左侧：联系方式 */
.contact-info {
  flex: 1;
}

.contact-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--c-ink);
  margin-bottom: 18px;
  position: relative;
  padding-left: 16px;
}

.contact-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 26px;
  background: var(--c-primary);
  border-radius: var(--radius-xs);
}

.contact-intro {
  color: var(--c-text-muted);
  line-height: 1.8;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px solid var(--c-line-info);
  align-items: flex-start;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  flex: 0 0 44px;
  height: 44px;
  background: var(--c-primary-soft);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.info-label {
  font-size: 0.85rem;
  color: var(--c-text-faint);
  margin-bottom: 6px;
}

.info-value {
  font-size: 0.95rem;
  color: var(--c-text);
  line-height: 1.6;
}

/* 右侧：表单 */
.contact-form-box {
  flex: 1.2;
  background: var(--c-bg);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  box-shadow: var(--shadow-pop);
}

.contact-form-box .contact-title {
  margin-bottom: 26px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--c-text);
  margin-bottom: 8px;
}

.form-group label span {
  color: var(--c-danger);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--c-text);
  outline: none;
  transition: border-color var(--dur), box-shadow var(--dur);
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-a10);
}

.form-group input.error,
.form-group textarea.error {
  border-color: var(--c-danger);
}

.error-text {
  display: block;
  color: var(--c-danger);
  font-size: 0.8rem;
  margin-top: 6px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--c-primary);
  color: var(--c-white);
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background var(--dur), transform 0.15s;
}

.submit-btn:hover {
  background: var(--c-primary-dark);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background: var(--c-text-faint);
  cursor: not-allowed;
}

/* 地图 */
.map-section {
  height: 400px;
  background: var(--c-map-bg);
}

.form-feedback {
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  line-height: 1.6;
}

.form-feedback.success {
  background: #e8f6ee;
  color: #1a7f45;
  border: 1px solid #b7e4c7;
}

.form-feedback.error {
  background: #fdecec;
  color: #b42318;
  border: 1px solid #f6c7c4;
}

.map-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

/* 响应式 */
@media (max-width: 900px) {
  .contact-layout {
    flex-direction: column;
    gap: 36px;
  }

  .contact-form-box {
    width: 100%;
    padding: 28px 22px;
  }

  .map-section {
    height: 300px;
  }
}

@media (max-width: 600px) {
  .contact-section {
    padding: 50px 0;
  }

  .contact-title {
    font-size: 1.3rem;
  }

  .info-item {
    padding: 16px 0;
  }

  .info-icon {
    flex: 0 0 38px;
    height: 38px;
    font-size: 1.1rem;
  }
}
</style>
