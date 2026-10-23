import type { ReactNode } from 'react'
import type {
  CwFormItemConfig as CwFormItemConfigBase,
  CwFormItemAppearance,
  ComponentConfig,
  ValidationResult,
} from '../CwFormItem/types'
import type { CwRowProps, CwColProps } from '../CwRow/types'

export type { CwFormItemAppearance } from '../CwFormItem/types'

// CwForm 中扩展的 CwFormItemConfig
export interface CwFormItemConfigInForm extends CwFormItemConfigBase {
  /** 验证函数，接收完整的表单数据并返回验证结果 */
  validate?: (formData: Record<string, unknown>) => ValidationResult
}

// 表单项全局配置
export interface CwFormItemGlobalConfig {
  /** 默认的列属性配置 */
  col?: CwColProps
  /** 表单项默认 appearance（单项可覆盖） */
  appearance?: CwFormItemAppearance
}

// 布局配置
export interface CwFormLayoutConfig {
  /** 最大显示行数 */
  maxRows?: number
  /** 栅格布局配置 */
  grid?: CwRowProps
  /** 使用原生 form 元素；为 true 时输入框回车触发 submit 事件 */
  native?: boolean
}

// 表单配置
export interface CwFormConfig {
  /** 表单项配置数组 */
  items: CwFormItemConfigInForm[]
  /** 表单项全局配置 */
  item?: CwFormItemGlobalConfig
  /** 布局配置 */
  layout?: CwFormLayoutConfig
}

// 表单Props
export interface CwFormProps {
  /** 表单配置 */
  config: CwFormConfig
  /** 表单数据（Vue `modelValue`） */
  value: Record<string, unknown>
  /** 是否禁用整个表单 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 自定义文本对象 */
  texts?: Partial<CwFormTexts>
  /** Vue `update:modelValue` */
  onChange?: (value: Record<string, unknown>) => void
  /** Vue `fieldChange` */
  onFieldChange?: (field: string, value: unknown) => void
  /** Vue `submit`（layout.native 为 true 时，如回车） */
  onSubmit?: (value: Record<string, unknown>) => void
  /** Vue `#collapse-controls` 具名插槽 */
  collapseControlsSlot?: ReactNode
  className?: string
}

/** @internal */
export interface CwFormStyles {
  // 根容器：基础样式 + 状态样式
  root: string
  rootNormal: string
  rootReadonly: string
  rootDisabled: string
  /** layout.native 时用于承接回车提交的隐藏按钮 */
  nativeSubmitTrigger?: string
}

export interface CwFormTexts {
  /** 必填提示文案 */
  requiredMessage?: string
}

// 表单事件（React 回调等价物）
export interface CwFormEmits {
  /** 表单数据变化事件 */
  onChange?: (value: Record<string, unknown>) => void
  /** 字段变化事件 */
  onFieldChange?: (field: string, value: unknown) => void
  /** 原生 form 提交（layout.native 为 true 时，如回车） */
  onSubmit?: (value: Record<string, unknown>) => void
}

export type { ComponentConfig }

/** CwForm → CwFormItem 的上下文（对应 Vue provide/inject） */
export interface CwFormContextValue {
  formData: Record<string, unknown>
  disabled: boolean
  readonly: boolean
  texts: CwFormTexts
  markFieldTouched: (field: string) => void
}

// CwForm 组件实例暴露的属性和方法
export interface CwFormExposed {
  /** 表单数据 */
  formData: Record<string, unknown>
  /** 折叠状态 */
  isCollapsed: boolean
  /**
   * 校验全部字段并展示错误。
   * 返回是否全部通过；未交互前不会展示必填错误，调用后才会展示。
   */
  validate: () => boolean
  /** 清除已展示的校验错误与 touched 状态 */
  clearValidate: () => void
  /** 重置为初始数据并清除校验状态 */
  resetFields: () => void
}
