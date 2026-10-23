import type { HTMLAttributes, ReactNode } from 'react'

export interface CwTagProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onClick'> {
  /**
   * 标签内容
   */
  content?: string
  /**
   * 是否显示删除按钮
   */
  closable?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读
   */
  readonly?: boolean
  /**
   * 标签类型
   */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /**
   * 标签尺寸
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * 自定义文本
   */
  texts?: Partial<CwTagTexts>
  /**
   * 默认插槽内容（优先于 content）
   */
  children?: ReactNode
  className?: string
  /**
   * 点击标签时触发
   */
  onClick?: (event: MouseEvent) => void
  /**
   * 点击删除按钮时触发
   */
  onClose?: (event: MouseEvent) => void
}

export interface CwTagStyles {
  /** 根容器：基础样式 */
  root: string
  /** 根容器：正常状态 */
  rootNormal: string
  /** 根容器：禁用状态 */
  rootDisabled: string
  /** 根容器：只读状态 */
  rootReadonly: string
  /** 根容器：聚焦样式 */
  rootFocused: string
  /** 标签内容：基础样式 */
  content: string
  /** 标签内容字号：小 */
  contentSizeSmall?: string
  /** 标签内容字号：中 */
  contentSizeMedium?: string
  /** 标签内容字号：大 */
  contentSizeLarge?: string
  /** 标签内容：正常状态 */
  contentNormal: string
  /** 标签内容：禁用状态 */
  contentDisabled: string
  /** 标签内容：只读状态 */
  contentReadonly: string
  /** 删除按钮：基础样式 */
  closeButton: string
  /** 删除按钮：正常状态 */
  closeButtonNormal: string
  /** 删除按钮：禁用状态 */
  closeButtonDisabled: string
  /** 删除按钮：只读状态 */
  closeButtonReadonly: string
  /** 删除按钮：悬停状态 */
  closeButtonHover: string
  /** 类型样式：默认 */
  typeDefault: string
  /** 类型样式：主要 */
  typePrimary: string
  /** 类型样式：成功 */
  typeSuccess: string
  /** 类型样式：警告 */
  typeWarning: string
  /** 类型样式：危险 */
  typeDanger: string
  /** 尺寸样式：小 */
  sizeSmall: string
  /** 尺寸样式：中 */
  sizeMedium: string
  /** 尺寸样式：大 */
  sizeLarge: string
  /** 删除图标样式配置 */
  closeIconStyles?: { size?: number; class?: string }
}

export interface CwTagTexts {
  /**
   * 删除按钮的无障碍标签（aria-label）
   */
  closeLabel?: string
}

export interface CwTagEmits {
  /**
   * 点击删除按钮时触发
   */
  onClose?: (event: MouseEvent) => void
  /**
   * 点击标签时触发
   */
  onClick?: (event: MouseEvent) => void
}
