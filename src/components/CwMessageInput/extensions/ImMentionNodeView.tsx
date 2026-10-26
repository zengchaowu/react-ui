import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import {
  IM_RICH_LABEL_ATTR,
  IM_RICH_MENTION_ATTR,
  IM_RICH_USER_ID_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import CwMessageInputInlineChip from '../chips/CwMessageInputInlineChip'
import {
  INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS,
  USER_MENTION_INNER_CLASS,
  USER_MENTION_WRAP_CLASS,
} from '../chips/chipStyles'
import type { ImMentionNodeOptions } from './ImMentionNode'

/** @提及 chip 节点视图（等价 Vue `ImMentionChipNodeView`） */
export function ImMentionNodeView({ node, extension }: NodeViewProps) {
  const opts = extension.options as ImMentionNodeOptions
  const uid = String(node.attrs.uid ?? '')
  const label = String(node.attrs.label ?? '').trim() || uid
  const profile = opts.resolveMentionProfile?.(uid.trim()) ?? { label }
  const inScope = !!uid.trim() && (opts.isMentionInScope?.(uid.trim()) ?? false)
  const body = (inScope ? profile.label : label).trim()
  const displayText = body ? `@${body}` : '@'

  if (!inScope) {
    return (
      <NodeViewWrapper as="span" className="inline">
        {displayText}
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className={USER_MENTION_WRAP_CLASS}
      {...{ [`${IM_RICH_MENTION_ATTR}-wrap`]: '' }}
      {...{ [IM_RICH_USER_ID_ATTR]: uid, [IM_RICH_LABEL_ATTR]: label }}
    >
      <span className={INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS}>
        <CwMessageInputInlineChip
          innerClass={USER_MENTION_INNER_CLASS}
          text={displayText}
          innerAttrs={{
            spellCheck: 'false',
            [IM_RICH_MENTION_ATTR]: '',
            [IM_RICH_USER_ID_ATTR]: uid,
            [IM_RICH_LABEL_ATTR]: label,
          }}
        />
      </span>
    </NodeViewWrapper>
  )
}

export default ImMentionNodeView
