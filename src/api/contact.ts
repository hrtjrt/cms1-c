import { mock } from '@/utils/request'
import type { ApiResult, ContactForm } from '@/types'

/* ==========================================================================
   联系我们接口
   原 hjc/js/contact.js 用 await new Promise(resolve => setTimeout(resolve, 800))
   模拟提交，这里保持同样的 800ms 延迟，并把 trim 后的数据原样回传。
   ========================================================================== */

const SUBMIT_DELAY = 800

export function submitContactMessage(payload: ContactForm): Promise<ApiResult<ContactForm>> {
  const trimmed: ContactForm = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim()
  }
  return mock(trimmed, SUBMIT_DELAY)
}
