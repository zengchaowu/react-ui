/** 微信语音气泡宽度：约 70px～200px，随秒数线性增长 */
export function chatVoiceBubbleWidthRem(durationSec: number): number {
  const sec = Math.max(1, Math.min(60, Math.round(durationSec)))
  const minRem = 4.375
  const maxRem = 12.5
  return minRem + ((maxRem - minRem) * (sec - 1)) / 59
}

export function formatChatVoiceDurationLabel(durationSec: number): string {
  const sec = Math.max(1, Math.round(durationSec))
  return `${sec}"`
}
