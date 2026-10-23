import type { Placement } from '@zengchaowu/shared/types/placement'
import type { PopupTrigger } from './types/state'

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  placement: 'top' as Placement,
  trigger: 'hover' as PopupTrigger,
  showDelay: 0,
  hideDelay: 100,
  closeOnClickOutside: true,
  throttleDelay: 100, // 鼠标移动节流延迟
  /** show() 内等待 DOM ref 就绪的最大重试次数 */
  showRepositionMaxAttempts: 8,
} as const
