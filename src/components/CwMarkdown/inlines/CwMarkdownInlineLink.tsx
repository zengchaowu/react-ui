import type { KeyboardEvent, MouseEvent } from 'react'
import type { InlineLinkNode, InlineTextNode } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from './CwMarkdownInlineRenderer'
import { useBrowserFocusVisible } from '../../../hooks/useBrowserFocusVisible'

export interface CwMarkdownInlineLinkProps {
  node: InlineLinkNode
}

export function CwMarkdownInlineLink({ node }: CwMarkdownInlineLinkProps) {
  const ctx = useCwMarkdownContext()
  const { isFocusVisible, handleFocus, handleBlur } = useBrowserFocusVisible()

  const linkText = node.children.length
    ? node.children
        .filter((n): n is InlineTextNode => n.type === 'text')
        .map((n) => n.value)
        .join('')
    : node.href

  const inactive = ctx.disabled || ctx.readonly

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (inactive) return
    event.preventDefault()
    ctx.onLinkClick(node.href, event)
  }

  function onKeyDown(event: KeyboardEvent<HTMLAnchorElement>) {
    if (inactive) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      ctx.onLinkClick(node.href, event as unknown as MouseEvent<HTMLElement>)
    }
  }

  function onFocus() {
    if (inactive) return
    handleFocus()
  }

  return (
    <a
      href={inactive ? undefined : node.href}
      className={[
        ctx.styles.link,
        ctx.styles.linkNormal,
        isFocusVisible && !inactive ? ctx.styles.linkFocused : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${ctx.texts.linkAriaLabelPrefix}${linkText}`}
      aria-disabled={ctx.disabled ? 'true' : 'false'}
      tabIndex={ctx.disabled ? undefined : 0}
      role="link"
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={handleBlur}
    >
      <CwMarkdownInlineRenderer nodes={node.children} />
    </a>
  )
}

export default CwMarkdownInlineLink
