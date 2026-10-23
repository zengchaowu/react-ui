import { useEffect, useRef, useState } from 'react'
import type { CwMarkdownCodeBlock as CwMarkdownCodeBlockNode } from '../types'
import { useCwMarkdownContext } from '../context'
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
