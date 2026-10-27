import type { ElementType } from 'react'
import type { CwRichTextNode } from '@zengchaowu/ui-shared/components/CwRichText/types'

import type { CwConfigCardTexts } from '@zengchaowu/ui-shared/components/CwConfigCard/types'

/** 配置项中可渲染的组件（等价于 Vue `Component`） */
export type ConfigCardComponent = ElementType

/** 配置项值类型 */
export type ConfigCardValue =
  | string
  | CwRichTextNode[]
  | ConfigCardComponent
  | { type: 'richText'; dsl: CwRichTextNode[] }
  | { type: 'component'; component: ConfigCardComponent; props?: Record<string, unknown> }

/** 配置项 */
export interface CwConfigCardItem {
  /** 唯一键值 */
  key: string
  /** 标签（左侧，不换行） */
  label: string
  /** 值（右侧，可换行） */
  value?: ConfigCardValue
  /** 富文本配置（当 value 为字符串时，可通过此字段转换为富文本） */
  richText?: CwRichTextNode[]
  /** 组件配置（当 value 为字符串时，可通过此字段渲染组件） */
  component?: ConfigCardComponent
  /** 组件 props（配合 component 使用） */
  componentProps?: Record<string, unknown>
  /** 值文本颜色（可选，如 'text-[var(--brand-color-6)]' 用于蓝色文本） */
  valueColor?: string
  /** 是否禁用 */
  disabled?: boolean
}

/** Props */
export interface CwConfigCardProps {
  /** 标题（不传则不显示头部） */
  title?: string
  /** 是否可折叠（默认 false） */
  collapsible?: boolean
  /** 默认是否展开（collapsible 为 true 时生效，默认 true） */
  defaultExpanded?: boolean
  /** 配置项列表 */
  items?: CwConfigCardItem[]
  texts?: Partial<CwConfigCardTexts>
  /** 折叠状态变化（Vue `expand-change`） */
  onExpandChange?: (expanded: boolean) => void
  /** 富文本链接点击（Vue `rich-text-link-click`） */
  onRichTextLinkClick?: (href: string, event: MouseEvent) => void
}

/** Emits */
export interface CwConfigCardEmits {
  /** 折叠状态变化 */
  onExpandChange?: (expanded: boolean) => void
  /** 富文本链接点击 */
  onRichTextLinkClick?: (href: string, event: MouseEvent) => void
}
