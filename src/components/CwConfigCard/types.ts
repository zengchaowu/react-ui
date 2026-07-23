import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
import type { CwRichTextNode } from '../CwRichText/types'
import type { CwRichTextStyles, CwRichTextTexts } from '../CwRichText/types'
import type { CwEmbeddedIconStyles } from '../CwIcon/types'

/** 配置项值类型 */
export type ConfigCardValue =
  | string
  | CwRichTextNode[]
  | ComponentType<any>
  | { type: 'richText'; dsl: CwRichTextNode[] }
  | { type: 'component'; component: ComponentType<any>; props?: Record<string, any> }

/** 配置项 */
export interface CwConfigCardItem {
  /** 唯一键值 */
  key: string
  /** 标签（左侧，不换行） */
  label: string
  /** 值（右侧，可换行）
   * - 字符串：直接显示
   * - CwRichTextNode[]：使用 CwRichText 渲染
   * - ComponentType<any>：直接渲染组件
   * - { type: 'richText', dsl: CwRichTextNode[] }：显式指定富文本
   * - { type: 'component', component: ComponentType<any>, props?: Record<string, any> }：显式指定组件及 props
   */
  value?: ConfigCardValue
  /** 富文本配置（当 value 为字符串时，可通过此字段转换为富文本） */
  richText?: CwRichTextNode[]
  /** 组件配置（当 value 为字符串时，可通过此字段渲染组件） */
  component?: ComponentType<any>
  /** 组件 props（配合 component 使用） */
  componentProps?: Record<string, any>
  /** 值文本颜色（可选，如 'text-[var(--text-color-link)]' 用于蓝色文本） */
  valueColor?: string
  /** 是否禁用 */
  disabled?: boolean
}

/** 样式定义 */
export interface CwConfigCardStyles {
  /** 根容器样式 */
  root: string
  /** 头部容器 */
  header: string
  /** 头部内层（整行可点击时包住标题与折叠图标） */
  headerInner?: string
  /** 头部可点击态样式 */
  headerClickable?: string
  /** 头部展开时的分割线样式 */
  headerExpanded?: string
  /** 标题文字样式 */
  title: string
  /** 折叠图标容器 */
  collapseIcon: string
  /** 折叠图标样式 */
  collapseIconStyles?: CwEmbeddedIconStyles
  /** 分隔线 */
  divider: string
  /** 内容容器 */
  content: string
  /** 配置项容器 */
  item: string
  /** 配置项标签样式 */
  itemLabel: string
  /** 配置项值样式 */
  itemValue: string
  /** 配置项值：富文本容器 */
  itemValueRichText: string
  /** 配置项值：组件容器 */
  itemValueComponent: string
  /** CwRichText 样式配置 */
  richTextStyles?: Partial<CwRichTextStyles>
}

/** 文案（含子组件 CwRichText 的独立 texts 配置） */
export interface CwConfigCardTexts {
  richTextTexts?: Partial<CwRichTextTexts>
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
  items: CwConfigCardItem[]
  /** 自定义样式 */
  styles?: Partial<CwConfigCardStyles>
  texts?: Partial<CwConfigCardTexts>
}

/** Emits */
export interface CwConfigCardEmits {
  /** 折叠状态变化 */
  'expand-change': [expanded: boolean]
  /** 富文本链接点击 */
  'rich-text-link-click': [href: string, event: MouseEvent]
}
