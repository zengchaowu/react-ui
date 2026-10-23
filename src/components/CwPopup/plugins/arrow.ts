/**
 * Arrow 插件 - 箭头指示器
 *
 * 基于纯函数设计，负责创建和管理箭头 DOM 元素
 */

import type { PopupPluginFunction, PopupState } from '../types/state'
import { getBasePlacement } from '@zengchaowu/shared/functions/dom/getBasePlacement'
import type { Placement } from '@zengchaowu/shared/types/placement'

// ===== 常量 =====

/** 默认箭头边距 */
const DEFAULT_ARROW_MARGIN = 8

/**
 * 箭头基础 CSS 类名
 * `z-[var(--z-index-below)]`：absolute 默认盖住同级 in-flow 内容，菱形箭头需半截藏进气泡。
 * 安全依赖 Popup 根节点 `fixed` + modal z-index 已形成 stacking context。
 */
const ARROW_BASE_CLASSES =
  'absolute z-[var(--z-index-below)] transform -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none'

/**
 * Arrow 插件选项
 */
export interface ArrowOptions {
  /** 箭头边距（像素） */
  margin?: number
  /** 箭头样式（CSS class 字符串，支持 Tailwind） */
  arrowClass: string
}

/**
 * 计算箭头位置（纯函数）
 * 箭头始终指向引用元素的中心点，考虑 prevent-overflow 的偏移
 */
function calculateArrowPosition(
  state: PopupState,
  margin: number,
): { x: number; y: number } {
  if (!state.dimensions) {
    throw new Error('[Arrow Plugin] Dimensions are not available')
  }

  if (!state.position) {
    throw new Error('[Arrow Plugin] Position is not available')
  }

  const { reference, floating } = state.dimensions
  const { targetPlacement, position } = state

  // 计算引用元素的中心点
  const referenceCenterX = reference.x + reference.width / 2
  const referenceCenterY = reference.y + reference.height / 2

  // 计算弹出层相对于引用元素中心点的偏移
  const offsetX = referenceCenterX - (position.x + floating.width / 2)
  const offsetY = referenceCenterY - (position.y + floating.height / 2)

  // 高清屏像素偏移量
  const dpr = window.devicePixelRatio
  const pixelOffset = 1 / dpr

  const basePlacement = getBasePlacement(targetPlacement)
  let x = 0
  let y = 0

  // 根据基础位置计算箭头坐标
  switch (basePlacement) {
    case 'top':
      x = Math.max(margin, Math.min(floating.width - margin, floating.width / 2 + offsetX))
      y = floating.height - pixelOffset - 1
      break

    case 'bottom':
      x = Math.max(margin, Math.min(floating.width - margin, floating.width / 2 + offsetX))
      y = -pixelOffset - 0.5
      break

    case 'left':
      x = floating.width - pixelOffset - 1
      y = Math.max(margin, Math.min(floating.height - margin, floating.height / 2 + offsetY))
      break

    case 'right':
      x = -pixelOffset - 0.5
      y = Math.max(margin, Math.min(floating.height - margin, floating.height / 2 + offsetY))
      break
  }

  return { x, y }
}

/**
 * 获取箭头边框方向类名（根据位置）
 */
function getArrowBorderClasses(placement: Placement): string {
  const basePlacement = getBasePlacement(placement)

  switch (basePlacement) {
    case 'top':
      return 'border-r border-b'
    case 'bottom':
      return 'border-l border-t'
    case 'left':
      return 'border-t border-r'
    case 'right':
      return 'border-b border-l'
    default:
      return ''
  }
}

/**
 * 生成箭头完整的 className
 */
function getArrowClassName(placement: Placement, arrowClass: string): string {
  const borderClasses = getArrowBorderClasses(placement)
  return `${ARROW_BASE_CLASSES} ${borderClasses} ${arrowClass}`
}

/**
 * 创建箭头 DOM 元素
 */
function createArrowElement(
  position: { x: number; y: number },
  placement: Placement,
  arrowClass: string,
): HTMLElement {
  const arrowElement = document.createElement('div')
  arrowElement.id = 'popup-arrow'

  // 四舍五入到整数，避免 Safari 模糊问题
  const x = Math.round(position.x)
  const y = Math.round(position.y)

  // 设置位置样式
  Object.assign(arrowElement.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
  })

  // 设置 CSS 类名
  arrowElement.className = getArrowClassName(placement, arrowClass)
  arrowElement.setAttribute('data-targetPlacement', placement)

  return arrowElement
}

// ===== 主要插件函数 =====

/**
 * Arrow 插件核心函数（纯函数）
 */
function arrowPlugin(options: ArrowOptions): PopupPluginFunction {
  const margin = options.margin ?? DEFAULT_ARROW_MARGIN
  const { arrowClass } = options

  return (state, context) => {
    // 从 context 中获取插件容器
    const { pluginElement } = context

    if (!pluginElement) {
      // 如果没有插件容器，跳过箭头渲染
      return state
    }

    // 计算箭头位置
    const arrowPosition = calculateArrowPosition(state, margin)

    // 创建或更新箭头元素
    let arrowElement = pluginElement.querySelector('#popup-arrow') as HTMLElement | null

    if (!arrowElement) {
      // 创建新的箭头元素
      arrowElement = createArrowElement(arrowPosition, state.targetPlacement, arrowClass)
      pluginElement.appendChild(arrowElement)
    } else {
      // 四舍五入到整数，避免 Safari 模糊问题
      const x = Math.round(arrowPosition.x)
      const y = Math.round(arrowPosition.y)
      // 更新现有箭头元素的位置和样式
      arrowElement.style.left = `${x}px`
      arrowElement.style.top = `${y}px`
      arrowElement.setAttribute('data-targetPlacement', state.targetPlacement)
      arrowElement.className = getArrowClassName(state.targetPlacement, arrowClass)
    }

    return state
  }
}

// ===== 导出 =====

/**
 * 创建 Arrow 插件
 *
 * @param options - 箭头配置选项
 * @returns 箭头插件函数
 *
 * @example
 * ```ts
 * createArrow({
 *   margin: 8,
 *   arrowClass: 'w-2 h-2 bg-[var(--bg-color-container)] border-[var(--border-color)]'
 * })
 * ```
 */
export const createArrow = arrowPlugin

/** 插件信息 */
export const ARROW_PLUGIN_INFO = {
  name: 'arrow',
  version: '1.0.0',
  description: '创建和管理箭头 DOM 元素',
} as const
