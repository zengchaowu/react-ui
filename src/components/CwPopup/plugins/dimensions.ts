/**
 * Dimensions 插件 - 元素尺寸计算
 *
 * 基于纯函数设计，负责计算参考元素、浮动元素和视口的尺寸信息
 */

import type {
  PopupContext,
  PopupPluginFunction,
  PopupState,
} from '../types/state'
import { getViewportRect } from '@zengchaowu/shared/functions/dom/getViewportRect'
import { readBrowserHostDepsFromGlobalThis } from '@zengchaowu/shared/functions/browser/readBrowserHost'
import type { Rect } from '@zengchaowu/shared/types/geometry'

/** 将参考元素 / 浮层元素统一转换为 Rect（虚拟元素同样支持） */
function toRect(el: { getBoundingClientRect: () => DOMRect }): Rect {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
  }
}

function calculateAvailableSpace(reference: Rect, viewport: Rect) {
  return {
    top: Math.max(reference.top - viewport.top, 0),
    right: Math.max(viewport.right - reference.right, 0),
    bottom: Math.max(viewport.bottom - reference.bottom, 0),
    left: Math.max(reference.left - viewport.left, 0),
  }
}

/**
 * 计算所有尺寸信息（纯函数）
 */
function calculateDimensions(context: PopupContext): PopupState['dimensions'] {
  // 获取元素相对于视口的尺寸和位置
  const reference = toRect(context.referenceElement)
  const floating = toRect(context.popupElement)
  const host = readBrowserHostDepsFromGlobalThis().host
  const viewport = getViewportRect({
    innerWidth: host.innerWidth ?? 0,
    innerHeight: host.innerHeight ?? 0,
  })
  const availableSpace = calculateAvailableSpace(reference, viewport)

  return {
    reference,
    floating,
    viewport,
    availableSpace,
  }
}

// ===== 主要插件函数 =====

/**
 * Dimensions 插件核心函数（纯函数）
 */
function dimensionsPlugin(): PopupPluginFunction {
  return (position, context) => {
    // 计算尺寸
    const dimensionsData = calculateDimensions(context)

    // 返回新的状态对象（不可变）
    return {
      ...position,
      dimensions: dimensionsData,
    }
  }
}

// ===== 导出 =====

/**
 * 创建 Dimensions 插件
 *
 * @returns Dimensions 插件函数
 *
 * @example
 * ```ts
 * createDimensions()
 * ```
 */
export const createDimensions = dimensionsPlugin

// ===== 导出插件信息 =====

export const DIMENSIONS_PLUGIN_INFO = {
  name: 'dimensions',
  version: '1.0.0',
  description: '计算参考元素、浮动元素和视口的尺寸信息',
} as const
