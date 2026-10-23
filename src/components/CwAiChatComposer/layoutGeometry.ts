import {
  COMPOSER_LINE_HEIGHT_REM,
  COMPOSER_SHELL_PAD_Y_REM,
  COMPOSER_TOOLBAR_GAP_REM,
} from './constants'

export const COMPOSER_SHELL_PAD_X_REM = 0.75
/** 桌面 wide：略宽于窄屏 IM 条 */
export const COMPOSER_WIDE_SHELL_PAD_X_REM = 0.875
export const COMPOSER_WIDE_SHELL_PAD_Y_REM = 0.75
export const COMPOSER_BTN_REM = 1.75
export const COMPOSER_LAYOUT_TRANSITION_MS = 200

/** im：语音左、附件+发送右；desktop：语音+附件左、发送右 */
export type ComposerToolbarVariant = 'im' | 'desktop'

export interface ComposerAbsoluteRect {
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: string
  height?: string
  minHeight?: string
  maxHeight?: string
}

export interface ComposerLayoutGeometry {
  shellHeightRem: number
  editor: ComposerAbsoluteRect
  voice: ComposerAbsoluteRect | null
  /** desktop 时独立定位；im 时为 null（附件在 actions 内） */
  attach: ComposerAbsoluteRect | null
  actions: ComposerAbsoluteRect
}

export interface ComputeComposerLayoutGeometryOptions {
  mode: 'inline' | 'stacked'
  visualRows: number
  showVoice: boolean
  showAttach: boolean
  showSend: boolean
  shellPadXRem?: number
  shellPadYRem?: number
  /** 覆盖默认 1.75rem 工具栏按钮高度 */
  btnRem?: number
  /** 单行时编辑区铺满行高（移动端微信式触控区） */
  expandEditorToRow?: boolean
  /** actions 槽宽由内部 flex 子项撑开（发送槽展开时把附件挤向左侧） */
  actionsAutoWidth?: boolean
  /** 移动端：右侧为「发送」文字按钮（宽于图标 +） */
  sendActionActive?: boolean
  sendBtnRem?: number
  toolbarVariant?: ComposerToolbarVariant
}

function resolveBtnRem(options: ComputeComposerLayoutGeometryOptions): number {
  return options.btnRem ?? COMPOSER_BTN_REM
}

function resolveShellPad(options: ComputeComposerLayoutGeometryOptions) {
  return {
    x: options.shellPadXRem ?? COMPOSER_SHELL_PAD_X_REM,
    y: options.shellPadYRem ?? COMPOSER_SHELL_PAD_Y_REM,
  }
}

function resolveToolbarVariant(
  options: ComputeComposerLayoutGeometryOptions,
): ComposerToolbarVariant {
  return options.toolbarVariant ?? 'im'
}

/** stacked 编辑区 bottom 偏移，为 gap + 按钮 + 底 padding 预留 */
function stackedEditorBottomRem(padYRem: number, btnRem: number): number {
  return padYRem + btnRem + COMPOSER_TOOLBAR_GAP_REM
}

function rem(value: number): string {
  return `${value}rem`
}

function btnClusterWidthRem(count: number, btnRem: number): number {
  if (count <= 0) return 0
  return count * btnRem + (count - 1) * COMPOSER_TOOLBAR_GAP_REM
}

function sendWidthRem(
  options: ComputeComposerLayoutGeometryOptions,
  btnRem: number,
): number {
  if (
    options.sendActionActive &&
    options.sendBtnRem != null &&
    options.sendBtnRem > btnRem
  ) {
    return options.sendBtnRem
  }
  return btnRem
}

function resolveChromePlan(
  options: ComputeComposerLayoutGeometryOptions,
  btnRem: number,
) {
  const variant = resolveToolbarVariant(options)
  const attachInStart = variant === 'desktop' && options.showAttach
  const attachInActions = variant === 'im' && options.showAttach
  const startCount = (options.showVoice ? 1 : 0) + (attachInStart ? 1 : 0)
  const startWidthRem = btnClusterWidthRem(startCount, btnRem)

  let actionsWidthRem = 0
  let actionsCount = 0
  if (attachInActions) {
    actionsWidthRem += btnRem
    actionsCount += 1
  }
  if (options.showSend) {
    if (actionsCount > 0) actionsWidthRem += COMPOSER_TOOLBAR_GAP_REM
    actionsWidthRem += sendWidthRem(options, btnRem)
    actionsCount += 1
  }

  return {
    variant,
    attachInStart,
    attachInActions,
    startWidthRem,
    actionsWidthRem,
  }
}

