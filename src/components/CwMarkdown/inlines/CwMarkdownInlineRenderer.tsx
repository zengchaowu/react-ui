import { resolveImMentionDisplayLabel } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import type { CwMarkdownInlineNode } from '../types'
import { CwMarkdownInlineText } from './CwMarkdownInlineText'
import { CwMarkdownInlineBold } from './CwMarkdownInlineBold'
import { CwMarkdownInlineItalic } from './CwMarkdownInlineItalic'
import { CwMarkdownInlineCode } from './CwMarkdownInlineCode'
import { CwMarkdownInlineLink } from './CwMarkdownInlineLink'
import { CwMarkdownInlineImage } from './CwMarkdownInlineImage'
import { CwMarkdownInlineMention } from './CwMarkdownInlineMention'

export interface CwMarkdownInlineRendererProps {
  nodes: CwMarkdownInlineNode[]
}

function getFallbackText(n: CwMarkdownInlineNode): string {
  if (n.type === 'text') return n.value
  if (n.type === 'code') return n.value
  if (n.type === 'image') return n.alt || n.src
  if (n.type === 'imMention') {
    return `@${resolveImMentionDisplayLabel(n.userId, n.label)}`
  }
  if ('children' in n && n.children) return n.children.map(getFallbackText).join('')
  return ''
}

export function CwMarkdownInlineRenderer({
  nodes,
}: CwMarkdownInlineRendererProps) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.type) {
          case 'text':
            return <CwMarkdownInlineText key={i} node={n} />
          case 'bold':
            return <CwMarkdownInlineBold key={i} node={n} />
          case 'italic':
            return <CwMarkdownInlineItalic key={i} node={n} />
          case 'code':
            return <CwMarkdownInlineCode key={i} node={n} />
          case 'link':
            return <CwMarkdownInlineLink key={i} node={n} />
          case 'image':
            return <CwMarkdownInlineImage key={i} node={n} />
          case 'imMention':
            return <CwMarkdownInlineMention key={i} node={n} />
          default:
            return <span key={i}>{getFallbackText(n)}</span>
        }
      })}
    </>
  )
}

export default CwMarkdownInlineRenderer
