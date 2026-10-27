import type { ComponentType, CSSProperties, ReactNode } from 'react'

import type { CwDataTableTreeRowMeta, CwDataTableSortState, CwDataTableSortConfig, CwDataTableColumnSelectConfig, CwDataTableTreeConfig, CwDataTableAppearance, CwDataTableTexts, CwDataTableColumnBase } from '@zengchaowu/ui-shared/components/CwDataTable/types'
import type { CwDataTableStyles } from '@zengchaowu/ui-shared/components/CwDataTable/types'

/** 表格行数据（列配置按 key 取值） */
export type CwDataTableRow = Record<string, unknown>

/** 单元格渲染上下文 */
export interface CwDataTableCellRenderContext {
  row: CwDataTableRow
  value: unknown
  index: number
  rowIndex: number
  column: CwDataTableColumn
  /** 树形模式下的行元数据 */
  treeMeta?: CwDataTableTreeRowMeta
}

/** 表头渲染上下文 */
export interface CwDataTableHeaderRenderContext {
  column: CwDataTableColumn
  sortState?: CwDataTableSortState
  onSort?: (column: CwDataTableColumn) => void
  isSelected?: boolean
  isHovered?: boolean
}

/** 自定义表头/单元格组件 */
export type CwDataTableComponent = ComponentType<Record<string, unknown>>

/** 列配置（共享字段见 `CwDataTableColumnBase`） */
export interface CwDataTableColumn extends CwDataTableColumnBase {
  /** 自定义表头组件 */
  headerComponent?: CwDataTableComponent
  /** 表头组件 props（函数，接收 column, sortState, onSort） */
  headerProps?: (ctx: CwDataTableHeaderRenderContext) => Record<string, unknown>
  /** 自定义表头渲染函数（优先级高于 headerComponent） */
  headerRender?: (ctx: CwDataTableHeaderRenderContext) => ReactNode
  /** 自定义单元格组件 */
  cellComponent?: CwDataTableComponent
  /** 单元格组件 props（函数，接收 row, value, index, column） */
  cellProps?: (ctx: CwDataTableCellRenderContext) => Record<string, unknown>
  /** 自定义单元格渲染函数（优先级高于 cellComponent） */
  cellRender?: (ctx: CwDataTableCellRenderContext) => ReactNode
}

/** 表格配置 */
export interface CwDataTableConfig {
  /** 列配置数组 */
  columns: CwDataTableColumn[]
  /** 是否显示表头 */
  showHeader?: boolean
  /** 固定表头 */
  fixedHeader?: boolean
  /** 固定左侧列数 */
  fixedLeftColumns?: number
  /** 固定右侧列数 */
  fixedRightColumns?: number
  /** 行高（px），用于虚拟滚动计算 */
  rowHeight?: number
  /**
   * 行数据上的高度字段（px）。
   * 有值时按行累加，不再把每一行都当成 rowHeight。
   */
  rowHeightKey?: string
  /** 是否启用虚拟滚动 */
  virtualScroll?: boolean
  /** 虚拟滚动缓冲区大小（行数） */
  virtualBuffer?: number
  /** 是否启用列宽调整（默认开启；设 false 可整体关闭；单列可设 column.resizable: false） */
  resizable?: boolean
  /**
   * 单元格省略时是否显示完整文案 Tooltip（默认开启）。
   * 单列可用 `column.showOverflowTooltip: false` 关闭。
   */
  showOverflowTooltip?: boolean
  /** 排序配置 */
  sort?: CwDataTableSortConfig
  /** 行唯一键字段名 */
  rowKey?: string
  /**
   * 行级属性（class / data-* / 事件等），用于整行点击、右键菜单等交互。
   * 返回的对象会透传到行容器上。
   */
  rowAttrs?: (row: any, rowIndex: number) => Record<string, any>
  /** 列选中配置 */
  columnSelect?: CwDataTableColumnSelectConfig
  /**
   * 是否在布局完成后从表体首行测量列宽并写入内部 columnWidths，使表头与表体列宽像素一致。
   * 默认 true；若自行管理列宽且不希望覆盖，可设为 false。
   */
  syncColumnWidthsFromBody?: boolean
  /**
   * 首帧假定列宽可吃满容器（expandFillColumns 初始为 true）。
   * 避免弹性列在测量完成前以 width:auto 塌缩；测量后仍会按内容切换为横向滚动。
   */
  defaultExpandFillColumns?: boolean
  /**
   * fitContent 列：单列内容基线有上限（过长换行）。
   * 基线之和不超过容器时按比例铺满，超出时横向滚动。
   */
  stretchFitColumnsToContainer?: boolean
  /** 无行/列分割线（适合嵌入文件列表等轻量场景） */
  borderless?: boolean
  /** 表头无背景色（透明，与表体一致） */
  plainHeader?: boolean
  /** 树形表格配置 */
  tree?: CwDataTableTreeConfig
  /**
   * 表体高度策略（默认 fill）：
   * - fill：占满父级 flex 区域，表体内滚动（列表页）
   * - content：按行数撑开，由页面外层滚动（滚动页内嵌表格）
   */
  bodyLayout?: 'fill' | 'content'
  /** 内容溢出时滚动条保持可见。默认只在滚动、拖动或悬停时出现。 */
  persistScrollbar?: boolean
}

