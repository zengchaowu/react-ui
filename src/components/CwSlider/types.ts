import type { HTMLAttributes } from 'react'
import type { CwSliderTexts } from '@zengchaowu/ui-shared/components/CwSlider/types'

export interface CwSliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Vue `v-model` */
  value?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readonly?: boolean
  /** 滑块尺寸 */
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwSliderTexts>
  /** Vue `update:modelValue` / `change` 事件 */
  onChange?: (value: number) => void
}

export interface CwSliderEmits {
  onChange?: (value: number) => void
}
