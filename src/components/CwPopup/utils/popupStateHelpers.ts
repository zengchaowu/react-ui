import type { PopupState } from '../types/state'

export function clearPopupPosition(state: PopupState): void {
  delete state.position
}

export function afterAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

/** 等待下一帧（React 中替代 Vue nextTick：等待 Portal / Ref 提交） */
export function nextAnimationFrame(): Promise<void> {
  if (typeof requestAnimationFrame === 'undefined') return Promise.resolve()
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}
