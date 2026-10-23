import { useEffect, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import type { CwMarkdownCodeBlock as CwMarkdownCodeBlockNode } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwIcon } from '../../CwIcon'
import {
  escapeMarkdownCodeHtml,
  highlightMarkdownCode,
} from '../functions/highlightMarkdownCode'
import { CwMarkdownCodeBlockFrame } from './CwMarkdownCodeBlockFrame'
import './cw-markdown-code-highlight.css'

export interface CwMarkdownCodeBlockProps {
  block: CwMarkdownCodeBlockNode
}

export function CwMarkdownCodeBlock({ block }: CwMarkdownCodeBlockProps) {
  const ctx = useCwMarkdownContext()
  const [highlightedHtml, setHighlightedHtml] = useState(() =>
    escapeMarkdownCodeHtml(block.code),
  )
  const highlightSeqRef = useRef(0)

  const normalizedLanguage = (block.language ?? '').trim().toLowerCase()
  const previewable =
    Boolean(normalizedLanguage) &&
    ctx.codeBlockPreviewLanguages.includes(normalizedLanguage)

  function onPreview(
    event: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>,
  ) {
    if (!block.code) return
    ctx.onCodeBlockPreview({
      code: block.code,
      language: normalizedLanguage || undefined,
      event: event as ReactMouseEvent<HTMLElement>,
    })
  }

  useEffect(() => {
    const seq = ++highlightSeqRef.current
    let cancelled = false

    highlightMarkdownCode(block.code, block.language).then((html) => {
      if (cancelled || seq !== highlightSeqRef.current) return
      setHighlightedHtml(html)
    })

    return () => {
      cancelled = true
    }
  }, [block.code, block.language])

  return (
    <CwMarkdownCodeBlockFrame
      languageLabel={block.language}
      copyText={block.code}
      defaultExpanded={ctx.codeBlockDefaultExpanded}
      actions={
        previewable ? (
          <div
            role="button"
            tabIndex={0}
            data-cw-md-code-action
            className={ctx.styles.codeBlockCopyBtn}
            aria-label={ctx.texts.codeBlockPreviewAriaLabel}
            onClick={(event) => {
              event.stopPropagation()
              onPreview(event)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              event.stopPropagation()
              onPreview(event)
            }}
          >
            <CwIcon
              name="common--media--play-line"
              prefix="icon"
              size={0.75}
            />
          </div>
        ) : null
      }
    >
      <div className={ctx.styles.codeBlockInner}>
        <pre className="m-0 whitespace-pre-wrap break-words font-inherit">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </CwMarkdownCodeBlockFrame>
  )
}

export default CwMarkdownCodeBlock
