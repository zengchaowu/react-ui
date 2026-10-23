/**
 * Markdown 展示组件类型定义
 * 支持流式/不完整内容解析，不依赖完整文档结构
 */

import type {
  ComponentType,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
} from 'react'

export type {
  InlineTextNode,
  InlineBoldNode,
  InlineItalicNode,
  InlineCodeNode,
  InlineLinkNode,
  InlineImageNode,
  InlineImMentionNode,
  CwMarkdownInlineNode,
  CwMarkdownHeadingBlock,
  CwMarkdownParagraphBlock,
  CwMarkdownCodeBlock,
  CwMarkdownBlockquoteBlock,
  CwMarkdownListBlock,
  CwMarkdownHrBlock,
  CwMarkdownTableBlock,
  CwMarkdownBlock,
} from '@zengchaowu/shared/functions/markdown/cwMarkdownAst'

import type {
  CwMarkdownCodeBlock,
  InlineImageNode,
} from '@zengchaowu/shared/functions/markdown/cwMarkdownAst'

/** 样式（仅 class 名称） */
export interface CwMarkdownStyles {
  root: string
  rootNormal: string
  heading: string
  heading1: string
  heading2: string
  heading3: string
  heading4: string
  heading5: string
  heading6: string
  paragraph: string
  codeBlock: string
  /** 代码块顶栏（语言、操作；不含下边线） */
  codeBlockToolbar: string
  /** 展开时顶栏与正文之间的分隔线；收起时不要 */
  codeBlockToolbarDivider: string
  codeBlockLang: string
  /** 顶栏箭头图标占位（小号圆角触控区样式） */
  codeBlockToggleBtn: string
  codeBlockCopyBtn: string
  codeBlockInner: string
  /** 代码块正文折叠容器（grid 0fr/1fr 过渡） */
  codeBlockExpand: string
  codeBlockExpandOpen: string
  codeBlockExpandClosed: string
  /** 展开后正文：限制最大高度，过长在卡片内滚动 */
  codeBlockExpandInner: string
  /** 扩展代码块正文容器（如 Mermaid 图表；由使用方扩展组件使用） */
  codeBlockExtensionBody: string
  blockquote: string
  blockquoteBorder: string
  list: string
  listOrdered: string
  listUnordered: string
  listItem: string
  hr: string
  tableWrapper: string
  table: string
  tableTh: string
  tableTd: string
  /** 行内 */
  inlineText: string
  inlineBold: string
  inlineItalic: string
  inlineCode: string
  link: string
  linkNormal: string
  linkFocused: string
  image: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
}

export interface CwMarkdownTexts {
  linkAriaLabelPrefix: string
  imageAriaLabelPrefix: string
  /** 代码块复制按钮 */
  codeBlockCopyAriaLabel: string
  /** 代码块执行/预览按钮 */
  codeBlockPreviewAriaLabel: string
  /** 代码块展开（当前为收起态） */
  codeBlockExpandAriaLabel: string
  /** 代码块收起（当前为展开态） */
  codeBlockCollapseAriaLabel: string
  /** 表格折叠：表头在表体已收起时可展开 */
  tableBodyExpandAriaLabel: string
  /** 表格折叠：表头在表体已展开时可收起 */
  tableBodyCollapseAriaLabel: string
}

/** 扩展代码块组件接收的 props */
export interface CwMarkdownCodeBlockExtensionProps {
  block: CwMarkdownCodeBlock
}

/** 自定义围栏代码块渲染（如 mermaid、chart 等非标准 Markdown） */
export interface CwMarkdownCodeBlockExtension {
  /** 是否匹配该围栏语言标签；先注册者优先 */
  match: (language: string | undefined) => boolean
  /** 自定义渲染组件，需接受 `block` prop */
  component: ComponentType<CwMarkdownCodeBlockExtensionProps>
}

/** 扩展内联图片组件接收的 props */
export interface CwMarkdownInlineImageExtensionProps {
  node: InlineImageNode
}

/** 自定义 `![](url)` 渲染（如将视频 URL 渲染为播放器） */
export interface CwMarkdownInlineImageExtension {
  /** 是否匹配该图片节点；先注册者优先 */
  match: (node: InlineImageNode) => boolean
  /** 自定义渲染组件，需接受 `node` prop */
  component: ComponentType<CwMarkdownInlineImageExtensionProps>
}

