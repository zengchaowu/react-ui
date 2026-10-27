import type { HTMLAttributes } from 'react'
import type { CwProgressDirection, CwProgressTexts } from '@zengchaowu/ui-shared/components/CwProgress/types'

export interface CwProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'size'> {
  /** Vue `v-model` */
  value?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readonly?: boolean
  /** 默认纵向，适合温度等紧凑参数条 */
  direction?: CwProgressDirection
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwProgressTexts>
  /** Vue `update:modelValue` / `change` 事件 */
  onChange?: (value: number) => void
}

export interface CwProgressEmits {
  onChange?: (value: number) => void
}
