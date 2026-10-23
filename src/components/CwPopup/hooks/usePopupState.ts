import { useCallback, useReducer, useRef } from 'react'
import type { PopupState } from '../types/state'
import type { Placement } from '@zengchaowu/shared/types/placement'
import type { PopupTrigger } from '../types/state'

/**
 * 弹出层状态管理 Hook
 * React 版：state 为可变对象（插件引擎原地写入），通过 notify 触发重渲染。
 */
export function usePopupState(placement: Placement, trigger: PopupTrigger) {
  const stateRef = useRef<PopupState>({
    originPlacement: placement,
    targetPlacement: placement,
    trigger,
    visible: false,
  })

  const [, forceRender] = useReducer((version: number) => version + 1, 0)
  const notify = useCallback(() => forceRender(), [])

  return {
    state: stateRef.current,
    notify,
  }
}
