export interface CwChatMessageTransferTexts {
  receiverFallback: string
  transferToTitle: string
  ownTransferSubline: string
  peerTransferGreeting: string
  brandLabel: string
}

export const defaultCwChatMessageTransferTexts: CwChatMessageTransferTexts = {
  receiverFallback: '对方',
  transferToTitle: '向{name}转账',
  ownTransferSubline: '你发起了一笔转账',
  peerTransferGreeting: '转账给你',
  brandLabel: '转账',
}
