import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import {
  IM_RICH_LABEL_ATTR,
  IM_RICH_MENTION_ATTR,
  IM_RICH_USER_ID_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { INLINE_CHIP_REACT_RENDERER_CLASS } from '../chips/chipStyles'
import type { CwImMentionProfileResolver } from '@zengchaowu/ui-shared/components/CwMessageInput/chips/mentionProfile.types'
import { ImMentionNodeView } from './ImMentionNodeView'

export interface ImMentionNodeOptions {
  resolveMentionProfile?: CwImMentionProfileResolver
  /** 当前会话是否包含该 uid（未命中则渲染为普通文本，非 chip） */
  isMentionInScope?: (userId: string) => boolean
}

export const ImMentionNode = Node.create<ImMentionNodeOptions>({
  name: 'imMention',

  addOptions() {
    return {
      resolveMentionProfile: undefined,
      isMentionInScope: undefined,
    }
  },

  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      uid: { default: '' },
      label: { default: '' },
    }
  },

  parseHTML() {
    const attrsFromMentionEl = (el: HTMLElement) => {
      const uid = el.getAttribute(IM_RICH_USER_ID_ATTR)?.trim() || ''
      const label =
        el.getAttribute(IM_RICH_LABEL_ATTR)?.trim() ||
        (el.textContent ?? '').replace(/^@/, '').trim() ||
        uid
      return { uid, label }
    }
    return [
      {
        tag: `span[${IM_RICH_MENTION_ATTR}]`,
        getAttrs: (el) => attrsFromMentionEl(el as HTMLElement),
      },
      {
        tag: 'span[data-cw-mention-wrap]',
        getAttrs: (el) => {
          const wrap = el as HTMLElement
          const uidFromWrap = wrap.getAttribute(IM_RICH_USER_ID_ATTR)?.trim() || ''
          const labelFromWrap = wrap.getAttribute(IM_RICH_LABEL_ATTR)?.trim() || ''
          if (uidFromWrap) {
            return {
              uid: uidFromWrap,
              label: labelFromWrap || uidFromWrap,
            }
          }
          const inner = wrap.querySelector(`[${IM_RICH_MENTION_ATTR}]`)
          if (inner) return attrsFromMentionEl(inner as HTMLElement)
          return false
        },
      },
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImMentionNodeView, {
      className: INLINE_CHIP_REACT_RENDERER_CLASS,
    })
  },

  renderHTML({ node }) {
    const uid = String(node.attrs.uid ?? '').trim()
    const label = String(node.attrs.label ?? '').trim() || uid
    return [
      'span',
      mergeAttributes({
        [IM_RICH_MENTION_ATTR]: '',
        [IM_RICH_USER_ID_ATTR]: uid,
        [IM_RICH_LABEL_ATTR]: label,
      }),
      `@${label}`,
    ]
  },

  renderText({ node }) {
    const label = String(node.attrs.label ?? '').trim()
    return label ? `@${label}` : '@'
  },
})
