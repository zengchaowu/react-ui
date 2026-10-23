import { designPxToRem } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

/** 文件类消息卡片默认宽（设计稿 300px @16 → rem） */
export const FILE_MESSAGE_BUBBLE_WIDTH_REM = 18.75

/** 微信式钱包卡片（设计稿 240×84px @16 → rem） */
export const WALLET_MESSAGE_BUBBLE_WIDTH_REM = 15
export const WALLET_MESSAGE_BUBBLE_HEIGHT_REM = 5.25

/** 钱包红包/转账卡片：固定 240×84，窄屏/宽屏同一尺寸，不随列宽缩放 */
export function chatWalletBubbleSizeStyle(
  widthRem = WALLET_MESSAGE_BUBBLE_WIDTH_REM,
  heightRem = WALLET_MESSAGE_BUBBLE_HEIGHT_REM,
): {
  width: string
  minWidth: string
  maxWidth: string
  height: string
  minHeight: string
  flexShrink: string
} {
  const width = `${widthRem}rem`
  const height = `${heightRem}rem`
  return {
    width,
    minWidth: width,
    maxWidth: width,
    height,
    minHeight: height,
    flexShrink: '0',
  }
}

/** 钱包卡片外层：固定宽，不参与 flex 收缩 */
export const CHAT_WALLET_BUBBLE_WRAPPER_CLASS = 'inline-flex shrink-0'

/** 图片 / 视频气泡展示上限（设计稿 px，参与等比缩放计算） */
export const CHAT_MEDIA_BUBBLE_MAX_PX = 300

/** 无有效原始宽高时的默认边长（设计稿 px） */
export const CHAT_MEDIA_BUBBLE_DEFAULT_PX = 100

/**
 * 宽屏气泡最大宽度（相对消息列）。`bubblesFullWidth` 时改为 `max-w-full`（只放开上限，己方仍 w-fit）。
 * 禁止再用 Tailwind `md:max-w-*`。
 */
export const CHAT_BUBBLE_MAX_WIDTH_CLASS = 'max-w-[66.666667%]'

/** 与文件气泡一致的外层：按内容收缩，且不超过消息列 */
export const CHAT_CARD_BUBBLE_WRAPPER_CLASS = 'flex min-w-0 w-fit max-w-full'

/** 卡片本体铺满外层宽度（外层 max-width 生效后内部才能换行截断） */
export const CHAT_CARD_BUBBLE_BODY_INNER_CLASS = 'box-border w-full min-w-0'

/**
 * 引用 / 合并转发外层最大宽（与 `CwChatMessageFile` 默认宽一致）。
 */
export function chatCardBubbleWrapperMaxWidthStyle(
  maxWidthRem = FILE_MESSAGE_BUBBLE_WIDTH_REM,
): { maxWidth: string } {
  return { maxWidth: `min(${maxWidthRem}rem, 100%)` }
}

/**
 * 图片 / 视频气泡外框尺寸：无有效宽高时每边默认 100；单边超过 max 时按 min(maxW/w, maxH/h) 等比缩小；不放大。
 */
export function computeImageOrVideoBubbleSize(
  widthPx: number | undefined | null,
  heightPx: number | undefined | null,
  options?: { maxWidth?: number; maxHeight?: number },
): { width: number; height: number } {
  const maxWidth = options?.maxWidth ?? CHAT_MEDIA_BUBBLE_MAX_PX
  const maxHeight = options?.maxHeight ?? CHAT_MEDIA_BUBBLE_MAX_PX
  const w =
    widthPx != null && Number.isFinite(widthPx) && widthPx > 0
      ? widthPx
      : CHAT_MEDIA_BUBBLE_DEFAULT_PX
  const h =
    heightPx != null && Number.isFinite(heightPx) && heightPx > 0
      ? heightPx
      : CHAT_MEDIA_BUBBLE_DEFAULT_PX
  let scale = 1
  if (w > maxWidth || h > maxHeight) {
    scale = Math.min(maxWidth / w, maxHeight / h)
  }
  return { width: w * scale, height: h * scale }
}

/** 图片 / 视频气泡外框 CSS 尺寸（rem，随根字号缩放） */
export function computeImageOrVideoBubbleSizeStyle(
  widthPx: number | undefined | null,
  heightPx: number | undefined | null,
  options?: { maxWidth?: number; maxHeight?: number },
): { width: string; height: string } {
  const { width, height } = computeImageOrVideoBubbleSize(
    widthPx,
    heightPx,
    options,
  )
  return {
    width: designPxToRem(width),
    height: designPxToRem(height),
  }
}
