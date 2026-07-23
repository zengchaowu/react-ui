import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
import type { CwCardTexts } from '../CwCard/types'
import type { CwFormItemConfig as CwFormItemConfigBase } from '../CwFormItem/types'
import type { ComponentConfig } from '../CwFormItem/types'
import type { ValidationResult } from '../CwFormItem/types'

// CwFormCard 中扩展的表单项配置
export interface CwFormCardItemConfig extends CwFormItemConfigBase {
  /** 组件配置 */
  componentConfig: ComponentConfig
  /** 组件属性 */
  props?: Record<string, any>
  /** 验证函数，接收完整的表单数据并返回验证结果 */
  validate?: (formData: Record<string, any>) => ValidationResult
  /** 右侧操作区域（如"获取验证码"按钮） */
  rightAction?: ComponentType<any> | { component: ComponentType<any>; props?: Record<string, any> }
  /** 是否显示底部分隔线（默认 true，最后一项可设为 false） */
  showDivider?: boolean
}

/** 样式定义 */
export interface CwFormCardStyles {
  /** 根容器样式 */
  root: string
  /** 头部容器 */
  header: string
  /** 标题文字样式 */
  title: string
  /** 内容容器 */
  content: string
  /** 表单项行容器 */
  itemRow: string
  /** 表单项行：最后一项 */
  itemRowLast: string
  /** 左侧标签 */
  itemLabel: string
  /** 左侧标签文本 */
  itemLabelText: string
  /** 左侧标签必填标记 */
  itemLabelRequired: string
  /** 右侧内容区域（外层容器，负责占满剩余空间） */
  itemContent: string
  /** 右侧内容内部容器（可通过宽度类控制右侧统一宽度） */
  itemContentInner: string
}

export interface CwFormCardTexts {
  /** 内嵌 {@link CwCard} */
  cardTexts?: Partial<CwCardTexts>
}

/** Props */
export interface CwFormCardProps {
  /** 标题（不传则不显示头部） */
  title?: string
  /** 表单项配置数组 */
  items: CwFormCardItemConfig[]
  /** 表单数据 */
  modelValue: Record<string, any>
  /** 是否禁用整个表单 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 自定义样式 */
  styles?: Partial<CwFormCardStyles>
  texts?: Partial<CwFormCardTexts>
}

/** Emits */
export interface CwFormCardEmits {
  /** 表单数据变化事件 */
  'update:modelValue': [value: Record<string, any>]
  /** 字段变化事件 */
  'fieldChange': [field: string, value: any]
}
