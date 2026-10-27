import type { HTMLAttributes } from 'react'

export interface CwSearchBarProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'onChange' | 'onInput' | 'onFocus' | 'onBlur' | 'onKeyDown'
  > {
  /** 输入框的值 */
  value?: string
  /** 输入框占位符 */
  placeholder?: string
  /** 查询按钮文本 */
  buttonText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示右侧查询按钮 */
  showButton?: boolean
  /** 自定义文本 */
  texts?: Partial<CwSearchBarTexts>
  className?: string
  /** 值更新事件（Vue `update:modelValue`） */
  onChange?: (value: string) => void
  /** 输入事件 */
  onInput?: (value: string) => void
  /** 查询事件 */
  onSearch?: (value: string) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}

export interface CwSearchBarTexts {
  placeholder?: string
  buttonText?: string
}

export interface CwSearchBarEmits {
  /** 值更新事件 */
  onChange?: (value: string) => void
  /** 输入事件 */
  onInput?: (value: string) => void
  /** 查询事件 */
  onSearch?: (value: string) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}
