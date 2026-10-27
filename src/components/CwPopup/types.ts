import type { CSSProperties, ReactNode } from 'react'
import type { Placement } from '@zengchaowu/shared/types/placement'
import type {
  PopupTrigger,
  PopupPluginFunction,
  PopupState,
  VirtualElement,
} from '@zengchaowu/ui-shared/components/CwPopup/types/state'
import type { CwPopupAppearance, CwPopupTexts } from '@zengchaowu/ui-shared/components/CwPopup/types'

/**
 * CwPopup 基础配置选项（共享字段）
 */
export interface CwPopupBaseOptions {
  /**
   * 弹出层的位置
   * @default 'top'
   */
  placement?: Placement
  /**
   * 触发方式
   * @default 'hover'
   */
  trigger?: PopupTrigger
  /**
   * 插件列表（按执行顺序）
   * 推荐顺序：dimensions -> adaptive-height -> flip -> position -> offset -> prevent-overflow -> arrow
   */
  plugins?: PopupPluginFunction[]
  /**
   * hover 触发显示延迟（毫秒）
   * @default 0
   */
  showDelay?: number
  /**
   * hover 触发隐藏延迟（毫秒）
   * @default 100
   */
  hideDelay?: number
  /**
   * 是否在点击外部时关闭（仅对 trigger='click' | 'manual' | 'contextmenu' 有效）
   * @default true
   */
  closeOnClickOutside?: boolean
  /**
   * 打开后短暂忽略 click-outside（毫秒），避免触摸长按合成 click 误关
   */
  dismissGraceMs?: number
  /** 滚动时关闭 */
  closeOnScroll?: boolean
  /** 额外 dismiss trap 元素（如 ContextMenu 的 trigger wrap） */
  extraTraps?: () => (HTMLElement | null | undefined)[]
  /** Popup 挂载容器；默认 `document.body` */
  getMountContainer?: () => HTMLElement | null
}

/**
 * CwPopup 配置选项（函数式 API）
 */
export interface CwPopupOptions extends CwPopupBaseOptions {
  /**
   * 弹出层样式配置（CSS class 字符串，支持 Tailwind）。
   * 勿包含 relative/absolute/fixed 等定位类，根节点由内部固定为 `fixed top-0 left-0`。
   */
  popupClass: string
  /**
   * 虚拟参考元素 - 用于在光标位置显示弹出层
   * 当设置此值时，trigger 应设为 'manual'
   */
  virtualReference?: VirtualElement
  /**
   * visible 状态变化时的回调函数
   */
  onVisibleChange?: (visible: boolean) => void
  /**
   * trigger 元素尺寸变化时的回调函数
   */
  onTriggerResize?: (size: { width: number; height: number }) => void
  /**
   * 弹出层约束变化时的回调函数（当前仅包含 maxHeight）
   */
  onMaxHeightChange?: (maxHeight: number | null) => void
}

export interface CwPopupProps extends CwPopupBaseOptions {
  /**
   * 是否默认显示（仅对 trigger='manual' 有效）
   * @default false
   */
  modelValue?: boolean
  /**
   * 虚拟参考元素 - 用于在光标位置显示弹出层
   * 提供 getBoundingClientRect 方法即可，不需要真实 DOM 节点
   * 当设置此值时，trigger 应设为 'manual'，由外部控制显示/隐藏
   */
  virtualReference?: VirtualElement
  /**
   * 预设浮层外观
   * @default 'default'
   */
  appearance?: CwPopupAppearance
  /**
   * 浮层根节点 class（非空时**完全替代** appearance 对应壳 class，勿含定位类）
   */
  popupClass?: string
  /**
   * trigger 包裹层 class（传空字符串表示无额外 class；未传则用 appearance 预设）
   */
  triggerClass?: string
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwPopupTexts>
  /**
   * 默认插槽（浮层内容）
   */
  children?: ReactNode
  /**
   * 具名插槽 trigger
   */
  triggerSlot?: ReactNode
  /**
   * 透传到 trigger 包裹层（Vue `$attrs`）
   */
  className?: string
  /**
   * visible 状态变化回调（Vue `visibleChange`）
   */
  onVisibleChange?: (visible: boolean) => void
  /**
   * v-model 双向绑定回调（Vue `update:modelValue`）
   */
  onUpdateModelValue?: (visible: boolean) => void
  /**
   * trigger 元素尺寸变化回调
   */
  onTriggerResize?: (size: { width: number; height: number }) => void
  /**
   * 弹出层 maxHeight 约束变化回调
   */
  onMaxHeightChange?: (maxHeight: number | null) => void
}

/**
 * CwPopup 组件 Emits
 * React 侧通过 `onVisibleChange` / `onUpdateModelValue` 等 props 回调实现。
 */
export interface CwPopupEmits {
  /**
   * visible 状态变化事件
   */
  (e: 'visibleChange', visible: boolean): void
  /**
   * v-model 双向绑定事件（仅对 trigger='manual' 有效）
   */
  (e: 'update:modelValue', visible: boolean): void
  /**
   * trigger 元素尺寸变化事件
   */
  (e: 'triggerResize', size: { width: number; height: number }): void
  /**
   * 弹出层 maxHeight 约束变化事件
   */
  (e: 'maxHeightChange', maxHeight: number | null): void
}

/**
 * CwPopup 实例接口
 */
export interface CwPopupInstance {
  /**
   * 弹出层状态
   */
  state: PopupState
  /**
   * 显示弹出层
   */
  show: () => Promise<void>
  /**
   * 隐藏弹出层
   */
  hide: () => void
  /**
   * 切换弹出层显示/隐藏
   */
  toggle: () => void
  /**
   * 更新弹出层位置
   */
  updatePosition: () => void
  /**
   * 销毁弹出层实例
   */
  destroy: () => void
  /** 浮层根节点（面板壳） */
  getPopupElement: () => HTMLElement | null
  /** trigger 与面板之间的透明桥接层（用于 hover 穿越） */
  getBridgeElement: () => HTMLElement | null
}

/** 浮层根节点内联样式（React CSSProperties） */
export type CwPopupStyle = CSSProperties

export type {
  VirtualElement,
  PopupConstraints,
  PopupState,
  PopupContext,
  PopupTrigger,
  PopupPluginFunction,
} from '@zengchaowu/ui-shared/components/CwPopup/types/state'
