/** 微信式钱包消息卡片（红包 / 转账）共用布局 class；色板走 design token CSS 变量 */

const chatWalletCardShellClasses = [
  'box-border relative shrink-0 flex flex-col w-full h-full overflow-hidden',
  'rounded-[var(--radius-message-wallet-card)]',
  'after:content-[""] after:absolute after:inset-x-0',
  'after:bottom-[var(--size-message-wallet-card-foot-h)] after:h-px after:pointer-events-none',
].join(' ')

export const chatWalletCardBodyClasses = [
  'box-border flex flex-1 items-center gap-2.5 min-h-0',
  'pt-2 px-3 pb-[calc(var(--size-message-wallet-card-foot-h)+0.125rem)]',
].join(' ')

export const chatWalletCardIconBoxClasses = [
  'shrink-0 flex items-center justify-center',
  'w-[var(--size-message-wallet-card-icon)] h-[var(--size-message-wallet-card-icon)]',
  'min-w-[var(--size-message-wallet-card-icon)] min-h-[var(--size-message-wallet-card-icon)]',
].join(' ')

export const chatWalletCardIconImageClasses = 'block w-full h-full object-contain'

export const chatWalletCardContentClasses = 'min-w-0 flex-1'

const chatWalletCardBrandClasses = [
  'absolute left-3 bottom-1.5',
  '[font-size:var(--font-size-xs)] leading-none pointer-events-none',
].join(' ')

export const chatWalletTransferRootClasses = [
  chatWalletCardShellClasses,
  'text-[var(--chat-wallet-transfer-main-fg)]',
  'bg-[linear-gradient(180deg,var(--chat-wallet-transfer-main-from)_0%,var(--chat-wallet-transfer-main-to)_100%)]',
  'after:bg-[var(--chat-wallet-transfer-divider)]',
].join(' ')

export const chatWalletTransferIconGlyphClasses = [
  '[font-size:var(--size-message-wallet-card-icon)] leading-none',
  'text-[var(--chat-wallet-transfer-icon-fg)]',
].join(' ')

export const chatWalletTransferTitleClasses = [
  '[font-size:var(--font-size-body-md)] font-medium leading-tight line-clamp-2',
].join(' ')

export const chatWalletTransferSublineClasses = [
  'mt-0.5 [font-size:var(--font-size-xs)] font-normal leading-tight line-clamp-1',
  'text-[var(--chat-wallet-transfer-subline-fg)]',
].join(' ')

export const chatWalletTransferBrandClasses = [
  chatWalletCardBrandClasses,
  'text-[var(--chat-wallet-transfer-brand-fg)]',
].join(' ')

export const chatWalletRedEnvelopeRootClasses = [
  chatWalletCardShellClasses,
  'text-[var(--chat-wallet-red-envelope-main-fg)]',
  'bg-[linear-gradient(180deg,var(--chat-wallet-red-envelope-main-from)_0%,var(--chat-wallet-red-envelope-main-to)_100%)]',
  'after:bg-[var(--chat-wallet-red-envelope-divider)]',
].join(' ')

export const chatWalletRedEnvelopeTitleClasses = [
  '[font-size:var(--font-size-body-md)] font-medium leading-tight line-clamp-1',
].join(' ')

export const chatWalletRedEnvelopeStatusClasses = [
  'mt-0.5 [font-size:var(--font-size-xs)] font-normal leading-tight',
].join(' ')

export const chatWalletRedEnvelopeBrandClasses = [
  chatWalletCardBrandClasses,
  'text-[var(--chat-wallet-red-envelope-brand-fg)]',
].join(' ')

/** 已领取 / 过期 / 领完：内容区半透明 */
export const chatWalletRedEnvelopeFinishedContentClasses = 'opacity-55'