function buildVoiceRect(
  pad: { x: number; y: number },
  btnRem: number,
  showVoice: boolean,
): ComposerAbsoluteRect | null {
  if (!showVoice) return null
  return {
    bottom: rem(pad.y),
    left: rem(pad.x),
    width: rem(btnRem),
    height: rem(btnRem),
  }
}

function buildAttachStartRect(
  pad: { x: number; y: number },
  btnRem: number,
  showVoice: boolean,
  attachInStart: boolean,
): ComposerAbsoluteRect | null {
  if (!attachInStart) return null
  const leftRem = pad.x + (showVoice ? btnRem + COMPOSER_TOOLBAR_GAP_REM : 0)
  return {
    bottom: rem(pad.y),
    left: rem(leftRem),
    width: rem(btnRem),
    height: rem(btnRem),
  }
}

function buildActionsRect(
  pad: { x: number; y: number },
  btnRem: number,
  actionsWidthRem: number,
  actionsAutoWidth?: boolean,
): ComposerAbsoluteRect {
  const base: ComposerAbsoluteRect = {
    bottom: rem(pad.y),
    right: rem(pad.x),
    height: rem(btnRem),
  }
  if (actionsAutoWidth) return base
  return {
    ...base,
    width: actionsWidthRem > 0 ? rem(actionsWidthRem) : rem(btnRem),
  }
}

function buildChromeRects(
  options: ComputeComposerLayoutGeometryOptions,
  pad: { x: number; y: number },
  btnRem: number,
) {
  const plan = resolveChromePlan(options, btnRem)
  return {
    plan,
    voice: buildVoiceRect(pad, btnRem, options.showVoice),
    attach: buildAttachStartRect(
      pad,
      btnRem,
      options.showVoice,
      plan.attachInStart,
    ),
    actions: buildActionsRect(
      pad,
      btnRem,
      plan.actionsWidthRem,
      options.actionsAutoWidth,
    ),
  }
}

function computeInlineGeometry(
  options: ComputeComposerLayoutGeometryOptions,
): ComposerLayoutGeometry {
  const pad = resolveShellPad(options)
  const btnRem = resolveBtnRem(options)
  const rowHeightRem = Math.max(COMPOSER_LINE_HEIGHT_REM, btnRem)
  const { plan, voice, attach, actions } = buildChromeRects(
    options,
    pad,
    btnRem,
  )
  const editorLeftRem =
    pad.x +
    (plan.startWidthRem > 0 ? plan.startWidthRem + COMPOSER_TOOLBAR_GAP_REM : 0)
  const editorRightRem =
    pad.x +
    (plan.actionsWidthRem > 0
      ? plan.actionsWidthRem + COMPOSER_TOOLBAR_GAP_REM
      : 0)
  const editorHeightRem = options.expandEditorToRow
    ? rowHeightRem
    : COMPOSER_LINE_HEIGHT_REM
  const editorTopRem = options.expandEditorToRow
    ? pad.y
    : pad.y + (rowHeightRem - COMPOSER_LINE_HEIGHT_REM) / 2
  const shellHeightRem = pad.y * 2 + rowHeightRem

  return {
    shellHeightRem,
    editor: {
      top: rem(editorTopRem),
      left: rem(editorLeftRem),
      right: rem(editorRightRem),
      height: rem(editorHeightRem),
    },
    voice,
    attach,
    actions,
  }
}

/**
 * 移动端微信式：编辑区在中间列增高，左右按钮贴壳底对齐（不另起一行工具栏）。
 */
function computeInlineGrowGeometry(
  options: ComputeComposerLayoutGeometryOptions,
): ComposerLayoutGeometry {
  const pad = resolveShellPad(options)
  const btnRem = resolveBtnRem(options)
  const rows = Math.max(1, options.visualRows)
  const rowHeightRem = Math.max(COMPOSER_LINE_HEIGHT_REM, btnRem)
  const editorHeightRem = Math.max(COMPOSER_LINE_HEIGHT_REM * rows, rowHeightRem)
  const { plan, voice, attach, actions } = buildChromeRects(
    options,
    pad,
    btnRem,
  )
  const editorLeftRem =
    pad.x +
    (plan.startWidthRem > 0 ? plan.startWidthRem + COMPOSER_TOOLBAR_GAP_REM : 0)
  const editorRightRem =
    pad.x +
    (plan.actionsWidthRem > 0
      ? plan.actionsWidthRem + COMPOSER_TOOLBAR_GAP_REM
      : 0)
  const shellHeightRem = pad.y * 2 + editorHeightRem

  return {
    shellHeightRem,
    editor: {
      top: rem(pad.y),
      left: rem(editorLeftRem),
      right: rem(editorRightRem),
      height: rem(editorHeightRem),
    },
    voice,
    attach,
    actions,
  }
}

