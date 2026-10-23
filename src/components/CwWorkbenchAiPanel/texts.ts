import type { CwWorkbenchAiPanelTexts } from './types'

export const defaultCwWorkbenchAiPanelTexts: Required<CwWorkbenchAiPanelTexts> = {
  title: 'AI 助手',
  clearTitle: '清空会话',
  closeTitle: '关闭',
  emptyMessages: '询问当前上下文或描述你想了解的内容…',
  composerPlaceholder: '输入问题…',
  composerPlaceholderWithContext: '描述要如何处理当前选中内容…',
  stoppedSuffix: '\n\n（已停止）',
  stoppedEmpty: '（已停止）',
  userSenderName: '我',
  assistantFallbackName: 'AI 助手',
}
