import type { HTMLAttributes } from 'react'
import type { CwSegmentOption, CwSegmentAppearance, CwSegmentTexts } from '@zengchaowu/ui-shared/components/CwSegment/types'

export interface CwSegmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** 当前选中值（Vue `modelValue`） */
  value?: string | number
  /** 选项列表 */
  options: CwSegmentOption[] | string[]
  /** 是否禁用整组 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 场景外观（如 DevTools 侧栏密集布局） */
  appearance?: CwSegmentAppearance
  texts?: Partial<CwSegmentTexts>
  className?: string
  /** 选中值变化（Vue `update:modelValue` / `change`） */
  onChange?: (value: string | number) => void
}

export interface CwSegmentEmits {
  onChange?: (value: string | number) => void
}
