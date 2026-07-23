import type { CwButtonTexts } from '../CwButton/types'
import type { CwCountDownButtonTexts } from './types'

export const defaultTexts: CwCountDownButtonTexts = {
  idle: '发送验证码',
  pending: '校验中...',
  counting: '{{remaining}} 秒后可重试',
  finished: '重新发送',
  ariaLabel: '发送验证码',
  buttonTexts: {
    label: '发送验证码'
  } as Partial<CwButtonTexts>
}

