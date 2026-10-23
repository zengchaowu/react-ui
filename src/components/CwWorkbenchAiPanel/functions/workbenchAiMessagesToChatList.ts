import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import type { CwWorkbenchAiMessage, CwWorkbenchAiPanelTexts } from '../types'
import { defaultCwWorkbenchAiPanelTexts } from '../texts'

const USER_ID = 'cw-workbench-ai-user'
const ASSISTANT_ID = 'cw-workbench-ai-assistant'

export function workbenchAiMessagesToChatList(
  messages: readonly CwWorkbenchAiMessage[],
  agentDisplayName: string,
  texts?: Partial<CwWorkbenchAiPanelTexts>,
): ChatMessage[] {
  const t = { ...defaultCwWorkbenchAiPanelTexts, ...texts }
  return messages.map((m) => {
    let content = m.text
    if (m.status === 'stopped') {
      content = content.trim()
        ? content + t.stoppedSuffix
        : t.stoppedEmpty
    } else if (m.status === 'error' && m.error) {
      content = content.trim()
        ? content + '\n\n⚠ ' + m.error
        : '⚠ ' + m.error
    }
    const isUser = m.role === 'user'
    const isStreaming = m.status === 'streaming'
    return {
      id: isStreaming ? `ai_stream_${m.id}` : m.id,
      type: isUser ? ('text' as const) : ('markdown' as const),
      content,
      timestamp: m.at,
      sender: isUser
        ? { id: USER_ID, name: t.userSenderName }
        : {
            id: ASSISTANT_ID,
            name: agentDisplayName || t.assistantFallbackName,
          },
      isOwn: isUser,
      status: isStreaming ? 'sending' : 'sent',
      ...(m.role === 'assistant' && m.knowledgeSources?.length
        ? { knowledgeSources: m.knowledgeSources }
        : {}),
    }
  })
}
