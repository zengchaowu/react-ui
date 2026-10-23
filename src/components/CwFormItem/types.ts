import type {
  ComponentClass,
  FocusEvent,
  JSXElementConstructor,
  ReactNode,
} from 'react'
import type { CwColProps } from '../CwRow/types'

/** 动态组件类型（兼容函数组件、forwardRef 组件与类组件） */
export type CwFormItemComponent =
  | JSXElementConstructor<Record<string, unknown>>
  | ComponentClass<Record<string, unknown>>

// 组件配置
export interface ComponentConfig {
  /** 组件对象 */
  component: CwFormItemComponent
  /** 默认属性 */
  defaultProps?: Record<string, unknown>
}

// 验证结果
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  message?: string
}

export type CwFormItemAppearance = 'default' | 'filter-row' | 'dialog-row' | 'field-compact'

// 基础表单项配置
export type CwFormItemBaseConfig = {
  /** 字段名 */
  prop: string
  /** 标签文本 */
  label?: string
  /** 标签旁 info 图标 hover 提示（说明性文案，勿塞进 label） */
  labelTip?: string
  /** 表单项场景外观 */
  appearance?: CwFormItemAppearance
  /** 标签宽度，支持固定值或函数 */
  labelWidth?: string | ((formItem: CwFormItemBaseConfig) => string)
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 响应式栅格配置 */
  col?: CwColProps
}

export type CwFormItemConfig = CwFormItemBaseConfig & {
  /** 组件配置 */
  componentConfig: ComponentConfig
  /** 组件属性 */
  props?: Record<string, unknown>
}

/** Vue `#label` 作用域插槽参数 */
export interface CwFormItemLabelSlotScope {
  config: CwFormItemConfig
}

/** Vue `#error` 作用域插槽参数 */
export interface CwFormItemErrorSlotScope {
  validationResult?: ValidationResult
  config: CwFormItemConfig
  texts: CwFormItemTexts
  errorId: string
}

export type CwFormItemSlotContent<TScope> =
  | ReactNode
  | ((scope: TScope) => ReactNode)

// 组件Props
export interface CwFormItemProps {
  /** 表单项配置 */
  config: CwFormItemConfig
  /** 验证结果 */
  validationResult?: ValidationResult
  /** 组件值（Vue `modelValue`） */
  value: unknown
  /** Vue `update:modelValue` */
  onChange?: (value: unknown) => void
  /** Vue `@focus` */
  onFocus?: (event: FocusEvent) => void
  /** Vue `@blur` */
  onBlur?: (event: FocusEvent) => void
  /** Vue `@change` 原生事件 */
  onChangeEvent?: (event: Event) => void
  /** 自定义文本对象 */
  texts?: Partial<CwFormItemTexts>
  /** Vue `#label` 插槽 */
  labelSlot?: CwFormItemSlotContent<CwFormItemLabelSlotScope>
  /** Vue `#error` 插槽 */
  errorSlot?: CwFormItemSlotContent<CwFormItemErrorSlotScope>
  className?: string
}

/** @internal */
export interface CwFormItemStyles {
  // 根容器：基础样式 + 状态样式
  root: string
  rootNormal: string
  rootReadonly: string
  rootDisabled: string

  // 标签：基础样式 + 状态样式
  label: string
  labelNormal: string
  labelReadonly: string
  labelDisabled: string
  // 标签文本节点（用于挂载伪元素），基础样式
  labelText: string
  /** 标签旁 tip 图标按钮 */
  labelTipTrigger: string

  // 必填标记
  labelRequired: string
  labelRequiredNormal: string
  labelRequiredReadonly: string
  labelRequiredDisabled: string

  // 内容容器：基础样式
  content: string

  // 组件容器：基础样式
  component: string

  // 错误信息：基础样式
  error: string
}

export interface CwFormItemTexts {
  /** 必填提示文案 */
  requiredMessage?: string
}

// 组件事件（React 回调等价物）
export interface CwFormItemEmits {
  /** 焦点事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
  /** 变化事件 */
  onChangeEvent?: (event: Event) => void
}
