import type { HTMLAttributes } from 'react'
import type { CwInputSlotContent } from '../CwInput/types'
import type { CwInputAppearance } from '@zengchaowu/ui-shared/components/CwInput/types'
import type { CwNumberInputTexts } from '@zengchaowu/ui-shared/components/CwNumberInput/types'

export interface CwNumberInputProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'onChange' | 'onInput' | 'onFocus' | 'onBlur'
  > {
  /** 输入框的值（Vue `modelValue`） */
  value?: number | string
  /** 输入框占位符 */
  placeholder?: string
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步进值 */
  step?: number
  /** 是否允许小数 */
  allowDecimal?: boolean
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
  /** 文本对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 官方外观（场景皮肤，与 CwInput 共用） */
  appearance?: CwInputAppearance
  texts?: Partial<CwNumberInputTexts>
  /** 图标插槽 */
  iconSlot?: CwInputSlotContent
  /** 清除按钮插槽 */
  clearSlot?: CwInputSlotContent
  /** 后缀插槽 */
  suffixSlot?: CwInputSlotContent
  className?: string
  /** 值更新（合并 Vue `update:modelValue` 与 `change`） */
  onChange?: (value: number | string) => void
  /** 输入事件（Vue `input`） */
  onInput?: (value: number | string) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
  /** 清除事件 */
  onClear?: () => void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwNumberInputEmits {
  /** 值更新事件 */
  'update:modelValue': [value: number | string]
  /** 输入事件 */
  'input': [value: number | string]
  /** 变化事件 */
  'change': [value: number | string]
  /** 聚焦事件 */
  'focus': [event: FocusEvent]
  /** 失焦事件 */
  'blur': [event: FocusEvent]
  /** 清除事件 */
  'clear': []
}
