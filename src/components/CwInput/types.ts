import type { HTMLAttributes, ReactNode } from 'react'
import type { CwInputAppearance, CwInputTexts } from '@zengchaowu/ui-shared/components/CwInput/types'

/** 具名插槽（icon / clear / suffix）可用的作用域参数 */
export interface CwInputSlotProps {
  disabled: boolean
  readonly: boolean
}

/** 具名插槽内容：可直接传节点，也可传接收作用域参数的渲染函数 */
export type CwInputSlotContent = ReactNode | ((slotProps: CwInputSlotProps) => ReactNode)

export interface CwInputProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'children'
    | 'className'
    | 'onChange'
    | 'onInput'
    | 'onSelect'
    | 'onKeyDown'
    | 'onFocus'
    | 'onBlur'
  > {
  /** 输入框的值 */
  value?: string
  /** 输入框占位符 */
  placeholder?: string
  /** 输入框类型 */
  type?: string
  /** 最多可输入字符数（透传给原生 input） */
  maxLength?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /**
   * 展示用前缀：有内容时注入 input 值最前（如 1 → 显示 ¥1），
   * 编辑时拦截并剥离；value 不含 prefix。
   */
  prefix?: string
  /** 文本对齐方式 */
  align?: 'left' | 'right' | 'center'
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 官方外观（场景皮肤） */
  appearance?: CwInputAppearance
  /** 浏览器拼写检查；文件名等场景传 false */
  spellcheck?: boolean
  /** 自定义文本 */
  texts?: Partial<CwInputTexts>
  /** 图标插槽 */
  iconSlot?: CwInputSlotContent
  /** 清除按钮插槽 */
  clearSlot?: CwInputSlotContent
  /** 后缀插槽 */
  suffixSlot?: CwInputSlotContent
  /** 兼容直接以 suffix 传入后缀内容 */
  suffix?: ReactNode
  className?: string
  /** 值变化（输入事件） */
  onChange?: (value: string) => void
  /** 输入事件 */
  onInput?: (value: string) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
  /** 清除事件 */
  onClear?: () => void
  /** 按键事件 */
  onKeyDown?: (event: KeyboardEvent) => void
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwInputHandle {
  focus: () => void
  readonly inputRef: HTMLInputElement | null
}

export interface CwInputEmits {
  onChange?: (value: string) => void
  onInput?: (value: string) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onClear?: () => void
  onKeyDown?: (event: KeyboardEvent) => void
}
