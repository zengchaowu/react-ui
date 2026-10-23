import {
  IM_RICH_LABEL_ATTR,
  IM_RICH_MENTION_ATTR,
  IM_RICH_USER_ID_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import {
  INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS,
  USER_MENTION_INNER_CLASS,
  USER_MENTION_WRAP_CLASS,
} from '../chips/chipStyles'
import type { CwImMentionProfileResolver } from '../chips/mentionProfile.types'
import {
  defineCwMessageInputInlineNode,
  type CwMessageInputInlineNodeDefinition,
} from './createNode'

export interface ImMentionNodeOptions {
  resolveMentionProfile?: CwImMentionProfileResolver
  /** 当前会话是否包含该 uid（未命中则渲染为普通文本，非 chip） */
  isMentionInScope?: (userId: string) => boolean
}

export interface ImMentionNodeAttrs {
  uid?: string
  label?: string
}

export interface CreateMentionElementOptions {
  /** 未命中成员池时渲染为普通文本（与 Vue `ImMentionChipNodeView` 一致） */
  inScope: boolean
  /** 已解析展示名（不含 `@`） */
  displayLabel?: string
}

/** 构造 @提及原子节点 DOM（等价 Vue `ImMentionChipNodeView`） */
export function createMentionElement(
  attrs: ImMentionNodeAttrs,
  options: CreateMentionElementOptions,
): HTMLSpanElement {
  const uid = String(attrs.uid ?? '')
  const label = String(attrs.label ?? '').trim() || uid
  const display = (options.displayLabel ?? label).trim()
  const displayText = display ? `@${display}` : '@'

  if (!options.inScope) {
    const plain = document.createElement('span')
    plain.className = 'inline'
    plain.textContent = displayText
    return plain
  }

  const wrap = document.createElement('span')
  wrap.className = USER_MENTION_WRAP_CLASS
  wrap.setAttribute(`data-cw-mention-wrap`, '')
  wrap.setAttribute(IM_RICH_USER_ID_ATTR, uid)
  wrap.setAttribute(IM_RICH_LABEL_ATTR, label)
  wrap.setAttribute('contenteditable', 'false')

  const trigger = document.createElement('span')
  trigger.className = INLINE_CHIP_EDITOR_TRIGGER_WRAP_CLASS

  const chip = document.createElement('span')
  chip.className = USER_MENTION_INNER_CLASS
  chip.setAttribute('spellcheck', 'false')
  chip.setAttribute(IM_RICH_MENTION_ATTR, '')
  chip.setAttribute(IM_RICH_USER_ID_ATTR, uid)
  chip.setAttribute(IM_RICH_LABEL_ATTR, label)
  chip.textContent = displayText

  trigger.appendChild(chip)
  wrap.appendChild(trigger)
  return wrap
}

export function renderMentionHtml(attrs: ImMentionNodeAttrs): string {
  const uid = String(attrs.uid ?? '').trim()
  const label = String(attrs.label ?? '').trim() || uid
  return `<span ${IM_RICH_MENTION_ATTR} ${IM_RICH_USER_ID_ATTR}="${uid}" ${IM_RICH_LABEL_ATTR}="${label}">@${label}</span>`
}

export function renderMentionText(attrs: ImMentionNodeAttrs): string {
  const label = String(attrs.label ?? '').trim()
  return label ? `@${label}` : '@'
}

export const ImMentionNode: CwMessageInputInlineNodeDefinition<ImMentionNodeOptions> =
  defineCwMessageInputInlineNode<ImMentionNodeOptions>('imMention', {
    resolveMentionProfile: undefined,
    isMentionInScope: undefined,
  })
