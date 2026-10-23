/**
 * Position 插件 - 位置计算
 *
 * 基于纯函数设计，负责计算弹出层的基础位置
 */

import type { PopupPluginFunction } from '../types/state'
import { computePosition } from '@zengchaowu/shared/functions/dom/computePosition'
import type { Rect } from '@zengchaowu/shared/types/geometry'

// ===== 主要插件函数 =====

/**
 * Position 插件核心函数（纯函数）
 */
function positionPlugin(): PopupPluginFunction {
  return (state, context) => {
    // 检查是否有尺寸数据
    if (!state.dimensions) {
      throw new Error('[Position Plugin] Dimensions are not available')
    }

    if (!state.scrollOffset) {
      throw new Error('[Position Plugin] Scroll offset is not available')
    }

    // 计算基础位置
    const basePosition = computePosition(
      state.targetPlacement,
      state.dimensions.reference,
      state.dimensions.floating,
      state.scrollOffset,
    )

    // 更新floating元素的位置信息
    const updatedFloating: Rect = {
      ...state.dimensions.floating,
      x: basePosition.x,
      y: basePosition.y,
      left: basePosition.x,
      right: basePosition.x + state.dimensions.floating.width,
      top: basePosition.y,
      bottom: basePosition.y + state.dimensions.floating.height,
    }

    // 返回新的状态对象（不可变）
    return {
      ...state,
      position: basePosition,
      dimensions: {
        ...state.dimensions,
        floating: updatedFloating,
      },
    }
  }
}

// ===== 导出 =====

/**
 * 创建 Position 插件
 *
 * @returns Position 插件函数
 *
 * @example
 * ```ts
 * createPosition()
 * ```
 */
export const createPosition = positionPlugin

// ===== 导出插件信息 =====

export const POSITION_PLUGIN_INFO = {
  name: 'position',
  version: '1.0.0',
  description: '计算弹出层的基础位置',
} as const
