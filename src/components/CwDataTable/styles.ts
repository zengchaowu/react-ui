import type { CwDataTableStyles } from './types'
import type { CwDivStyles } from '../CwDiv/types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

const dataTableBodyCwDivViewportBase =
  'cw-div__viewport relative min-h-0 w-full max-h-full flex-[1_1_0%] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden'

/** 表体 CwDiv：在 flex 列布局中占满剩余高度，避免 viewport 高度塌缩为 0 */
export const dataTableBodyCwDivStyles: Partial<CwDivStyles> = {
  root: 'cw-div cw-data-table-body-scroll relative flex min-h-0 min-w-0 w-full h-full flex-1 flex-col !overflow-hidden',
  viewport: `${dataTableBodyCwDivViewportBase} overflow-auto`,
  content: 'cw-div__content relative block min-w-full w-full',
}

export function getDataTableBodyCwDivStyles(expandFillColumns: boolean): Partial<CwDivStyles> {
  return {
    ...dataTableBodyCwDivStyles,
    viewport: expandFillColumns
      ? `${dataTableBodyCwDivViewportBase} overflow-x-hidden overflow-y-auto`
      : dataTableBodyCwDivStyles.viewport,
  }
}

export const defaultStyles: CwDataTableStyles = {
  // 根容器：自带圆角与描边；若页面外层已有卡片描边，可通过 :styles=\"{ root: '...' }\" 去掉重复
  root: 'cw-data-table flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--component-border)] bg-[var(--bg-color-container)] text-sm',
  
  // 表头
  header: 'flex items-stretch min-w-full bg-[var(--bg-color-secondarycontainer)] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
  headerFixed: 'sticky top-0 z-[var(--z-index-sticky)]',
  // 与表体 body 内第一层一致：撑开横向滚动宽度
  /** 列总宽可能超出容器时出现横向滚动 */
  scrollContent: 'min-w-full w-max',
  /** 存在 fill/弹性列时：行宽贴合容器，由弹性列收缩 + truncate 消化剩余 */
  scrollContentFitContainer: 'min-w-full w-full max-w-full',
  // 与表体 row 一致（无下边框；表头格自带 border-b）
  headerRow: 'group flex min-w-full items-stretch flex-shrink-0',
  // overflow-x-hidden：消除横向 flex 自动最小宽度对内容的依赖；纵向保持 visible 以兼容列 wrap 多行
  headerCell:
    'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-4 py-2 text-xs font-medium text-[var(--text-color-placeholder)] hairline-border-r border-r-[var(--component-border)] hairline-border-b border-b-[var(--border-color-lighter)] flex-shrink-0',
  headerCellNoRightBorder: 'hairline-border-r-0',
  headerCellBodyDividerOffWhenCollapsed: 'hairline-border-b-0',
  headerCellFixed: 'bg-[var(--bg-color-secondarycontainer)]',
  headerCellResizable: 'relative',
  headerCellContent: 'flex min-w-0 w-full items-center gap-1 truncate',
  /** fitContent 列（如多选）：不 truncate/裁切，避免 Checkbox 外圈聚焦被裁掉 */
  headerCellContentFit: 'flex min-w-0 w-full items-center justify-center gap-1 overflow-visible',
  sortButton: 'inline-flex items-center gap-1 text-xs text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none focus:outline-none',
  sortButtonFocused: INTERACTIVE_FOCUS_CLASS,
  sortIcon: '[font-size:var(--font-size-xs)]',
  resizeHandle: 'absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--brand-color-6)] opacity-0 transition-opacity z-[var(--z-index-sticky)] translate-x-1/2',
  resizeHandleHover: 'opacity-100',
  
  // 表体
  body: 'flex flex-col overflow-auto flex-1 min-h-0 relative',
  row: 'group flex min-w-full items-stretch hairline-border-b border-b-[var(--border-color-lighter)] hover:bg-[var(--bg-color-component-hover)] flex-shrink-0',
  rowNoBottomBorder: 'hairline-border-b-0',
  cell: 'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-4 py-2 text-sm text-[var(--text-color-primary)] hairline-border-r border-r-[var(--border-color-lighter)] flex-shrink-0',
  cellNoRightBorder: 'hairline-border-r-0',
  cellFixed: 'bg-[var(--bg-color-container)]',
  cellContent: 'w-full min-w-0 max-w-full overflow-hidden break-words',
  cellContentFit: 'w-full min-w-0 max-w-full overflow-visible p-px',
  
  // 固定列容器
  fixedLeftHeader: 'bg-[var(--bg-color-secondarycontainer)] z-[var(--z-index-fixed-column-header)] flex items-center',
  fixedRightHeader: 'bg-[var(--bg-color-secondarycontainer)] z-[var(--z-index-fixed-column-header)] flex items-center',
  fixedRightHeaderFirst: 'hairline-border-l border-l-[var(--component-border)]',
  fixedLeftHeaderShadow: 'relative [&::after]:content-[""] [&::after]:absolute [&::after]:right-[-6px] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[0.375rem] [&::after]:bg-gradient-to-r [&::after]:from-[var(--overlay-scrim-table-edge)] [&::after]:via-[var(--overlay-scrim-subtle)] [&::after]:to-transparent [&::after]:pointer-events-none [&::after]:z-[var(--z-index-fixed-column-shadow)]',
  fixedRightHeaderShadow: 'relative [&::after]:content-[""] [&::after]:absolute [&::after]:left-[-6px] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[0.375rem] [&::after]:bg-gradient-to-l [&::after]:from-[var(--overlay-scrim-table-edge)] [&::after]:via-[var(--overlay-scrim-subtle)] [&::after]:to-transparent [&::after]:pointer-events-none [&::after]:z-[var(--z-index-fixed-column-shadow)]',
  fixedLeftBody: 'bg-[var(--bg-color-container)] group-hover:bg-[var(--bg-color-component-hover)] z-[var(--z-index-float)]',
  // 右侧固定列（常为操作栏）：行 hover 时保持容器底色，避免与行内按钮 hover 底色糊在一起
  fixedRightBody:
    'bg-[var(--bg-color-container)] group-hover:bg-[var(--bg-color-container)] z-[var(--z-index-float)]',
  fixedRightBodyFirst: 'hairline-border-l border-l-[var(--border-color-lighter)]',
  fixedLeftBodyShadow: 'relative [&::after]:content-[""] [&::after]:absolute [&::after]:right-[-6px] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[0.375rem] [&::after]:bg-gradient-to-r [&::after]:from-[var(--overlay-scrim-table-edge)] [&::after]:via-[var(--overlay-scrim-subtle)] [&::after]:to-transparent [&::after]:pointer-events-none [&::after]:z-[var(--z-index-fixed-column-header)]',
  fixedRightBodyShadow: 'relative [&::after]:content-[""] [&::after]:absolute [&::after]:left-[-6px] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[0.375rem] [&::after]:bg-gradient-to-l [&::after]:from-[var(--overlay-scrim-table-edge)] [&::after]:via-[var(--overlay-scrim-subtle)] [&::after]:to-transparent [&::after]:pointer-events-none [&::after]:z-[var(--z-index-fixed-column-header)]',
  
  // 虚拟滚动占位
  placeholder: 'flex-shrink-0',
  
  // 空状态
  empty: 'absolute inset-0 flex items-center justify-center',
  emptyContent: 'text-center',
  emptyText: 'text-sm text-[var(--text-color-placeholder)]',
  
  // 加载状态
  loading: 'absolute inset-0 flex items-center justify-center',
  loadingContent: 'flex items-center gap-2',
  loadingText: 'text-sm text-[var(--text-color-placeholder)]',
  
  // 列选中状态
  headerCellSelected:
    'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,var(--bg-color-container))]',
  cellSelected:
    'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,var(--bg-color-container))]',
  // 列 hover 状态（仅在列选中模式下）
  headerCellHovered: 'bg-[var(--bg-color-component)]',
  cellHovered: 'bg-[var(--bg-color-component)]',

  bodyCollapseShell:
    'grid min-h-0 flex-1 overflow-hidden transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
  bodyCollapseShellOpen: 'grid-rows-[1fr]',
  bodyCollapseShellClosed: 'grid-rows-[0fr]',
  bodyCollapseInner: 'flex min-h-0 flex-1 flex-col overflow-hidden',

  treeIndentRoot: 'flex min-w-0 w-full items-center gap-1',
  treeIndentSpacer: 'shrink-0',
  treeIndentContent: 'min-w-0 flex-1 overflow-hidden',
  treeSwitcher:
    'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component)] hover:text-[var(--text-color-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-color-6)]',
  treeSwitcherExpanded: 'transform rotate-0',
  treeSwitcherCollapsed: 'transform -rotate-90',
  treeSwitcherPlaceholder: 'inline-block h-4 w-4 shrink-0',
  treeSwitcherIconStyles: {
    root: 'inline-flex items-center justify-center transition-transform duration-200',
    size: 0.75,
  },
}

