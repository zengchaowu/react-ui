import type { CwRichTextNode } from '../../CwRichText/types'
import type { CwLoginDialogAgreementLink } from '../types'

/** 顿号与正文区分色 */
const secondary = { color: 'var(--text-color-secondary)' }

export function buildLoginAgreementDsl(
  prefix: string,
  links: CwLoginDialogAgreementLink[],
): CwRichTextNode[] {
  if (links.length === 0) {
    return [{ type: 'text', text: prefix }]
  }

  const nodes: CwRichTextNode[] = [{ type: 'text', text: prefix }]
  links.forEach((link, index) => {
    if (index > 0) {
      nodes.push({ type: 'text', text: '、', style: secondary })
    }
    nodes.push({ type: 'link', href: link.id, text: link.text })
  })
  return nodes
}
