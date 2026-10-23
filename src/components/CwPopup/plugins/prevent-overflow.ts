/**
 * Prevent Overflow 插件 - 防止溢出
 *
 * 基于纯函数设计，负责防止弹出层超出视口边界
 */

import type { Coordinate, Rect } from '@zengchaowu/shared/types/geometry'
import type { PopupPluginFunction, PopupState } from '../types/state'
import { detectOverflow } from '@zengchaowu/shared/functions/dom/detectOverflow'

/**
 * PreventOverflow 插件选项
 */
export interface PreventOverflowOptions {
  /** 边界内边距（像素） */
  padding: number
}

/**
 * 计算溢出调整（纯函数）
 */
function calculateOverflowAdjustment(
  state: PopupState,
  padding: number,
): Coordinate {
  if (!state.dimensions) {
    throw new Error('[Prevent Overflow Plugin] Dimensions are not available')
  }

  // 获取弹出层矩形
  const popupRect = state.dimensions.floating

  // 检测溢出
  const overflow = detectOverflow(
    popupRect,
    { innerWidth: state.dimensions.viewport.width, innerHeight: state.dimensions.viewport.height },
    padding,
  )

  // 检查是否有任何溢出
  const hasOverflow =
    overflow.left > 0 ||
    overflow.right > 0 ||
    overflow.top > 0 ||
    overflow.bottom > 0

  // 如果没有溢出，不需要调整
  if (!hasOverflow) {
    return { x: 0, y: 0 }
  }

  let x = 0
  let y = 0

  // 只在实际溢出时调整位置
  if (overflow.left > 0) {
    x = overflow.left
  } else if (overflow.right > 0) {
    x = -overflow.right
  }

  if (overflow.top > 0) {
    y = overflow.top
  } else if (overflow.bottom > 0) {
    y = -overflow.bottom
  }

  return { x, y }
}

// ===== 主要插件函数 =====

/**
 * Prevent Overflow 插件核心函数（纯函数）
 */
function preventOverflowPlugin(
  options: PreventOverflowOptions,
): PopupPluginFunction {
  return (state) => {
    if (!state.position) {
      throw new Error('[Prevent Overflow Plugin] Position is not available')
    }

    if (!state.dimensions) {
      throw new Error('[Prevent Overflow Plugin] Dimensions are not available')
    }

    // 计算溢出调整
    const adjustment = calculateOverflowAdjustment(state, options.padding)

    // 只在有实际调整时应用新位置
    if (adjustment.x !== 0 || adjustment.y !== 0) {
      const newPosition = {
        x: state.position.x + adjustment.x,
        y: state.position.y + adjustment.y,
      }

      // 更新floating元素的位置信息
      const updatedFloating: Rect = {
        ...state.dimensions.floating,
        x: newPosition.x,
        y: newPosition.y,
        left: newPosition.x,
        right: newPosition.x + state.dimensions.floating.width,
        top: newPosition.y,
        bottom: newPosition.y + state.dimensions.floating.height,
      }

      // 返回新的状态对象（不可变）
      return {
        ...state,
        position: newPosition,
        dimensions: {
          ...state.dimensions,
          floating: updatedFloating,
        },
      }
    }

    return state
  }
}

// ===== 导出 =====

/**
 * 创建 Prevent Overflow 插件
 *
 * @param options - PreventOverflow 配置选项
 * @returns PreventOverflow 插件函数
 *
 * @example
 * ```ts
 * createPreventOverflow({ padding: 8 })
 * ```
 */
export const createPreventOverflow = preventOverflowPlugin

// ===== 导出插件信息 =====

export const PREVENT_OVERFLOW_PLUGIN_INFO = {
  name: 'prevent-overflow',
  version: '1.0.0',
  description: '防止弹出层超出视口边界',
} as const
