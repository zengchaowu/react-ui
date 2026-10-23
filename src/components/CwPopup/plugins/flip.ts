/**
 * Flip 插件 - 智能翻转定位
 *
 * 基于纯函数设计，当弹出层超出视口边界时智能翻转到最佳位置
 */

import type { PopupPluginFunction, PopupState } from '../types/state'
import type { Placement } from '@zengchaowu/shared/types/placement'
import { detectOverflow } from '@zengchaowu/shared/functions/dom/detectOverflow'
import { getMainAxisFlip } from '@zengchaowu/shared/functions/dom/getMainAxisFlip'
import { computePosition } from '@zengchaowu/shared/functions/dom/computePosition'
import type { Rect } from '@zengchaowu/shared/types/geometry'

/**
 * Flip 插件选项
 */
export interface FlipOptions {
  /** 边界内边距（像素） */
  padding: number
}

/**
 * 生成候选位置列表（纯函数）
 */
function generateCandidates(originalPlacement: Placement): Placement[] {
  const candidates: Placement[] = []

  // 1. 原始位置
  candidates.push(originalPlacement)

  // 2. 主轴翻转
  candidates.push(getMainAxisFlip(originalPlacement))

  return candidates
}

/**
 * 检测位置溢出（纯函数）
 */
function detectPositionOverflow(
  state: PopupState,
  placement: Placement,
  padding: number,
) {
  const scrollOffset = state.scrollOffset
  if (!scrollOffset) {
    throw new Error('[Flip Plugin] Scroll offset is not available')
  }

  if (!state.dimensions) {
    throw new Error('[Flip Plugin] Dimensions are not available')
  }

  // 使用视口相对坐标计算位置
  const position = computePosition(
    placement,
    state.dimensions.reference,
    state.dimensions.floating,
    scrollOffset,
  )

  // 构造弹出层矩形（保持与 computePosition 返回的一致坐标系：视口相对坐标）
  const popupRect: Rect = {
    x: position.x,
    y: position.y,
    width: state.dimensions.floating.width,
    height: state.dimensions.floating.height,
    top: position.y,
    left: position.x,
    right: position.x + state.dimensions.floating.width,
    bottom: position.y + state.dimensions.floating.height,
  }

  // 检测视口溢出（popupRect 已为视口相对坐标）
  const overflow = detectOverflow(
    popupRect,
    { innerWidth: state.dimensions.viewport.width, innerHeight: state.dimensions.viewport.height },
    padding,
  )
  const totalOverflow =
    overflow.top + overflow.right + overflow.bottom + overflow.left

  return { overflow, totalOverflow }
}

/**
 * 选择最佳候选位置（纯函数）
 */
function selectBestCandidate(
  candidates: Placement[],
  state: PopupState,
  options: FlipOptions,
): Placement {
  const evaluations = candidates.map((candidate) => {
    const { overflow, totalOverflow } = detectPositionOverflow(
      state,
      candidate,
      options.padding,
    )
    return { placement: candidate, overflowArea: totalOverflow, overflow }
  })

  // 优先选择无溢出的位置
  const noOverflowCandidates = evaluations.filter(
    (evaluation) => evaluation.overflowArea === 0,
  )
  if (noOverflowCandidates.length > 0) {
    return noOverflowCandidates[0]?.placement ?? candidates[0] ?? 'bottom'
  }

  // 如果都有溢出，优先选择溢出最小的位置（让 flip 尽可能减少溢出）
  const best = evaluations.reduce((best, current) =>
    current.overflowArea < best.overflowArea ? current : best,
  )
  return best.placement
}

// ===== 主要插件函数 =====

/**
 * Flip 插件核心函数（纯函数）
 */
function flipPlugin(options: FlipOptions): PopupPluginFunction {
  return (state) => {
    if (!state.dimensions) {
      throw new Error('[Flip Plugin] Dimensions are not available')
    }
    if (!state.scrollOffset) {
      throw new Error('[Flip Plugin] Scroll offset is not available')
    }

    // 生成候选位置
    const candidates = generateCandidates(state.originPlacement)
    const currentPlacement = state.targetPlacement

    // 检查当前位置是否已经设置了 maxHeight 约束
    // 如果设置了，说明自适应高度插件认为当前位置可以工作（可用高度 >= minHeight）
    // 在这种情况下，优先保持当前位置，不进行翻转
    const hasMaxHeightConstraint = state.constraints?.maxHeight !== undefined

    if (hasMaxHeightConstraint) {
      return state
    }

    // 如果没有 maxHeight 约束，说明当前 placement 无法满足最小高度要求
    // 此时才考虑翻转，寻找更好的位置
    const bestPlacement = selectBestCandidate(candidates, state, options)

    // 如果最佳位置和当前位置相同，不需要更新
    if (bestPlacement === currentPlacement) {
      return state
    }

    return {
      ...state,
      targetPlacement: bestPlacement,
    }
  }
}

// ===== 导出 =====

/**
 * 创建 Flip 插件
 *
 * @param options - Flip 配置选项
 * @returns Flip 插件函数
 *
 * @example
 * ```ts
 * createFlip({ padding: 8 })
 * ```
 */
export const createFlip = flipPlugin

// ===== 导出插件信息 =====

export const FLIP_PLUGIN_INFO = {
  name: 'flip',
  version: '1.0.0',
  description: '当弹出层超出视口边界时智能翻转到最佳位置',
} as const
