import type { HTMLAttributes } from 'react'
import type { CwCenterRulerPickerValue, CwCenterRulerPickerTexts } from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/types'

export interface CwCenterRulerPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'> {
  /** 当前选中值，须落在 options 或 min～max 范围内（Vue `modelValue`） */
  value: CwCenterRulerPickerValue
  /** 刻度选项（有序）；与 min/max 二选一，options 优先 */
  options?: readonly CwCenterRulerPickerValue[]
  /** 数值刻度最小值（与 max 搭配，step 默认 1） */
  min?: number
  /** 数值刻度最大值 */
  max?: number
  /** 数值刻度步进 */
  step?: number
  /** 禁用 */
  disabled?: boolean
  /** 只读：可聚焦但不改变值 */
  readonly?: boolean
  /** 每个刻度占位宽度（rem） */
  tickWidthRem?: number
  /**
   * 刻度数字显示间隔（每 N 个刻度显示一次标签）。
   * 未设置时按刻度数量自动稀疏，避免重叠。
   */
  labelInterval?: number
  /** 自定义展示文案（aria 等）；默认 `String(value)` */
  formatValue?: (value: CwCenterRulerPickerValue) => string
  /** 刻度行标签；默认与 formatValue 相同，可传更短文案（如不含单位） */
  formatTickLabel?: (value: CwCenterRulerPickerValue) => string
  /** 覆盖 texts */
  texts?: Partial<CwCenterRulerPickerTexts>
  className?: string
  /** 值变化（合并 Vue `update:modelValue` 与 `change`） */
  onChange?: (value: CwCenterRulerPickerValue) => void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwCenterRulerPickerEmits {
  'update:modelValue': [value: CwCenterRulerPickerValue]
  change: [value: CwCenterRulerPickerValue]
}
