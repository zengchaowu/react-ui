import type { PopupPluginFunction, PopupState } from '../types/state'
import { getBasePlacement } from '@zengchaowu/shared/functions/dom/getBasePlacement'

export interface AdaptiveHeightOptions {
  /**
   * 视口边缘的安全距离，避免弹窗紧贴窗口边缘
   * @default 8
   */
  padding?: number
  /**
   * 允许收缩的最小高度，低于该值时不再设置约束
   * @default 120
   */
  minHeight?: number
}

function computeAvailableHeight(state: PopupState, padding: number): number {
  const { dimensions, targetPlacement } = state
  if (!dimensions) {
    throw new Error('[Adaptive Height Plugin] Dimensions are not available')
  }

  const { reference, viewport, availableSpace } = dimensions
  const basePlacement = getBasePlacement(targetPlacement)

  const topSpace =
    (availableSpace?.top ?? Math.max(reference.top - viewport.top, 0)) - padding
  const bottomSpace =
    (availableSpace?.bottom ?? Math.max(viewport.bottom - reference.bottom, 0)) - padding

  switch (basePlacement) {
    case 'bottom':
      return Math.max(bottomSpace, 0)
    case 'top':
      return Math.max(topSpace, 0)
    default:
      return Math.max(Math.max(topSpace, bottomSpace), 0)
  }
}

function applyHeightConstraint(state: PopupState, maxHeight: number): PopupState {
  return {
    ...state,
    constraints: {
      ...state.constraints,
      maxHeight,
    },
  }
}

function clearHeightConstraint(state: PopupState): PopupState {
  if (!state.constraints?.maxHeight) {
    return state
  }

  const { maxHeight: _removed, ...rest } = state.constraints
  const hasRest = Object.keys(rest).length > 0

  return {
    ...state,
    constraints: hasRest ? rest : undefined,
  }
}

function adaptiveHeightPlugin(
  options: AdaptiveHeightOptions = {},
): PopupPluginFunction {
  const { padding = 8, minHeight = 120 } = options

  return (state) => {
    if (!state.dimensions) {
      throw new Error('[Adaptive Height Plugin] Dimensions are not available')
    }

    const availableHeight = computeAvailableHeight(state, padding)

    if (availableHeight <= 0 || availableHeight < minHeight) {
      return clearHeightConstraint(state)
    }

    return applyHeightConstraint(state, Math.round(availableHeight))
  }
}

export const createAdaptiveHeight = adaptiveHeightPlugin

export const ADAPTIVE_HEIGHT_PLUGIN_INFO = {
  name: 'adaptive-height',
  version: '1.0.0',
  description: '根据视口空间计算可用高度并写入状态约束',
} as const
