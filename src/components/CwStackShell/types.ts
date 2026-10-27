import type { ReactNode } from 'react'
import type { CwStackShellMode } from '@zengchaowu/ui-shared/components/CwStackShell/types'

export interface CwStackShellProps {
  /** list 为根，detail 为 push 层 */
  stack: CwStackShellMode
  /** 为 false 时关闭 CwStack 横向 push/pop 转场 */
  slideTransition?: boolean
  /**
   * 内容区 inset 模式：栈层透明，由 slot 页（如 CwSettingsPage）自带背景与 max-width，
   * push/pop 时保留左右留白。全屏场景勿开。
   * @default false
   */
  contentInset?: boolean
  /** `list` 具名插槽 */
  listSlot?: ReactNode
  /** `detail` 具名插槽 */
  detailSlot?: ReactNode
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwStackShellEmits {}
