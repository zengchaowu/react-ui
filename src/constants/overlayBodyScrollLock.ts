let lockDepth = 0
let savedBodyOverflow = ''

/** modal 遮罩层引用计数：Dialog / Sheet / Hud(mask) 等共用 */
export function acquireOverlayBodyScrollLock(): void {
  if (typeof document === 'undefined') return
  if (lockDepth === 0) {
    savedBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockDepth += 1
}

export function releaseOverlayBodyScrollLock(): void {
  if (typeof document === 'undefined' || lockDepth <= 0) return
  lockDepth -= 1
  if (lockDepth === 0) {
    document.body.style.overflow = savedBodyOverflow
    savedBodyOverflow = ''
  }
}
