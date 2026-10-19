import { post } from '@/utils/request'
import type { ContactForm } from '@/types'

/* ==========================================================================
   联系我们（表单提交）
   后端会做字段校验并限流（同一 IP 10 分钟最多 5 次），
   超限返回 429，错误信息由 RequestError 带给页面。
   ========================================================================== */

export function submitContactMessage(payload: ContactForm): Promise<{ id: number }> {
  return post<{ id: number }>('/api/public/contact', {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim()
  })
}
