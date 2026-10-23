import { useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { CwIcon } from '../../CwIcon'
import { useCwMarkdownContext } from '../context'

export interface CwMarkdownCodeBlockFrameProps {
  /** 顶栏语言标签；不传则不展示 */
  languageLabel?: string
  /** 复制按钮写入剪贴板的文本 */
  copyText: string
  /** 初始是否展开正文（默认 true） */
  defaultExpanded?: boolean
  children?: ReactNode
}

export function CwMarkdownCodeBlockFrame({
  languageLabel,
  copyText,
  defaultExpanded = true,
  children,
}: CwMarkdownCodeBlockFrameProps) {
  const ctx = useCwMarkdownContext()
  const [expanded, setExpanded] = useState(defaultExpanded)

  function toggleExpand() {
    setExpanded((value) => !value)
  }

  function onToolbarClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('[data-cw-md-code-copy]')) return
    toggleExpand()
  }

  function onToolbarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggleExpand()
  }

  function onCopyCode(event: MouseEvent<HTMLDivElement>) {
    const text = copyText
    if (!text) return
    ctx.onCodeBlockCopy({ code: text, event })
  }

  return (
    <div className={ctx.styles.codeBlock}>
      <div
        className={[ctx.styles.codeBlockToolbar, expanded ? ctx.styles.codeBlockToolbarDivider : '']
          .filter(Boolean)
          .join(' ')}
        tabIndex={0}
        aria-label={
          expanded
            ? ctx.texts.codeBlockCollapseAriaLabel
            : ctx.texts.codeBlockExpandAriaLabel
        }
        onClick={onToolbarClick}
        onKeyDown={onToolbarKeyDown}
      >
        <span className={ctx.styles.codeBlockToggleBtn} aria-hidden="true">
          <span
            className={[
              'inline-flex transition-transform duration-200 ease-out',
              expanded ? 'rotate-180' : 'rotate-0',
            ].join(' ')}
          >
            <CwIcon
              name="common--dir--arrow-down-line"
              prefix="icon"
              size={0.75}
            />
          </span>
        </span>
        {languageLabel ? (
          <span className={ctx.styles.codeBlockLang}>{languageLabel}</span>
        ) : null}
        <div className="min-w-0 flex-1 self-stretch" aria-hidden="true" />
        <div
          role="button"
          tabIndex={0}
          data-cw-md-code-copy
          className={ctx.styles.codeBlockCopyBtn}
          aria-label={ctx.texts.codeBlockCopyAriaLabel}
          onClick={(event) => {
            event.stopPropagation()
            onCopyCode(event)
          }}
        >
          <CwIcon name="common--action--copy-line" prefix="icon" size={0.75} />
        </div>
      </div>
      <div
        className={[
          ctx.styles.codeBlockExpand,
          expanded
            ? ctx.styles.codeBlockExpandOpen
            : ctx.styles.codeBlockExpandClosed,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={ctx.styles.codeBlockExpandInner}>{children}</div>
      </div>
    </div>
  )
}

export default CwMarkdownCodeBlockFrame
