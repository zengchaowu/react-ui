/**
 * 工具函数
 */

/**
 * 格式化时间
 */
export function formatTime(time: number): string {
  const hours = Math.floor(time)
  const minutes = Math.floor((time - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * 获取时段
 */
export function getTimeOfDay(time: number): string {
  if (time >= 5 && time < 12) return '早晨'
  if (time >= 12 && time < 18) return '下午'
  if (time >= 18 && time < 22) return '傍晚'
  return '夜晚'
}

/**
 * 获取时段表情
 */
export function getTimeEmoji(time: number): string {
  if (time >= 5 && time < 12) return '🌅'
  if (time >= 12 && time < 18) return '☀️'
  if (time >= 18 && time < 22) return '🌆'
  return '🌙'
}

