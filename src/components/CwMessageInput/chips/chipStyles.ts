/** 芯片外层：与 @人 一致留少量水平间距，w-fit 避免右侧无背景空白 */
const INLINE_CHIP_OUTER_WRAP_CLASS =
  'inline-flex w-fit max-w-full cursor-text items-center px-0.5'

/**
 * 文字型 chip（文件 / @人）与正文同一行对齐。
 *
 * 不能按「行盒」居中：同一行内只要有更高的内联元素（内联图片 clip 高 20~40px），
 * 行盒就会被撑高，此时所有以行盒顶/底为基准的写法（`align-top` + 按 `1lh` 算出的
 * margin 等）都会失准——实测 chip 被钉在行盒顶部，比正文高 6.6px。
 *
 * 改用 `text-bottom`：把 chip 底边对齐到正文内容区底边（基线下方 descent 处）。该基准
 * 只跟字体度量有关、与行盒高度无关，行盒被撑高也不会失准。实测 chip 中心比正文中线高
 * 0.5px（原来是偏高 6.6px）。
 */
const INLINE_TEXT_CHIP_CENTER_CLASS = 'align-text-bottom leading-[inherit]'

/**
 * 编辑器内联 chip 触发包裹（搭配 `<CwTooltip appearance="inline" />` + `cursor-text`）。
 * 文件 clip 经 {@link CwTooltip} 触发器继承文本光标；@人 需同样包裹，避免 NodeView 上呈手型指针。
 */
export const INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS =
  'inline-flex w-auto max-w-full min-w-0 shrink-0 cursor-text align-middle'

/**
 * React 专用：`@tiptap/react` 的 `ReactNodeViewRenderer` 会在 NodeView 外多包一层
 * `.react-renderer`（Vue 无此层）。真正参与行内对齐的是这一层——内层 wrap 是 flex 项，
 * 它身上的 `vertical-align` 会被忽略，所以对齐必须写在这里。
 *
 * 用 `text-bottom`（底边对齐正文内容区底边，与行盒高度无关）。不要用默认的 baseline：
 * 对「只含替换元素」的链（emoji = inline-flex > inline-flex > img，无文本）浏览器合成出的
 * 基线会落在盒子底边下方，实测把 emoji 抬高 17.75px 并把行盒从 22.75px 撑到 41.375px。
 * `items-center` 同理——基线对齐是上面那个问题的成因，这里不参与布局。
 */
export const INLINE_CHIP_REACT_RENDERER_CLASS =
  'inline-flex items-center align-text-bottom leading-[inherit]'

/** React 专用：图片 chip 高度可变（20~40px），沿用原 baseline 居中，不做按行高计算的偏移 */
export const INLINE_IMAGE_CHIP_REACT_RENDERER_CLASS =
  'inline-flex items-center align-middle leading-none'

/** 文件芯片外层（与编辑器 NodeViewWrapper 一致） */
export const FILE_CHIP_WRAP_CLASS = [
  'cw-file-ref-wrap',
  INLINE_CHIP_OUTER_WRAP_CLASS,
  INLINE_TEXT_CHIP_CENTER_CLASS,
  '[&.ProseMirror-selectednode_.cw-file-ref]:bg-[var(--rich-editor-chip-active-bg)]',
].join(' ')

/** @某人 外层 */
export const USER_MENTION_WRAP_CLASS = [
  'cw-im-mention-wrap',
  INLINE_CHIP_OUTER_WRAP_CLASS,
  INLINE_TEXT_CHIP_CENTER_CLASS,
  '[&.ProseMirror-selectednode_.cw-im-mention]:bg-[var(--rich-editor-chip-active-bg)]',
].join(' ')

/** emoji 选中态：背景色与文本 ::selection 一致，只作用在外层 wrap，不改 img 透明度 */
const EMOJI_WRAP_SELECTED_CLASSES =
  '[&.ProseMirror-selectednode]:bg-[var(--rich-editor-chip-selection-bg)]'