export interface CwMarkdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'children'> {
  /** Markdown 源文本，支持不完整/流式内容 */
  content?: string
  /** 将 userId 解析为展示昵称；与 `CwChatMessageText` 一致 */
  mentionLabelResolver?: (userId: string) => string
  /** 是否禁用（影响链接等交互） */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /**
   * 覆盖正文/行内字号 tier（small/medium/large 共用同一 class，用于聊天气泡等场景）
   */
  contentTextClass?: string
  /** 覆盖 h4 标题 class（可选） */
  heading4Class?: string
  /** 自定义文本 */
  texts?: Partial<CwMarkdownTexts>
  /**
   * 自定义围栏代码块渲染扩展；与 `CwMarkdownCodeBlockExtensionsContext` 合并，prop 在后（优先级更高）。
   * 典型用法：注入 mermaid 等扩展；未注入时仅展示源码块。
   */
  codeBlockExtensions?: CwMarkdownCodeBlockExtension[]
  /**
   * 自定义内联图片渲染扩展；与 `CwMarkdownInlineImageExtensionsContext` 合并，prop 在后（优先级更高）。
   * 典型用法：将 `![](*.mp4)` 渲染为视频播放器；未注入时仍为图片。
   */
  inlineImageExtensions?: CwMarkdownInlineImageExtension[]
  /** 围栏代码块初始是否展开（默认 true） */
  codeBlockDefaultExpanded?: boolean
  /**
   * 可执行/预览的围栏语言列表（不区分大小写，如 ['html']）。
   * 命中时在代码块顶栏展示操作按钮并抛出 `code-block-preview`；默认空，保持通用。
   */
  codeBlockPreviewLanguages?: string[]
  /** 链接点击（等价 Vue `@link-click`） */
  onLinkClick?: (href: string, event: ReactMouseEvent<HTMLElement>) => void
  /**
   * 内联图点击（等价 Vue `@image-click`）。
   * documentImageIndex：与 collectMarkdownImageSrcsInParseOrder 顺序一致，用于预览从点击张开始
   */
  onImageClick?: (
    src: string,
    event: ReactMouseEvent<HTMLElement>,
    documentImageIndex: number,
  ) => void
  /** Markdown 内联图右键（等价 Vue `@image-contextmenu`） */
  onImageContextMenu?: (payload: CwMarkdownImageContextMenuPayload) => void
  /** 用户点击代码块复制（等价 Vue `@code-block-copy`）；剪贴板写入由外部处理 */
  onCodeBlockCopy?: (payload: CwMarkdownCodeBlockCopyPayload) => void
  /** 用户点击代码块执行/预览（等价 Vue `@code-block-preview`）；iframe 渲染等由外部处理 */
  onCodeBlockPreview?: (payload: CwMarkdownCodeBlockPreviewPayload) => void
}

export interface CwMarkdownCodeBlockCopyPayload {
  /** 代码块原始文本 */
  code: string
  /** 点击事件，便于写剪贴板或阻止冒泡 */
  event: ReactMouseEvent<HTMLElement>
}

export interface CwMarkdownCodeBlockPreviewPayload {
  /** 代码块原始文本 */
  code: string
  /** 围栏语言标签（已归一化为小写） */
  language?: string
  /** 点击事件，便于阻止冒泡 */
  event: ReactMouseEvent<HTMLElement>
}

export interface CwMarkdownImageContextMenuPayload {
  src: string
  alt?: string
  title?: string
  /** 与 image-click / collectMarkdownImageSrcsInParseOrder 一致 */
  documentImageIndex: number
  /** 原生右键事件；使用方处理复制等逻辑时可 preventDefault / stopPropagation */
  event: ReactMouseEvent<HTMLElement>
}

/** 等价 Vue `CwMarkdownEmits` 的事件签名（React 侧对应 `onXxx` 回调 props） */
export interface CwMarkdownEmits {
  (e: 'link-click', href: string, event: ReactMouseEvent<HTMLElement>): void
  (
    e: 'image-click',
    src: string,
    event: ReactMouseEvent<HTMLElement>,
    documentImageIndex: number,
  ): void
  (e: 'image-contextmenu', payload: CwMarkdownImageContextMenuPayload): void
  (e: 'code-block-copy', payload: CwMarkdownCodeBlockCopyPayload): void
  (e: 'code-block-preview', payload: CwMarkdownCodeBlockPreviewPayload): void
}

/** 供子组件消费的上下文 */
export interface CwMarkdownContextValue {
  styles: CwMarkdownStyles
  texts: CwMarkdownTexts
  disabled: boolean
  readonly: boolean
  size: 'small' | 'medium' | 'large'
  mentionLabelResolver?: (userId: string) => string
  onLinkClick: (href: string, event: ReactMouseEvent<HTMLElement>) => void
  /** documentImageIndex：在点击时由 [data-cw-markdown-root] 内 `img` 的 DOM 顺序得到，与 collect 一致且不受组件复用影响 */
  onImageClick: (
    src: string,
    event: ReactMouseEvent<HTMLElement>,
    documentImageIndex: number,
  ) => void
  onImageContextMenu: (payload: CwMarkdownImageContextMenuPayload) => void
  onCodeBlockCopy: (payload: CwMarkdownCodeBlockCopyPayload) => void
  onCodeBlockPreview: (payload: CwMarkdownCodeBlockPreviewPayload) => void
  codeBlockPreviewLanguages: string[]
  codeBlockExtensions: CwMarkdownCodeBlockExtension[]
  inlineImageExtensions: CwMarkdownInlineImageExtension[]
  /** 围栏代码块初始是否展开 */
  codeBlockDefaultExpanded: boolean
}

/** 渲染前对 Markdown 源文本做规范化（如 HTML `<video>` → `![](url)`） */
export type CwMarkdownContentPreprocessor = (content: string) => string
