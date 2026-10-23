import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'

/** workspace：一轮 = 一条己方消息 + 其后直到下一条己方之前的内容（供 sticky 吸顶边界） */
export type CwChatWorkspaceMessageTurn = {
  key: string
  /** 本轮吸顶的己方消息 id；无己方前导消息时为 null */
  stickyOwnId: string | null
  messages: ChatMessage[]
}

function isStickyOwnCandidate(m: ChatMessage): boolean {
  return !!m.isOwn && m.type !== 'system'
}

/**
 * 将消息按「己方提问轮次」分组。
 * sticky 必须落在轮次容器内，否则多条 sticky top:0 会叠在整列上直到列表结束。
 */
export function buildWorkspaceMessageTurns(
  messages: ChatMessage[] | null | undefined,
): CwChatWorkspaceMessageTurn[] {
  const turns: CwChatWorkspaceMessageTurn[] = []
  let current: CwChatWorkspaceMessageTurn | null = null

  for (const m of messages ?? []) {
    if (isStickyOwnCandidate(m)) {
      current = {
        key: `own-${String(m.id)}`,
        stickyOwnId: String(m.id),
        messages: [m],
      }
      turns.push(current)
      continue
    }
    if (!current) {
      current = {
        key: `lead-${String(m.id)}`,
        stickyOwnId: null,
        messages: [m],
      }
      turns.push(current)
      continue
    }
    current.messages.push(m)
  }

  return turns
}
