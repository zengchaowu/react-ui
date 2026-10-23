/**
 * Offset 插件 - 偏移量计算
 *
 * 基于纯函数设计，负责计算弹出层相对于参考元素的偏移量
 */

import type { PopupPluginFunction } from '../types/state'
import { getBasePlacement } from '@zengchaowu/shared/functions/dom/getBasePlacement'
import type { Placement } from '@zengchaowu/shared/types/placement'
import type { Rect } from '@zengchaowu/shared/types/geometry'

/**
 * Offset 插件选项
 */
export interface OffsetOptions {
  /** 偏移量 */
  offset: number
}

/**
 * 计算偏移量（纯函数）
 */
function calculateOffset(
  placement: Placement,
  offset: number,
): { x: number; y: number } {
  const basePlacement = getBasePlacement(placement)

  let x = 0
  let y = 0

  // 根据基础位置计算偏移
  switch (basePlacement) {
    case 'top':
      y = -offset
      break
    case 'bottom':
      y = offset
      break
    case 'left':
      x = -offset
      break
    case 'right':
      x = offset
      break
  }

  return { x, y }
}

// ===== 主要插件函数 =====

/**
 * Offset 插件核心函数（纯函数）
 */
function offsetPlugin(options: OffsetOptions): PopupPluginFunction {
  return (state) => {
    if (!state.position) {
      throw new Error('[Offset Plugin] Position is not available')
    }

    if (!state.dimensions) {
      throw new Error('[Offset Plugin] Dimensions are not available')
    }

    // 如果没有偏移量，直接返回
    if (options.offset === 0) {
      return state
    }

    // 计算偏移量
    const offsetDelta = calculateOffset(state.targetPlacement, options.offset)

    // 应用偏移量到位置
    const newPosition = {
      x: state.position.x + offsetDelta.x,
      y: state.position.y + offsetDelta.y,
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
}

// ===== 导出 =====

/**
 * 创建 Offset 插件
 *
 * @param options - 偏移量配置选项
 * @returns Offset 插件函数
 *
 * @example
 * ```ts
 * createOffset({ offset: 8 })
 * ```
 */
export const createOffset = offsetPlugin

// ===== 导出插件信息 =====

export const OFFSET_PLUGIN_INFO = {
  name: 'offset',
  version: '1.0.0',
  description: '计算弹出层相对于参考元素的偏移量',
} as const
