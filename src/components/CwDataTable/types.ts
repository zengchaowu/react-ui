import type { ComponentType, CSSProperties, ReactNode } from 'react'
import type { CwIconEmbed } from '../CwIcon/types'

/** 表格行数据（列配置按 key 取值） */
export type CwDataTableRow = Record<string, unknown>

/** 树形行元数据（由 CwDataTable 在拍平树数据时写入 row） */
export interface CwDataTableTreeRowMeta {
  depth: number
  hasChildren: boolean
  expanded: boolean
  rowKey: string | number
}

/** 树形表格配置 */
export interface CwDataTableTreeConfig {
  /** 启用树形表格：modelValue 为带 children 的树，表体按展开状态拍平渲染 */
  enabled?: boolean
  /** 子节点字段名，默认 children */
  childrenKey?: string
  /** 默认展开全部父节点 */
  defaultExpandAll?: boolean
  /** 默认展开的节点 rowKey 列表 */
  defaultExpandedKeys?: Array<string | number>
  /** 缩进与展开按钮所在列 key，默认第一列可见列 */
  indentColumnKey?: string
  /** 每级缩进像素，默认 16 */
  indentSize?: number
}

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

/** 列配置 */
export interface CwDataTableColumn {
  /** 唯一键 */
  key: string
  /** 列标题 */
  title: string
  /** 列宽（px）；不设则参与 flex 分配，或由 fitContent / flex:0 按内容自适应 */
  width?: number
  /** 最小列宽（px） */
  minWidth?: number
  /** 最大列宽（px） */
  maxWidth?: number
  /**
   * 填满表格剩余宽度（与右侧/左侧固定列搭配时尤其有用）。
   * 设为 true 时列参与 flex 拉伸，优先级高于 `width` / `maxWidth` 的固定锁宽：
   * - `width` 与 `minWidth` 取较大值作为保底宽，不锁死列宽
   * - `maxWidth` 仅在未吃满剩余宽（需横向滚动）时限制列宽；吃满时由 flex 撑满至操作列前
   * 未设 `width` 的中间列默认也会拉伸，效果相同；`fill: true` 用于在保留 `width` 作保底时显式声明。
   */
  fill?: boolean
  /**
   * 按内容自适应宽度，不参与剩余空间拉伸。
   * 与 `flex: 0`（且无 width）等价；布局稳定后会从表体（及表头）测量并锁定像素宽。
   */
  fitContent?: boolean
  /** 列宽 flex 值，默认 1；设为 0 时等同 fitContent */
  flex?: number
  /** 是否可调整列宽 */
  resizable?: boolean
  /** 是否固定（'left' | 'right'） */
  fixed?: 'left' | 'right'
  /** 固定列索引（用于排序，左侧从0开始，右侧从-1开始递减） */
  fixedIndex?: number
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可见 */
  visible?: boolean
  /** 是否允许单元格内容换行（默认 false，使用 truncate） */
  wrap?: boolean
  /**
   * 内容被省略（…）时悬停是否显示完整文案 Tooltip。
   * 默认跟随表格 `showOverflowTooltip`（表格默认 true）；
   * `wrap` / `fitContent` 列不启用。
   */
  showOverflowTooltip?: boolean
  /** 是否隐藏右侧分割线（默认 false） */
  hideRightBorder?: boolean
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

/** 排序状态 */
export interface CwDataTableSortState {
  key: string
  order: 'asc' | 'desc'
}

/** 排序配置 */
export interface CwDataTableSortConfig {
  /** 当前排序状态（受控） */
  state?: CwDataTableSortState
  /** 默认所有列是否可排序，具体列也可以单独配置 sortable 覆盖 */
  defaultSortable?: boolean
}

/** 列选中配置 */
export interface CwDataTableColumnSelectConfig {
  /** 是否启用列选中模式 */
  enabled?: boolean
  /** 当前选中的列 key（受控） */
  selectedColumnKey?: string
  /** 默认选中的列 key（非受控） */
  defaultSelectedColumnKey?: string
  /** 是否必须选中一列（默认 false，设为 true 时不允许取消选中，且默认选中第一列） */
  required?: boolean
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

/** 表格场景外观 */
export type CwDataTableAppearance = 'default' | 'markdown' | 'workbench' | 'dense-mono'

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

/** @internal */
export interface CwDataTableStyles {
  // 根容器
  root: string

  // 表头（与表体一致：scrollContent 包裹 + 内层 flex 行，避免 w-max 与 flex 同层导致列宽与表体不一致）
  header: string
  headerFixed: string
  scrollContent: string
  /** 存在 fill/弹性中间列时，行宽贴合表格容器（见 columnUtils.hasElasticFillInMiddleSection） */
  scrollContentFitContainer: string
  headerRow: string
  headerCell: string
  headerCellFixed: string
  headerCellResizable: string
  headerCellContent: string
  headerCellContentFit: string
  headerCellNoRightBorder: string
  /** collapsibleBody 且表体已收起：去掉表头与表体之间的下边线，避免「悬空的线」 */
  headerCellBodyDividerOffWhenCollapsed: string
  sortButton: string
  sortButtonFocused: string
  sortIcon: string
  /** 手柄共用（宽、光标、显隐） */
  resizeHandle: string
  /** 分割线左侧：本列右缘 */
  resizeHandleEnd: string
  /** 分割线右侧：本列左缘（拖的是上一列） */
  resizeHandleStart: string
  resizeHandleHover: string

  // 表体
  body: string
  row: string
  rowNoBottomBorder: string
  cell: string
  cellFixed: string
  cellContent: string
  cellContentFit: string
  cellNoRightBorder: string

  // 固定列容器
  fixedLeftHeader: string
  fixedRightHeader: string
  fixedRightHeaderFirst: string
  fixedLeftHeaderShadow: string
  fixedRightHeaderShadow: string
  fixedLeftBody: string
  fixedRightBody: string
  fixedRightBodyFirst: string
  fixedLeftBodyShadow: string
  fixedRightBodyShadow: string

  // 虚拟滚动占位
  placeholder: string

  // 空状态
  empty: string
  emptyContent: string
  emptyText: string

  // 加载状态
  loading: string
  loadingContent: string
  loadingText: string

  // 列选中状态
  headerCellSelected: string
  cellSelected: string
  // 列 hover 状态（仅在列选中模式下）
  headerCellHovered: string
  cellHovered: string

  bodyCollapseShell: string
  bodyCollapseShellOpen: string
  bodyCollapseShellClosed: string
  bodyCollapseInner: string

  treeIndentRoot: string
  treeIndentSpacer: string
  treeIndentContent: string
  treeSwitcher: string
  treeSwitcherExpanded: string
  treeSwitcherCollapsed: string
  treeSwitcherPlaceholder: string
  treeSwitcherIconStyles?: CwIconEmbed
}

/** 文本定义 */
export interface CwDataTableTexts {
  emptyText: string
  loadingText: string
  /** 可折叠表体：表头在表体已收起时表示「展开」 */
  collapseBodyExpandAriaLabel: string
  /** 可折叠表体：表头在表体已展开时表示「收起」 */
  collapseBodyCollapseAriaLabel: string
  /** 树形行：展开子节点 */
  treeExpandAriaLabel: string
  /** 树形行：收起子节点 */
  treeCollapseAriaLabel: string
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
