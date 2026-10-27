import type { HTMLAttributes } from 'react'
import type { CwRichTextNode, CwRichTextAppearance, CwRichTextTexts } from '@zengchaowu/ui-shared/components/CwRichText/types'

export interface CwRichTextEmits {
  /** 链接点击事件 */
  onLinkClick?: (href: string, event: MouseEvent) => void
}

export interface CwRichTextProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    CwRichTextEmits {
  dsl: CwRichTextNode[]
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  appearance?: CwRichTextAppearance
  texts?: Partial<CwRichTextTexts>
}