/** emoji 原子节点外层（与 {@link EmojiNode} NodeViewWrapper / renderHTML 一致） */
export const EMOJI_WRAP_CLASS = [
  'cw-emoji-wrap',
  /** 用 flex 行内盒避免 `inline-block` 行盒在 img 下留白（与文件芯片外层思路一致） */
  /** 与文字型 chip 同理：底边对齐正文内容区底边（Vue 侧该元素即行内盒，React 侧由 .react-renderer 决定） */
  'inline-flex items-center align-text-bottom leading-[inherit]',
  EMOJI_WRAP_SELECTED_CLASSES,
].join(' ')

/** 消息气泡只读 emoji 外层（与 wire format {@link IM_RICH_EMOJI_WRAP_CLASS} 一致） */
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

/** 行内芯片图标尺寸：与芯片 `text-xs` 字号同 em 盒 */
export const INLINE_CHIP_ICON_EM_CLASS = 'h-[1em] w-[1em]'

/** 前导图标外层（文件图标 / 占位） */
export const INLINE_CHIP_LEADING_WRAP_CLASS = [
  'cw-inline-chip-leading',
  'inline-flex shrink-0 items-center justify-center overflow-hidden leading-none',
  INLINE_CHIP_ICON_EM_CLASS,
].join(' ')

/** 内层共用布局与主题（文件 / @某人 内层根均使用） */
export const INLINE_CHIP_LAYOUT_CLASS =
  'inline-flex w-fit min-w-0 max-w-[min(100%,var(--size-chip-inline-max))] cursor-text flex-nowrap items-center gap-1.5 overflow-hidden rounded py-1 px-1.5 text-xs font-medium leading-none text-[var(--brand-color-6)] bg-[var(--rich-editor-inline-chip-bg)] select-none'

/** 消息气泡只读 clip：允许随正文划选并显示 ::selection（整颗高亮见 tokens.css） */
export const READONLY_BUBBLE_CHIP_LAYOUT_CLASS =
  'inline-flex w-fit min-w-0 max-w-[min(100%,var(--size-chip-inline-max))] cursor-text flex-nowrap items-center gap-1.5 overflow-hidden rounded py-1 px-1.5 text-xs font-medium leading-none text-[var(--brand-color-6)] bg-[var(--rich-editor-inline-chip-bg)] select-text'

/** 图片 clip 外层（选中态样式作用在内层 .cw-inline-image-clip） */
export const IMAGE_CHIP_WRAP_CLASS = [
  'cw-inline-image-wrap',
  INLINE_CHIP_OUTER_WRAP_CLASS,
  /** 图片高度可变（20~40px），保留 baseline 居中，不套用按行高计算的偏移 */
  'align-middle leading-none',
  /** 图片铺满内层，改 bg 不可见；选中态用半透明蒙层（无边框） */
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:pointer-events-none',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:absolute',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:inset-0',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:z-[var(--z-index-above)]',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:rounded-[inherit]',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:bg-[var(--rich-editor-chip-selection-bg)]',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:opacity-80',
  '[&.ProseMirror-selectednode_.cw-inline-image-clip]:after:content-[""]',
].join(' ')

/** 内联图片 clip 最大宽度（Tailwind `max-w-20` = 80px） */
export const IMAGE_CHIP_MAX_WIDTH_CLASS = 'max-w-20'

/** 图片 clip 内层：无边框，内嵌 {@link CwImageFit} */
export const IMAGE_CHIP_INNER_CLASS = [
  'cw-inline-image-clip',
  'relative inline-flex cursor-text items-center overflow-hidden rounded select-none align-middle',
].join(' ')

/** 消息气泡只读内联图 clip（wire attrs 与 `.cw-inline-image-clip` 同节点） */
export const READONLY_BUBBLE_INLINE_IMAGE_CHIP_CLASS = [
  'cw-inline-image-clip',
  'relative mx-0.5 inline-flex cursor-text items-center overflow-hidden rounded select-text align-middle',
].join(' ')

