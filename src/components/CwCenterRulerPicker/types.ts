export type CwCenterRulerPickerValue = number | string

export interface CwCenterRulerPickerProps {
  /** 当前选中值，须落在 options 或 min～max 范围内 */
  modelValue: CwCenterRulerPickerValue
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
  /** 覆盖 styles */
  styles?: Partial<CwCenterRulerPickerStyles>
  /** 覆盖 texts */
  texts?: Partial<CwCenterRulerPickerTexts>
}

export interface CwCenterRulerPickerStyles {
  root: string
  rootDisabled: string
  rootReadonly: string
  viewport: string
  viewportFocused: string
  centerIndicator: string
  track: string
  trackDragging: string
  trackIdle: string
  tick: string
  tickMark: string
  tickLabel: string
  tickLabelHidden: string
  tickLabelActive: string
  tickLabelInactive: string
}

export interface CwCenterRulerPickerTexts {
  ariaLabel: string
}

export interface CwCenterRulerPickerEmits {
  'update:modelValue': [value: CwCenterRulerPickerValue]
  change: [value: CwCenterRulerPickerValue]
}
