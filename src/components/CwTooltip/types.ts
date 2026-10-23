import type { Placement } from '@zengchaowu/shared/types/placement'
import type {
  PopupPluginFunction,
  PopupState,
  PopupTrigger,
} from '../CwPopup/types/state'

/** 内部结构 class 槽位 */
export interface CwTooltipStyles {
  root: string
  fallbackTrigger: string
  popup: string
  content: string
  arrow: string
}

/**
 * 外观变体：
 * - `default`：块级/列宽触发（含 `w-full`）
 * - `inline`：行内触发（芯片、工具条图标、状态点）
 * - `mention`：@人 chip（行内 + 更紧凑弹出层）
 */
export type CwTooltipAppearance = 'default' | 'inline' | 'mention'

export interface CwTooltipTexts {
  trigger: string
  content: string
}

/** 作用域插槽参数（默认插槽 / trigger 插槽） */
export interface CwTooltipSlotScope {
  visible: boolean
  id: string
}

export interface CwTooltipProps {
  id?: string
  content?: string
  placement?: Placement
  trigger?: PopupTrigger
  showDelay?: number
  hideDelay?: number
  offset?: number
  arrowMargin?: number
  showArrow?: boolean
  closeOnClickOutside?: boolean
  viewportPadding?: number
  flip?: boolean
  plugins?: PopupPluginFunction[]
  /** v-model：仅 `trigger="manual"` 时生效 */
  value?: boolean
  /** 场景外观；布局用原生 class */
  appearance?: CwTooltipAppearance
  texts?: Partial<CwTooltipTexts>
}

export interface CwTooltipEmits {
  onVisibleChange?: (visible: boolean) => void
  onChange?: (visible: boolean) => void
  onTriggerResize?: (size: { width: number; height: number }) => void
}

/** `defineExpose` 暴露的实例 API */
export interface CwTooltipInstance {
  show: () => Promise<void> | undefined
  hide: () => void
  toggle: () => void
  updatePosition: () => void
  getState: () => PopupState | undefined
  isVisible: () => boolean
}
