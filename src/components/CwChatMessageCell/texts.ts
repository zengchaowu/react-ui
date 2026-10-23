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
  editOwnMessageLabel: '编辑消息',
  editOwnMessageCancelHint: 'Esc 取消',
  stopOwnMessageReplyLabel: '停止回复',
}
