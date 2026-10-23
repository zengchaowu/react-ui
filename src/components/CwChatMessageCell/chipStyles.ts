/** 只读气泡内联 chip 样式（移植自 vue-ui `CwMessageInput/chips/chipStyles.ts` 中本组件用到的常量） */

/** 编辑器内联 chip 触发包裹（文件 clip / @人 hover 容器） */
export const INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS =
  'inline-flex w-auto max-w-full min-w-0 shrink-0 cursor-text align-middle'

/** 消息气泡只读 emoji 外层（与 wire format `IM_RICH_EMOJI_WRAP_CLASS` 一致） */
export const READONLY_BUBBLE_EMOJI_WRAP_CLASS = [
  'cw-emoji-wrap',
  'relative inline-block h-[1.25em] w-[1.25em] select-text align-middle leading-none',
].join(' ')

/** 气泡只读 emoji：保留 Unicode 字形作选区锚点（仅 img 时无法从 emoji 起手拖选） */
export const READONLY_BUBBLE_EMOJI_GLYPH_CLASS = [
  'cw-emoji-glyph',
  'inline-block h-[1.25em] w-[1.25em] select-text overflow-hidden leading-none text-[1.25em] text-transparent',
  '[&::selection]:bg-[var(--rich-editor-chip-selection-bg)]',
].join(' ')

/** 气泡只读 emoji 展示图：叠在字形上（不改变 pointer） */
export const READONLY_BUBBLE_EMOJI_OVERLAY_IMG_CLASS =
  'absolute inset-0 block h-full w-full max-h-full max-w-full object-contain [-webkit-user-drag:none]'

/** 消息气泡内 emoji PNG 懒加载预读边距（IntersectionObserver rootMargin） */
export const CHAT_MESSAGE_EMOJI_VIEWPORT_ROOT_MARGIN = '0px'

/** 消息气泡只读 clip 内层共用布局 */
export const READONLY_BUBBLE_CHIP_LAYOUT_CLASS =
  'inline-flex w-fit min-w-0 max-w-[min(100%,var(--size-chip-inline-max))] cursor-text flex-nowrap items-center gap-1.5 overflow-hidden rounded py-1 px-1.5 text-xs font-medium leading-none text-[var(--brand-color-6)] bg-[var(--rich-editor-inline-chip-bg)] select-text'

/** 消息气泡只读文件 clip 内层 */
export const READONLY_BUBBLE_FILE_CHIP_INNER_CLASS = `cw-file-ref ${READONLY_BUBBLE_CHIP_LAYOUT_CLASS}`

/** 消息气泡只读 @mention clip 内层 */
export const READONLY_BUBBLE_MENTION_CHIP_INNER_CLASS = `cw-im-mention ${READONLY_BUBBLE_CHIP_LAYOUT_CLASS}`

/** 消息气泡只读内联图 clip（wire attrs 与 `.cw-inline-image-clip` 同节点） */
export const READONLY_BUBBLE_INLINE_IMAGE_CHIP_CLASS = [
  'cw-inline-image-clip',
  'relative mx-0.5 inline-flex cursor-text items-center overflow-hidden rounded select-text align-middle',
].join(' ')

/** 行内图片 clip：`CwImageFit` bounded 宽高限制（设计稿 px） */
export const IMAGE_CLIP_BOUNDS_MAX_WIDTH = 80
export const IMAGE_CLIP_BOUNDS_MAX_HEIGHT = 40
export const IMAGE_CLIP_BOUNDS_MIN_HEIGHT = 20

/** 前导图标外层（文件图标） */
export const INLINE_CHIP_LEADING_WRAP_CLASS =
  'cw-inline-chip-leading inline-flex shrink-0 items-center justify-center overflow-hidden leading-none h-[1em] w-[1em]'

/** @人 chip 触发区 hover（消息内 @ 文本；与文件 clip 一致用文本光标） */
export const USER_MENTION_CHIP_HOVER_WRAP_CLASS = [
  INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS,
  'rounded transition-colors duration-150',
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]',
].join(' ')
