import { useContext } from 'react'
import { resolveImMentionDisplayLabel } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import type { InlineImMentionNode } from '../types'
import { CwMarkdownContext } from '../context'

export interface CwMarkdownInlineMentionProps {
  node: InlineImMentionNode
}

export function CwMarkdownInlineMention({ node }: CwMarkdownInlineMentionProps) {
  const ctx = useContext(CwMarkdownContext)

  const id = node.userId.trim()
  const resolved = ctx?.mentionLabelResolver?.(id)?.trim()
  const displayLabel = resolveImMentionDisplayLabel(id, node.label, resolved)

  return <span className="font-medium text-[var(--brand-color-6)]">@{displayLabel}</span>
}

export default CwMarkdownInlineMention
