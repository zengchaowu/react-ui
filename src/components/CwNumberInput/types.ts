import type { HTMLAttributes } from 'react'
import type {
  CwInputAppearance,
  CwInputSlotContent,
  CwInputTexts,
} from '../CwInput/types'

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

export interface CwNumberInputStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  icon: string
  iconNormal: string
  iconDisabled: string
  label: string
  labelNormal: string
  labelDisabled: string
  inputMain: string
  inputMainAlignLeft: string
  inputMainAlignRight: string
  inputMainAlignCenter: string
  inputMainPadStart: string
  inputWithDisplayPrefix: string
  inputWrapper: string
  inputWrapperNormal: string
  inputWrapperReadonly: string
  inputWrapperFocus: string
  inputWrapperDisabled: string
  input: string
  inputNormal: string
  inputDisabled: string
  inputReadonly: string
  inputLeft: string
  inputRight: string
  inputCenter: string
  suffix: string
  clearButton: string
  clearButtonOverlay?: string
  clearButtonVisible?: string
  clearButtonHidden?: string
  inputClearReserve?: string
  inputClearReserveCompact?: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
  clearIconClass?: string
  clearIconStyles?: { class?: string; size?: number; root?: string }
}

export interface CwNumberInputTexts extends CwInputTexts {}
