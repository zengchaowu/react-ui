import type { HTMLAttributes, MouseEventHandler } from 'react'

export interface CwSettingsNavRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> {
  title: string
  description?: string
  /** CwIcon name */
  icon?: string
  danger?: boolean
  showChevron?: boolean
  showUnderline?: boolean
  iconSize?: number
  onClick?: MouseEventHandler<HTMLDivElement>
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwSettingsNavRowEmits {
  (e: 'click', event: MouseEvent): void
}
