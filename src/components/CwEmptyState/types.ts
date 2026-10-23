import type { HTMLAttributes, ReactNode } from 'react'

export interface CwEmptyStateTexts {
  /** 未提供 #text 插槽时的默认提示 */
  defaultMessage: string
}

/**
 * 外观变体：
 * - `default`：通用空状态
 * - `panel`：列表/会话空面板（更高占位）
 * - `compact`：紧凑居中（侧栏等）
 */
export type CwEmptyStateAppearance = 'default' | 'panel' | 'compact'

export interface CwEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size'> {
  /** 尺寸（影响默认文案字号与图标槽尺寸） */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示文案（未提供 #text 时用 texts.defaultMessage） */
  showText?: boolean
  /** 场景外观；布局用原生 class */
  appearance?: CwEmptyStateAppearance
  texts?: Partial<CwEmptyStateTexts>
  /** `icon` 具名插槽 */
  icon?: ReactNode
  /** `text` 具名插槽 */
  text?: ReactNode
  /** `action` 具名插槽 */
  action?: ReactNode
}

/** 内部结构类 */
export interface CwEmptyStateStyles {
  root: string
  icon: string
  text: string
  action: string
}
