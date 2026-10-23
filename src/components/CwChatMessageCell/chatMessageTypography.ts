/**
 * 消息列表排版 token（rem，随根字号缩放）。
 */

/** 正文：文本/Markdown 气泡、输入框同级 */
export const chatMessageBodyTextClass =
  '[font-size:var(--font-size-body)] leading-[var(--line-height-composer)] tracking-[var(--letter-spacing-body)]'

/** AI 助手 Markdown 正文（行高/字距对齐 Cursor conversation） */
export const chatMessageAssistantBodyTextClass =
  '[font-size:var(--font-size-body)] leading-[var(--line-height-composer)] tracking-[var(--letter-spacing-body)]'

/** 次级：合并转发预览行、文件副文案等 */
export const chatMessageSecondaryTextClass =
  '[font-size:var(--font-size-caption)] leading-snug'

/** 引用块摘要正文（比正文小一级、更淡） */
export const chatMessageQuoteSnippetTextClass =
  '[font-size:var(--font-size-caption)] leading-snug text-[var(--text-color-placeholder)]'

/** 文件消息文件名（与正文同级） */
export const chatMessageFileNameTextClass =
  '[font-size:var(--font-size-body)] leading-normal'

/** 文件消息副行：大小、上传/下载状态等（比文件名小一级） */
export const chatMessageFileMetaTextClass =
  '[font-size:var(--font-size-caption)] leading-snug'

/** 元信息：发送者昵称、媒体浮层标签等 */
export const chatMessageMetaTextClass =
  '[font-size:var(--font-size-caption)] leading-tight'

/** 消息底部元信息：序号、时间、附件数等（比正文小一级、placeholder 色） */
export const chatMessageFooterMetaTextClass =
  '[font-size:var(--font-size-caption)] leading-tight text-[var(--text-color-placeholder)] tabular-nums'

/** Agent 辅助块标题：Worked / Thought / Explored（与正文同级 14px） */
export const chatAgentAuxiliaryLabelTextClass =
  '[font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]'

/** Agent 辅助块正文（Markdown 气泡 contentTextClass） */
export const chatAgentAuxiliaryBodyTextClass =
  '[font-size:var(--font-size-body)] leading-relaxed text-[var(--text-color-secondary)]'

/** AI 流式回复分段纵向间距（Worked / Markdown 等） */
export const chatAiDisplaySegmentStackClass = 'gap-2'
