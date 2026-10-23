import type { ReactNode } from 'react'

export type CwStackShellMode = 'list' | 'detail'

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

export interface CwStackShellStyles {
  root: string
  stackRoot: string
  layer: string
  layerInset: string
}

export interface CwStackShellTexts {}
