/**
 * 弹出层状态类型定义
 */
import type { Placement, BasePlacement, Alignment } from '@zengchaowu/shared/types/placement'
import type { Rect } from '@zengchaowu/shared/types/geometry'

export type PopupTrigger = 'click' | 'hover' | 'manual' | 'contextmenu'

/**
 * 虚拟元素 - 用于自定义定位参考点
 * 只需提供 getBoundingClientRect 方法，不需要真实的 DOM 节点
 */
export interface VirtualElement {
  getBoundingClientRect: () => DOMRect
}

/**
 * 弹出层约束
 */
export interface PopupConstraints {
  maxHeight?: number
}

export interface PopupState {
  // 元数据,变化会导致组件重新创建
  originPlacement: Placement
  trigger: PopupTrigger

  // 动态数据,监听变更UI状态
  visible: boolean
  position?: {
    x: number
    y: number
  }

  // 以下是插件填充的数据,用于进行计算.

  // 目标位置,由插件计算得出
  targetPlacement: Placement

  // 元素尺寸信息
  dimensions?: {
    reference: Rect
    floating: Rect
    viewport: Rect
    availableSpace: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }

  // 滚动偏移量
  scrollOffset?: {
    x: number
    y: number
  }

  constraints?: PopupConstraints
}

/**
 * 插件上下文
 */
export interface PopupContext {
  /**
   * 引用元素（支持虚拟元素）
   */
  referenceElement: HTMLElement | VirtualElement
  /**
   * 弹出层元素
   */
  popupElement: HTMLElement
  /**
   * 插件容器元素（用于放置箭头等装饰元素）
   */
  pluginElement: HTMLElement
}

/**
 * 插件函数 - 处理统一状态
 */
export type PopupPluginFunction = (
  state: PopupState,
  context: PopupContext,
) => PopupState

export type { Placement, BasePlacement, Alignment }
