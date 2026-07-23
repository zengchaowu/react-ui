import {
  APP_OVERLAY_SAFE_BOTTOM_CLASS,
  APP_OVERLAY_SAFE_RIGHT_CLASS,
} from './appSafeAreaClasses'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS, INTERACTIVE_FOCUS_CLASS } from '../utils/focusStyles'

/** Electron 无边框窗口：避免被 CwWindowTitleBar 的 app-region:drag 挡住点击 */
export const CW_OVERLAY_ELECTRON_NO_DRAG_CLASS =
  '[-webkit-app-region:no-drag] [app-region:no-drag]'

/**
 * CwDynamicDialog / CwDynamicSheet 顶栏容器（与 Sheet 一致：pt-3 pb-2 px-4，无固定 h-11 / dialog 专用底纹）
 */
export const CW_OVERLAY_HEADER_BAR_CLASS =
  'relative shrink-0 flex items-center justify-between pt-3 pb-2 px-4'

/**
 * 顶栏标题文案（与关闭钮对齐，右侧 pr-10 留白）
 */
export const CW_OVERLAY_HEADER_TITLE_CLASS =
  '[font-size:var(--chat-conversation-title-font-size)] leading-snug text-[var(--text-color-primary)] pr-10'

/** 置于 dialog/sheet header 弹性行内时可截断 */
export const CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS = [
  'min-w-0 flex-1 truncate text-left leading-snug',
  CW_OVERLAY_HEADER_TITLE_CLASS,
].join(' ')

/** CwDynamicDialog body 基础（水平留白；纵向 pt/pb 由 Inner 按 header 叠加） */
export const CW_OVERLAY_DIALOG_BODY_BASE_CLASS =
  'box-border min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4'

/** Dialog / Sheet 主内容区无默认内边距（由 slot 自行管理 px/py） */
export const CW_OVERLAY_CONTENT_BODY_NO_PADDING_CLASS =
  'box-border min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-0'

/**
 * 无内边距 + 不参与外层滚动（内容区自行 flex/overflow，避免与 CwDiv 内层滚动叠加）
 */
export const CW_OVERLAY_CONTENT_BODY_NO_PADDING_FLEX_CLASS =
  'box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0'

/** Dialog body 内底部按钮行（body 已有 px-4；与主内容用 flex gap 分隔） */
export const CW_OVERLAY_DIALOG_FOOTER_ROW_CLASS =
  'flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-3'

/**
 * 浮层图标关闭钮（Dialog / 全屏预览等）：仅图标 secondary→primary，无 hover 背景。
 * 须写在 CwButton `root` 上并用 ! 覆盖 variant=text 自带的 hover/active 底与字色。
 */
export const CW_OVERLAY_ICON_CLOSE_BUTTON_COLOR_CLASS = [
  '!text-[var(--text-color-secondary)]',
  'hover:!bg-transparent hover:!text-[var(--text-color-primary)]',
  'active:!bg-transparent active:!text-[var(--text-color-primary)]',
  'data-[keyboard-active=true]:!bg-transparent data-[keyboard-active=true]:!text-[var(--text-color-primary)]',
].join(' ')

export const CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS =
  INTERACTIVE_FOCUS_CLASS

const CW_OVERLAY_ICON_CLOSE_BUTTON_ROOT_BASE_CLASS = [
  'inline-flex items-center justify-center rounded-full cursor-pointer select-none',
  'border-0 !bg-transparent p-0 transition-colors',
  `outline-none focus:outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  'touch-manipulation',
  CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  CW_OVERLAY_ICON_CLOSE_BUTTON_COLOR_CLASS,
].join(' ')

const CW_OVERLAY_ICON_CLOSE_BUTTON_DIMENSION_CLASS = [
  '!h-[var(--size-overlay-icon)] !w-[var(--size-overlay-icon)]',
  '!min-h-[var(--size-overlay-icon)] !min-w-[var(--size-overlay-icon)]',
  '!max-h-[var(--size-overlay-icon)] !max-w-[var(--size-overlay-icon)]',
  '!p-0',
].join(' ')

/** Dialog / Sheet 顶栏内关闭钮（18px，hover 仅图标变色） */
export const CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS = [
  CW_OVERLAY_ICON_CLOSE_BUTTON_ROOT_BASE_CLASS,
  'absolute top-2 right-2 z-[var(--z-index-above-high)]',
  CW_OVERLAY_ICON_CLOSE_BUTTON_DIMENSION_CLASS,
].join(' ')

/**
 * 全屏图库 / 附件预览等无顶栏独立关闭钮：尺寸与 Sheet 顶栏一致，
 * 位置对齐 Sheet 顶栏关闭钮视觉（pt-3+top-2、px-4+right-2 → top-5 right-6）。
 */
export const CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS = [
  CW_OVERLAY_ICON_CLOSE_BUTTON_ROOT_BASE_CLASS,
  'absolute top-5 right-6 z-[var(--z-index-above-high)]',
  CW_OVERLAY_ICON_CLOSE_BUTTON_DIMENSION_CLASS,
].join(' ')

/** 全屏预览关闭钮左侧的下载等操作钮 */
export const CW_OVERLAY_PREVIEW_DOWNLOAD_BUTTON_ROOT_CLASS = [
  CW_OVERLAY_ICON_CLOSE_BUTTON_ROOT_BASE_CLASS,
  'absolute top-5 right-14 z-[var(--z-index-above-high)]',
  CW_OVERLAY_ICON_CLOSE_BUTTON_DIMENSION_CLASS,
].join(' ')

/** CwDynamicSheet body（有/无顶栏） */
export const CW_OVERLAY_SHEET_BODY_WITH_HEADER_CLASS =
  'flex-1 min-h-0 min-w-0 overflow-y-auto px-4 pt-2 pb-4'

export const CW_OVERLAY_SHEET_BODY_WITHOUT_HEADER_CLASS =
  'flex-1 min-h-0 min-w-0 overflow-y-auto p-4'

/** 右侧设置类面板（原 CwDrawer 375px 场景，统一走 CwDynamicSheet direction:right） */
export const CW_OVERLAY_RIGHT_PANEL_SHEET_STYLES = {
  contentRight: [
    `h-full flex-col w-[var(--size-overlay-panel)] max-w-[min(var(--size-overlay-panel),90vw)] ${APP_OVERLAY_SAFE_RIGHT_CLASS}`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  body: 'flex flex-1 flex-col min-h-0 overflow-hidden p-0',
} as const

/** 自底部弹出的全屏 Sheet（覆盖默认 max-h-[90vh]） */
export const CW_OVERLAY_FULLSCREEN_SHEET_STYLES = {
  contentBottom: [
    `w-full flex-col h-[100dvh] max-h-[100dvh] min-h-0 ${APP_OVERLAY_SAFE_BOTTOM_CLASS}`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  body: 'box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0',
} as const