/** 行内图片 clip：{@link CwImageFit} bounded 宽高限制（设计稿 px，CwImageFit 内部转 CSS px） */
export const IMAGE_CLIP_BOUNDS_MAX_WIDTH = 80
export const IMAGE_CLIP_BOUNDS_MAX_HEIGHT = 40
export const IMAGE_CLIP_BOUNDS_MIN_HEIGHT = 20

/** 文件：内层根（含 `cw-file-ref`，供 parseHTML / field 样式钩子） */
export const FILE_CHIP_INNER_CLASS = `cw-file-ref ${INLINE_CHIP_LAYOUT_CLASS}`

/** 消息气泡只读文件 clip 内层 */
export const READONLY_BUBBLE_FILE_CHIP_INNER_CLASS = `cw-file-ref ${READONLY_BUBBLE_CHIP_LAYOUT_CLASS}`

/** 消息气泡只读 @mention clip 内层 */
export const READONLY_BUBBLE_MENTION_CHIP_INNER_CLASS = `cw-im-mention ${READONLY_BUBBLE_CHIP_LAYOUT_CLASS}`

/** 文件引用文件名区最大宽度（与 {@link FILE_CHIP_LABEL_MAX_WIDTH_CLASS} 一致） */
export const FILE_CHIP_LABEL_MAX_WIDTH = '11.25rem'

/** 文件引用文件名区最大宽度 */
export const FILE_CHIP_LABEL_MAX_WIDTH_CLASS = `max-w-[${FILE_CHIP_LABEL_MAX_WIDTH}]`

/** 文件引用标签（parseHTML / renderHTML；展示用 CwTruncateText appearance=`chipLabel`） */
export const FILE_CHIP_LABEL_CLASS = [
  'cw-file-ref-label cw-inline-chip-label min-w-0 shrink',
  FILE_CHIP_LABEL_MAX_WIDTH_CLASS,
].join(' ')

/** @人：内层根（含 `cw-im-mention`） */
export const USER_MENTION_INNER_CLASS = `cw-im-mention ${INLINE_CHIP_LAYOUT_CLASS}`

/** @人 chip 触发区 hover（消息内 @ 文本；与文件 clip 一致用文本光标） */
export const USER_MENTION_CHIP_HOVER_WRAP_CLASS = [
  INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS,
  'rounded transition-colors duration-150',
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]',
].join(' ')

/** 通用：前导图标 img */
export const INLINE_CHIP_ICON_IMG_CLASS =
  `cw-inline-chip-icon cw-inline-chip-icon-img shrink-0 object-contain align-middle ${INLINE_CHIP_ICON_EM_CLASS}`

/** 通用：前导图占位（无 URL 时） */
export const INLINE_CHIP_ICON_FALLBACK_CLASS =
  `cw-inline-chip-icon cw-inline-chip-icon-fallback shrink-0 inline-flex items-center justify-center leading-none ${INLINE_CHIP_ICON_EM_CLASS}`

/** 通用：关闭按钮（编辑器内芯片等 `<button>`） */
export const INLINE_CHIP_CLOSE_BTN_CLASS =
  'cw-inline-chip-close shrink-0 inline-flex cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)] hover:text-[var(--brand-color-6)] text-xs leading-none disabled:pointer-events-none disabled:opacity-50'

/** 通用：关闭图标容器（文件引用芯片内，非 button） */
export const INLINE_CHIP_CLOSE_ICON_CLASS = [
  'cw-inline-chip-close cw-inline-chip-close-icon shrink-0 inline-flex cursor-pointer items-center justify-center rounded text-[var(--text-color-secondary)] hover:text-[var(--brand-color-6)] leading-none',
  INLINE_CHIP_ICON_EM_CLASS,
].join(' ')

/** {@link CwIcon} 关闭图标：1em；`size: 0` 取消组件默认 16px 内联宽高 */
export const INLINE_CHIP_CLOSE_ICON_CW_ICON_STYLES = {
  size: 0,
  class: 'inline-flex h-[1em] w-[1em] min-h-0 min-w-0 items-center justify-center text-current',
  asset: 'text-[1em] leading-none text-inherit',
} as const
