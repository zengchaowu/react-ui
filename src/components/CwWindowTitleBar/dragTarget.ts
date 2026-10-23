export function isCwWindowTitleBarDragTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  if (!target.closest('.cw-window-title-bar')) return false
  if (target.closest('.cw-window-title-bar [role="button"]')) return false
  if (target.closest('[role="tab"], button, input, textarea, a, label')) return false
  return true
}
