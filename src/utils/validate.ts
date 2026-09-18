import type { ContactForm, ContactFormErrors } from '@/types'

/* ==========================================================================
   联系我们表单校验
   规则逐条搬运自 hjc/js/contact.js 的 validate()，文案与阈值保持一致。
   原文没有对「主题」做校验，此处同样放开。
   ========================================================================== */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/

const MIN_NAME_LENGTH = 2
const MIN_MESSAGE_LENGTH = 10

export function validateContactForm(form: ContactForm): ContactFormErrors {
  const errors: ContactFormErrors = {}
  const name = form.name.trim()
  const email = form.email.trim()
  const phone = form.phone.trim()
  const message = form.message.trim()

  if (!name) {
    errors.name = '请输入您的姓名'
  } else if (name.length < MIN_NAME_LENGTH) {
    errors.name = '姓名至少 2 个字符'
  }

  if (!email) {
    errors.email = '请输入您的邮箱'
  } else if (!EMAIL_RE.test(email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  // 电话选填，填写了才校验格式
  if (phone && !PHONE_RE.test(phone)) {
    errors.phone = '请输入有效的电话号码'
  }

  if (!message) {
    errors.message = '请输入留言内容'
  } else if (message.length < MIN_MESSAGE_LENGTH) {
    errors.message = '留言内容至少 10 个字'
  }

  return errors
}

/** 表单是否没有任何错误 */
export function isFormValid(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length === 0
}

/** 创建一份空表单 */
export function createEmptyContactForm(): ContactForm {
  return { name: '', email: '', phone: '', subject: '', message: '' }
}
