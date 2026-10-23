import type { HTMLAttributes } from 'react'

/** 级联节点值（保持任意值能力，不使用 any） */
export type CwCascaderPanelValue = unknown

export interface CwCascaderPanelOption {
  label: string
  value: CwCascaderPanelValue
  disabled?: boolean
  children?: CwCascaderPanelOption[]
  [key: string]: unknown
}

export type CwCascaderPanelAppearance = 'popup' | 'sheet'

export interface CwCascaderPanelProps {
  /** 级联数据 */
  options?: CwCascaderPanelOption[]
  /** 当前选中路径（根到叶的 value 数组） */
  value?: CwCascaderPanelValue[]
  disabled?: boolean
  readonly?: boolean
  /** popup：下拉；sheet：底部 Sheet 内容 */
  appearance?: CwCascaderPanelAppearance
  /** 仅 appearance=popup 时影响选项/空态字号与内边距 */
  size?: 'small' | 'medium' | 'large'
  /** 空状态文案 */
  emptyText?: string
  /** 节点 id 前缀（键盘滚动 / aria） */
  idPrefix?: string
  /** 列 max-height（px），用于弹层自适应高度 */
  columnMaxHeight?: number | null
  /** 键盘焦点所在列 */
  activePathIndex?: number
  /** 各列键盘焦点项索引，-1 表示无焦点高亮 */
  activeIndexPerLevel?: number[]
  /** 是否显示键盘焦点高亮 */
  showFocusHighlight?: boolean
  /** 选项可聚焦（Sheet 用） */
  optionTabIndex?: boolean
  /** 值变化（对应 `update:modelValue` + `change`） */
  onChange?: (
    value: CwCascaderPanelValue[],
    option: CwCascaderPanelOption | null,
  ) => void
  /** 选到叶子节点（无 children）时触发，宿主可关弹层/Sheet */
  onComplete?: (
    value: CwCascaderPanelValue[],
    option: CwCascaderPanelOption,
  ) => void
  /** 选项获得键盘焦点（对应 `option-focus`） */
  onOptionFocus?: (levelIndex: number, itemIndex: number) => void
}

/** @internal 库内默认 class 表，业务勿覆盖 */
export interface CwCascaderPanelStyles {
  root: string
  panel: string
  column: string
  /** CwDiv content 等宽留白（列壳无 padding，滚动条贴边） */
  columnContent?: string
  option: string
  optionNormal: string
  optionSelected: string
  optionDisabled: string
  optionHover: string
  optionFocus: string
  /** 键盘焦点落在已选中项上 */
  optionFocusOnSelected: string
  optionContent: string
  optionLabel: string
  optionArrow: string
  empty: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
  emptySizeSmall: string
  emptySizeMedium: string
  emptySizeLarge: string
}

export interface CwCascaderPanelEmits {
  'update:modelValue': [value: CwCascaderPanelValue[]]
  change: [value: CwCascaderPanelValue[], option: CwCascaderPanelOption | null]
  complete: [value: CwCascaderPanelValue[], option: CwCascaderPanelOption]
  'option-focus': [levelIndex: number, itemIndex: number]
}

export interface CwCascaderPanelComponentProps
  extends CwCascaderPanelProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onChange'> {
  className?: string
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwCascaderPanelHandle {
  columns: CwCascaderPanelOption[][]
  nodeId: (levelIndex: number, itemIndex: number) => string
}