/** 无分割线时的样式覆盖 */
export const dataTableBorderlessStyles: Partial<CwDataTableStyles> = {
  root: 'cw-data-table flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-0 bg-[var(--bg-color-container)] text-sm',
  headerCell:
    'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-4 py-2 text-xs font-medium text-[var(--text-color-placeholder)] flex-shrink-0',
  headerCellNoRightBorder: '',
  cell: 'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-4 py-2 text-sm text-[var(--text-color-primary)] flex-shrink-0',
  cellNoRightBorder: '',
  row: 'group flex min-w-full items-stretch hover:bg-[var(--bg-color-component-hover)] flex-shrink-0',
  fixedRightHeaderFirst: '',
  fixedRightBodyFirst: '',
}

/** 表体按内容撑开：不占用 flex-1，无表体内纵向滚动 */
export const dataTableContentLayoutStyles: Partial<CwDataTableStyles> = {
  root: 'cw-data-table flex flex-col rounded-lg border border-[var(--component-border)] bg-[var(--bg-color-container)] text-sm',
  body: 'flex flex-col relative shrink-0',
  empty: 'flex items-center justify-center py-8',
  loading: 'flex items-center justify-center py-8',
}

/** 无分割线 + content 布局根节点 */
export const dataTableBorderlessContentRoot =
  'cw-data-table flex flex-col rounded-lg border-0 bg-[var(--bg-color-container)] text-sm'

/** 表头透明背景 */
export const dataTablePlainHeaderStyles: Partial<CwDataTableStyles> = {
  header:
    'flex items-stretch min-w-full bg-transparent overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
  headerCellFixed: 'bg-transparent',
  fixedLeftHeader:
    'bg-transparent z-[var(--z-index-fixed-column-header)] flex items-center',
  fixedRightHeader:
    'bg-transparent z-[var(--z-index-fixed-column-header)] flex items-center',
}

export function applyDataTablePresentationStyles(
  styles: CwDataTableStyles,
  options?: {
    borderless?: boolean
    plainHeader?: boolean
    bodyLayout?: 'fill' | 'content'
  },
): CwDataTableStyles {
  let result = { ...styles }
  if (options?.bodyLayout === 'content') {
    result = { ...result, ...dataTableContentLayoutStyles }
  }
  if (options?.borderless) {
    const borderlessPartial = { ...dataTableBorderlessStyles }
    if (options?.bodyLayout === 'content') {
      borderlessPartial.root = dataTableBorderlessContentRoot
    }
    result = { ...result, ...borderlessPartial }
  }
  if (options?.plainHeader) {
    result = { ...result, ...dataTablePlainHeaderStyles }
  }
  return result
}
