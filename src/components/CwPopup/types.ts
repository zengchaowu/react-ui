import type { Placement } from '@zengchaowu/shared/types/placement'
import type { PopupTrigger, PopupPluginFunction } from './types/state'

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
  virtualReference?: import('./types/state').VirtualElement
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

/**
 * CwPopup 组件 Props
 */
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
  virtualReference?: import('./types/state').VirtualElement
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwPopupStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwPopupTexts>
}

export interface CwPopupStyles {
  /** 勿包含 relative/absolute/fixed 等定位类，根节点由内部固定为 `fixed top-0 left-0` */
  popup: string
  trigger: string
}

export interface CwPopupTexts {
  // CwPopup组件本身没有硬编码文本
}

/**
 * CwPopup 组件 Emits
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
  state: import('./types/state').PopupState
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
}

export type {
  VirtualElement,
  PopupConstraints,
  PopupState,
  PopupContext,
  PopupTrigger,
  PopupPluginFunction,
} from './types/state'