/** 生命周期钩子 */
export interface CwDataTableLifecycle {
  /** 行渲染前钩子 */
  onBeforeRowRender?: (row: CwDataTableRow, index: number) => void | Promise<void>
  /** 行渲染后钩子 */
  onAfterRowRender?: (row: CwDataTableRow, index: number) => void | Promise<void>
  /** 单元格渲染前钩子 */
  onBeforeCellRender?: (
    row: CwDataTableRow,
    column: CwDataTableColumn,
    value: unknown,
    index: number,
  ) => void | Promise<void>
  /** 单元格渲染后钩子 */
  onAfterCellRender?: (
    row: CwDataTableRow,
    column: CwDataTableColumn,
    value: unknown,
    index: number,
  ) => void | Promise<void>
}

/** Props */
export interface CwDataTableProps {
  /** 表格配置 */
  config: CwDataTableConfig
  /** 行数据 */
  modelValue: CwDataTableRow[]
  /**
   * 点击表头行折叠/展开表体（与 bodyExpanded 联用）；无表头时不生效。
   * @default false
   */
  collapsibleBody?: boolean
  /** 是否显示加载中 */
  loading?: boolean
  /** 生命周期钩子 */
  lifecycle?: CwDataTableLifecycle
  /** 场景外观 */
  appearance?: CwDataTableAppearance
  /** 自定义文案 */
  texts?: Partial<CwDataTableTexts>
  /** v-model:body-expanded */
  bodyExpanded?: boolean
  /** v-model:expanded-keys */
  expandedKeys?: Array<string | number>
}

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwDataTableEmits {
  /** 折叠表体的展开状态（collapsibleBody 时有效） */
  onUpdateBodyExpanded?: (value: boolean) => void
  /** 行数据变化事件 */
  onUpdateModelValue?: (value: CwDataTableRow[]) => void
  /** 排序变化事件 */
  onUpdateSort?: (sort: CwDataTableSortConfig) => void
  onSortChange?: (state?: CwDataTableSortState) => void
  /** 拖动列宽的过程。松手后还会再发 columnResize。 */
  onColumnResizing?: (column: CwDataTableColumn, width: number) => void
  /** 列宽变化事件 */
  onColumnResize?: (column: CwDataTableColumn, width: number) => void
  /** 滚动事件 */
  onScroll?: (scrollTop: number, scrollLeft: number) => void
  /** 列选中变化事件 */
  onUpdateColumnSelect?: (columnKey: string | undefined) => void
  onColumnSelectChange?: (column: CwDataTableColumn | undefined) => void
  /** 树形展开 keys（受控） */
  onUpdateExpandedKeys?: (value: Array<string | number>) => void
  /** 树形展开状态变化 */
  onTreeExpandChange?: (expandedKeys: Array<string | number>) => void
}

/** external-row 作用域插槽参数 */
export interface CwDataTableExternalRowScope {
  visibleColumns: CwDataTableColumn[]
  columnWidths: Record<string, number>
  scrollLeft: number
  getColumnStyle: (column: CwDataTableColumn) => CSSProperties
  getBodyCellClasses: (column: CwDataTableColumn) => string[]
  getExternalCellStyle: (column: CwDataTableColumn) => CSSProperties
  leftFixedOverlaps: boolean
  rightFixedOverlaps: boolean
  styles: CwDataTableStyles
  columnSelectEnabled: boolean
  isColumnSelected: (column: CwDataTableColumn) => boolean
  isColumnHovered: (column: CwDataTableColumn) => boolean
  handleColumnSelect: (column: CwDataTableColumn) => void
  handleColumnMouseEnter: (column: CwDataTableColumn) => void
  handleColumnMouseLeave: () => void
}

/** 插槽（具名插槽转 React slot props；作用域插槽为 render prop） */
export interface CwDataTableSlots {
  /** 默认无插槽 */
  externalRowSlot?: (scope: CwDataTableExternalRowScope) => ReactNode
  headerOverlaySlot?: ReactNode
  bodyOverlaySlot?: ReactNode
  emptySlot?: ReactNode
  loadingSlot?: ReactNode
}

/** defineExpose 暴露的实例 API */
export interface CwDataTableHandle {
  visibleColumns: CwDataTableColumn[]
  columnWidths: Record<string, number>
  scrollLeft: number
  scrollTop: number
  getColumnStyle: (column: CwDataTableColumn) => CSSProperties
  getBodyCellClasses: (column: CwDataTableColumn) => string[]
  leftFixedOverlaps: boolean
  rightFixedOverlaps: boolean
  styles: CwDataTableStyles
  headerRef: HTMLElement | null
  bodyRef: HTMLElement | null
  requestSyncColumnWidthsFromBody: () => void
}
