import type { HTMLAttributes } from 'react'
import type { CwTextareaTexts } from '@zengchaowu/ui-shared/components/CwTextarea/types'

export interface CwTextareaProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'onChange' | 'onInput' | 'onFocus' | 'onBlur'
  > {
  /** 文本域当前值 */
  value?: string
  /** 占位提示 */
  placeholder?: string
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最多可输入字符数 */
  maxlength?: number
  /** 可见行数 */
  rows?: number
  /** 是否展示字符计数 */
  showCount?: boolean
  /** 最大可输入行数（包含换行） */
  maxRows?: number
  /** 最小可见行数 */
  minRows?: number
  /** 文本域尺寸 */
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwTextareaTexts>
  className?: string
  /** 值变化（输入事件） */
  onChange?: (value: string) => void
  /** 输入事件 */
  onInput?: (value: string) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwTextareaHandle {
  focus: () => void
  blur: () => void
  select: () => void
  readonly textareaRef: HTMLTextAreaElement | null
}

export interface CwTextareaEmits {
  /** 值更新事件（对应 update:modelValue / 原生 change） */
  onChange?: (value: string) => void
  /** 输入事件 */
  onInput?: (value: string) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}
