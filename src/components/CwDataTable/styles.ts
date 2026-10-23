import type { CwDataTableStyles, CwDataTableAppearance } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const dataTableBodyCwDivViewportBase =
  'cw-div__viewport relative min-h-0 w-full max-h-full flex-[1_1_0%] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:!hidden [&::-webkit-scrollbar]:!h-0 [&::-webkit-scrollbar]:!w-0'

/**
 * content 布局高度随内容，不用 flex-1 撑满。
 * 原生横条在移动端会常显且比自绘纵条更粗，这里改走 CwDiv，与纵向同一套滑块。
 */
export function getDataTableContentBodyViewportClass(expandFillColumns: boolean): string {
  const overflow = expandFillColumns
    ? '!overflow-x-hidden !overflow-y-hidden'
    : '!overflow-x-auto !overflow-y-hidden'
  return `${dataTableBodyCwDivViewportBase} !h-auto !max-h-none !flex-none ${overflow}`
}

/** 表体 CwDiv 内容层：与表头 scrollContent 宽度策略一致 */
export const dataTableBodyCwDivContentClass =
  'relative block min-w-full w-full shrink-0'

export function getDataTableBodyCwDivViewportClass(expandFillColumns: boolean): string {
  return expandFillColumns
    ? `${dataTableBodyCwDivViewportBase} overflow-x-hidden overflow-y-auto`
    : `${dataTableBodyCwDivViewportBase} overflow-auto`
}

export const dataTableBase: CwDataTableStyles = {
  // 根容器：自带圆角与描边；若页面外层已有卡片描边，可根节点 `class` 覆盖圆角/描边
  root: 'cw-data-table flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] text-sm',

  // 表头：底部分割线画在 header 容器上（含纵向滚动条 padding 占位），避免缩列后右侧断线留白
  header:
    'flex items-stretch min-w-full bg-[var(--bg-color-secondarycontainer)] overflow-x-auto overflow-y-hidden border-b border-[var(--border-color)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
  headerFixed: 'sticky top-0 z-[var(--z-index-sticky)]',
  // 与表体 body 内第一层一致：撑开横向滚动宽度
  /** 列总宽可能超出容器时出现横向滚动；flex-shrink-0：表头是 flex 时勿被压成容器宽，否则左侧 sticky 失效 */
  scrollContent: 'min-w-full w-max flex-shrink-0',
  /** 存在 fill/弹性列时：行宽贴合容器，由弹性列收缩 + truncate 消化剩余 */
  scrollContentFitContainer: 'min-w-full w-full max-w-full',
  // 与表体 row 一致（底边改由 header 容器绘制）
  headerRow: 'group flex min-w-full items-stretch flex-shrink-0',
  // overflow-x-hidden：消除横向 flex 自动最小宽度对内容的依赖；纵向保持 visible 以兼容列 wrap 多行
  // 表格网格用 1px（勿用 hairline 0.5px：白底上常渲染成「没线」）
  headerCell:
    'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-4 py-2 text-xs font-medium text-[var(--text-color-placeholder)] border-r border-[var(--border-color)] flex-shrink-0',
  headerCellNoRightBorder: '!border-r-0',
  /** 折叠表体时去掉表头底部分割线（挂在 header 容器上） */
  headerCellBodyDividerOffWhenCollapsed: '!border-b-0',
  headerCellFixed: 'bg-[var(--bg-color-secondarycontainer)]',
  headerCellResizable: 'relative',
  headerCellContent: 'flex min-w-0 w-full items-center gap-1 truncate',
  /** fitContent 列（如多选）：不 truncate/裁切，避免 Checkbox 外圈聚焦被裁掉 */
  headerCellContentFit: 'flex min-w-0 w-full items-center justify-center gap-1 overflow-visible',
  sortButton: 'inline-flex items-center gap-1 text-xs text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none focus:outline-none',
  sortButtonFocused: INTERACTIVE_FOCUS_CLASS,
  sortIcon: 'inline-flex shrink-0 items-center justify-center text-current',
  // 仅手柄自身 hover / 激活时显示，避免 group-hover 把同列左右柄一起亮起（无过渡，即显即隐）
  resizeHandle:
    'absolute top-0 z-[var(--z-index-sticky)] h-full w-1 touch-none cursor-col-resize opacity-0 hover:opacity-100 hover:bg-[var(--brand-color-6)]',
  resizeHandleEnd: 'right-0',
  resizeHandleStart: 'left-0',
  resizeHandleHover: 'opacity-100 bg-[var(--brand-color-6)]',

  // 表体壳：滚动交给内部 CwDiv viewport，此处不再挂 overflow
  body: 'flex flex-col flex-1 min-h-0 relative',
  row: 'group flex min-w-full items-stretch border-b border-[var(--border-color)] hover:bg-[var(--bg-color-component-hover)] flex-shrink-0',
  rowNoBottomBorder: '!border-b-0',
  cell: 'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-4 py-2 text-sm text-[var(--text-color-primary)] border-r border-[var(--border-color)] flex-shrink-0',
  cellNoRightBorder: '!border-r-0',
  cellFixed: 'bg-[var(--bg-color-container)]',
  cellContent: 'w-full min-w-0 max-w-full overflow-hidden break-words',
  cellContentFit: 'w-full min-w-0 max-w-full overflow-visible p-px',

  // 固定列容器
  fixedLeftHeader: 'bg-[var(--bg-color-secondarycontainer)] z-[var(--z-index-fixed-column-header)] flex items-center',
  fixedRightHeader: 'bg-[var(--bg-color-secondarycontainer)] z-[var(--z-index-fixed-column-header)] flex items-center',
  fixedRightHeaderFirst: 'border-l border-[var(--border-color)]',
  fixedLeftHeaderShadow: 'relative [&::after]:content-[""] [&::after]:absolute [&::after]:right-[-6px] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[0.375rem] [&::after]:bg-gradient-to-r [&::after]:from-[var(--overlay-scrim-table-edge)] [&::after]:via-[var(--overlay-scrim-subtle)] [&::after]:to-transparent [&::after]:pointer-events-none [&::after]:z-[var(--z-index-fixed-column-shadow)]',
  fixedRightHeaderShadow: 'relative [&::after]:content-[""] [&::after]:absolute [&::after]:left-[-6px] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[0.375rem] [&::after]:bg-gradient-to-l [&::after]:from-[var(--overlay-scrim-table-edge)] [&::after]:via-[var(--overlay-scrim-subtle)] [&::after]:to-transparent [&::after]:pointer-events-none [&::after]:z-[var(--z-index-fixed-column-shadow)]',
  fixedLeftBody: 'bg-[var(--bg-color-container)] group-hover:bg-[var(--bg-color-component-hover)] z-[var(--z-index-float)]',
  // 右侧固定列（常为操作栏）：行 hover 时保持容器底色，避免与行内按钮 hover 底色糊在一起
  fixedRightBody:
    'bg-[var(--bg-color-container)] group-hover:bg-[var(--bg-color-container)] z-[var(--z-index-float)]',
  fixedRightBodyFirst: 'border-l border-[var(--border-color)]',
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

  // KEEP CSS grid: 0fr/1fr collapse animation (CwGrid is equal-column flex only).
  bodyCollapseShell:
    'grid min-h-0 flex-1 grid-cols-1 overflow-hidden transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
  bodyCollapseShellOpen: 'grid-rows-[1fr]',
  bodyCollapseShellClosed: 'grid-rows-[0fr]',
  bodyCollapseInner: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',

  treeIndentRoot: 'flex min-w-0 w-full items-center gap-1',
  treeIndentSpacer: 'shrink-0',
  treeIndentContent: 'min-w-0 flex-1 overflow-hidden',
  treeSwitcher:
    'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component)] hover:text-[var(--text-color-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-color-6)]',
  treeSwitcherExpanded: 'transform rotate-0',
  treeSwitcherCollapsed: 'transform -rotate-90',
  treeSwitcherPlaceholder: 'inline-block h-4 w-4 shrink-0',
  treeSwitcherIconStyles: {
    class: 'inline-flex items-center justify-center transition-transform duration-200',
    size: 0.75,
  },
}