function computeStackedGeometry(
  options: ComputeComposerLayoutGeometryOptions,
): ComposerLayoutGeometry {
  const pad = resolveShellPad(options)
  const btnRem = resolveBtnRem(options)
  const rows = Math.max(1, options.visualRows)
  const editorHeightRem = COMPOSER_LINE_HEIGHT_REM * rows
  const { voice, attach, actions } = buildChromeRects(options, pad, btnRem)
  const toolbarReserveRem = stackedEditorBottomRem(pad.y, btnRem)
  const shellHeightRem = pad.y + editorHeightRem + toolbarReserveRem

  return {
    shellHeightRem,
    editor: {
      top: rem(pad.y),
      left: rem(pad.x),
      right: rem(pad.x),
      height: rem(editorHeightRem),
    },
    voice,
    attach,
    actions,
  }
}

export function computeComposerLayoutGeometry(
  options: ComputeComposerLayoutGeometryOptions,
): ComposerLayoutGeometry {
  if (options.mode === 'stacked') return computeStackedGeometry(options)
  if (options.expandEditorToRow) return computeInlineGrowGeometry(options)
  return computeInlineGeometry(options)
}

const COMPOSER_LAYOUT_TRANSITION = `${COMPOSER_LAYOUT_TRANSITION_MS}ms ease-out`

export const COMPOSER_SHELL_HEIGHT_TRANSITION = `height ${COMPOSER_LAYOUT_TRANSITION}`

/** growFromBottom：编辑区高度瞬时到位，不参与过渡 */
export const COMPOSER_EDITOR_INSTANT_LAYOUT = 'none'

/** growFromBottom：高度不参与过渡，左右宽度随发送按钮出现而动画 */
export const COMPOSER_EDITOR_GROW_FROM_BOTTOM_TRANSITION =
  `left ${COMPOSER_LAYOUT_TRANSITION}, right ${COMPOSER_LAYOUT_TRANSITION}, width ${COMPOSER_LAYOUT_TRANSITION}`

/** growFromBottom：仅横向过渡（不含 top/bottom/height，避免换行时工具栏上飘） */
export const COMPOSER_CHROME_LAYOUT_TRANSITION =
  `left ${COMPOSER_LAYOUT_TRANSITION}, right ${COMPOSER_LAYOUT_TRANSITION}, width ${COMPOSER_LAYOUT_TRANSITION}`

export const COMPOSER_ABSOLUTE_TRANSITION =
  `top ${COMPOSER_LAYOUT_TRANSITION}, left ${COMPOSER_LAYOUT_TRANSITION}, right ${COMPOSER_LAYOUT_TRANSITION}, bottom ${COMPOSER_LAYOUT_TRANSITION}, width ${COMPOSER_LAYOUT_TRANSITION}, height ${COMPOSER_LAYOUT_TRANSITION}`

/** 移动端：仅高度过渡，避免换行时 top 动画导致整框上飘 */
export const COMPOSER_ABSOLUTE_HEIGHT_TRANSITION = `height ${COMPOSER_LAYOUT_TRANSITION}`

/** 移动端：高度 + 右侧发送按钮展开时的 width/right 过渡 */
export const COMPOSER_MOBILE_ABSOLUTE_LAYOUT_TRANSITION =
  `height ${COMPOSER_LAYOUT_TRANSITION}, right ${COMPOSER_LAYOUT_TRANSITION}, width ${COMPOSER_LAYOUT_TRANSITION}`

/** 绝对定位子区域样式（结构兼容 React.CSSProperties） */
export interface ComposerAbsoluteStyle {
  position: 'absolute'
  boxSizing: 'border-box'
  transition: string
  top: string
  left: string
  right: string
  bottom: string
  width: string
  height: string
  minHeight: string
  maxHeight: string
}

export function toAbsoluteStyle(
  rect: ComposerAbsoluteRect,
  transition: string = COMPOSER_ABSOLUTE_TRANSITION,
): ComposerAbsoluteStyle {
  return {
    position: 'absolute',
    boxSizing: 'border-box',
    transition,
    top: rect.top ?? 'auto',
    left: rect.left ?? 'auto',
    right: rect.right ?? 'auto',
    bottom: rect.bottom ?? 'auto',
    width: rect.width ?? 'auto',
    height: rect.height ?? 'auto',
    minHeight: rect.minHeight ?? 'auto',
    maxHeight: rect.maxHeight ?? 'none',
  }
}
