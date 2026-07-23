import type { CwChatMessageCellTexts } from './types'

export const defaultCwChatMessageCellTexts: CwChatMessageCellTexts = {
  clientTimeLocalPrefix: '（本地 ',
  clientTimeLocalSuffix: '）',
  sendingLabel: '发送中',
  sendFailedLabel: '发送失败',
  outboundFailedHint: '消息发送失败',
  retryOutboundLabel: '点击重发',
  agentProxyFailedHint: '智能体回复失败',
  retryAgentProxyLabel: '点击重试',
}