/** 无分割线时的样式覆盖 */
export const dataTableBorderlessStyles: Partial<CwDataTableStyles> = {
  root: 'cw-data-table flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-0 bg-[var(--bg-color-container)] text-sm',
  header:
    'flex items-stretch min-w-full bg-[var(--bg-color-secondarycontainer)] overflow-x-auto overflow-y-hidden border-b-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
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
  root: 'cw-data-table flex flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] text-sm',
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
    'flex items-stretch min-w-full bg-transparent overflow-x-auto overflow-y-hidden border-b border-[var(--border-color)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
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

/**
 * Markdown 消息内嵌表格外观。
 * 列宽按内容增长，超出容器时由表头/表体同步横向滚动；
 * 折叠网格子项必须 min-w-0，否则表体被 min-content 撑宽后被外壳裁切，列与表头错位且无法滚动。
 */
export function applyDataTableMarkdownAppearance(
  styles: CwDataTableStyles,
): CwDataTableStyles {
  return {
    ...styles,
    root: 'flex h-auto w-full min-w-0 min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] text-sm',
    header: `${styles.header} max-w-full`,
    body: 'relative flex h-auto w-full min-w-0 flex-none flex-col',
    // KEEP CSS grid: 0fr/1fr collapse animation (CwGrid is equal-column flex only).
    bodyCollapseShell:
      'grid min-h-0 min-w-0 w-full grid-cols-1 overflow-hidden transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
    bodyCollapseInner: 'flex min-h-0 min-w-0 w-full max-w-full flex-col',
    scrollContent: 'min-w-full w-max flex-shrink-0',
    headerRow: 'group flex min-w-full w-max items-stretch flex-shrink-0',
    row: 'group flex min-w-full w-max items-stretch border-b border-[var(--border-color)] hover:bg-[var(--bg-color-component-hover)] flex-shrink-0',
    headerCellContent: 'flex min-w-0 w-full items-center gap-1 whitespace-normal break-words [overflow-wrap:anywhere]',
    headerCellContentFit: 'flex min-w-0 w-full items-center gap-1 whitespace-normal break-words [overflow-wrap:anywhere]',
    cellContent: 'w-full min-w-0 max-w-full whitespace-normal break-words [overflow-wrap:anywhere]',
    cellContentFit: 'w-full min-w-0 max-w-full whitespace-normal break-words [overflow-wrap:anywhere]',
    headerCell: styles.headerCell.replace(/\bpy-2\b/, 'py-1.5'),
    cell: styles.cell.replace(/\bpy-2\b/, 'py-1.5'),
  }
}

export function applyDataTableCloudDiskWorkbenchAppearance(
  styles: CwDataTableStyles,
): CwDataTableStyles {
  return {
    ...styles,
    root: 'cw-data-table flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent text-sm',
    headerCell:
      'flex min-w-0 items-center px-3 py-0 text-xs font-medium text-[var(--text-color-secondary)] shrink-0 min-h-8',
    cell: 'flex min-w-0 items-center px-3 py-0 text-[0.8125rem] shrink-0 min-h-8',
    row: 'group flex min-w-full items-stretch shrink-0 transition-[background-color] duration-100',
    resizeHandle:
      'absolute top-0 z-[var(--z-index-sticky)] h-full w-1 touch-none cursor-col-resize opacity-0 hover:opacity-100 hover:bg-[var(--brand-color-6)]',
    resizeHandleEnd: 'right-0',
    resizeHandleStart: 'left-0',
    resizeHandleHover: 'opacity-100 bg-[var(--brand-color-6)]',
  }
}

export function applyDataTableDevtoolsNetworkAppearance(
  styles: CwDataTableStyles,
): CwDataTableStyles {
  return {
    ...styles,
    root: 'cw-data-table network-table flex min-h-0 flex-1 flex-col overflow-hidden border-[0.5px] border-[var(--border-color)] bg-[var(--data-table-devtools-network-row-odd-bg)] text-xs [&_.cw-data-table-body-scroll_.group:nth-child(even)]:bg-[var(--data-table-devtools-network-row-even-bg)] [&_.cw-data-table-body-scroll_.group:nth-child(odd)]:bg-[var(--data-table-devtools-network-row-odd-bg)]',
    header:
      'flex items-stretch min-w-full overflow-x-auto overflow-y-hidden border-b-[0.5px] border-[var(--border-color)] bg-[var(--data-table-devtools-network-header-bg)] [&::-webkit-scrollbar]:hidden',
    headerRow: 'flex min-w-full items-stretch shrink-0 bg-[var(--data-table-devtools-network-header-bg)]',
    headerCell:
      'flex min-w-0 overflow-x-hidden overflow-y-visible items-center bg-[var(--data-table-devtools-network-header-bg)] px-2.5 py-2 [font-size:0.6875rem] font-medium text-[var(--text-color-secondary)] border-r-[0.5px] border-[var(--border-color)] shrink-0',
    row: 'group flex min-w-full items-stretch border-b-[0.5px] border-[var(--border-color)] hover:!bg-[var(--data-table-devtools-network-row-hover-bg)] shrink-0',
    cell: 'flex min-w-0 overflow-x-hidden overflow-y-visible items-center px-2.5 py-1.5 text-xs text-[var(--text-color-primary)] border-r-[0.5px] border-[var(--border-color)] shrink-0 bg-transparent',
    cellFixed: 'bg-transparent',
    sortButton:
      'inline-flex items-center gap-0.5 [font-size:0.6875rem] text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none',
    sortIcon: 'inline-flex shrink-0 items-center justify-center text-current',
    fixedLeftHeaderShadow: '',
    fixedRightHeaderShadow: '',
    fixedLeftBodyShadow: '',
    fixedRightBodyShadow: '',
    fixedLeftBody: 'bg-transparent group-hover:!bg-[var(--data-table-devtools-network-row-hover-bg)]',
    fixedRightBody: 'bg-transparent group-hover:!bg-[var(--data-table-devtools-network-row-hover-bg)]',
    treeIndentRoot: 'flex min-w-0 w-full items-center gap-0.5',
    treeIndentSpacer: 'hidden shrink-0 !w-0',
    treeSwitcherPlaceholder: 'hidden !w-0 !h-0 shrink-0 overflow-hidden',
  }
}

export function resolveDataTableStyles(
  appearance: CwDataTableAppearance,
  options?: {
    borderless?: boolean
    plainHeader?: boolean
    bodyLayout?: 'fill' | 'content'
  },
): CwDataTableStyles {
  let result = applyDataTablePresentationStyles(dataTableBase, options)
  if (appearance === 'markdown') {
    result = applyDataTableMarkdownAppearance(result)
  }
  if (appearance === 'workbench') {
    result = applyDataTableCloudDiskWorkbenchAppearance(result)
  }
  if (appearance === 'dense-mono') {
    result = applyDataTableDevtoolsNetworkAppearance(result)
  }
  return result
}
