import type { Placement } from '@zengchaowu/shared/types/placement'
import type {
  PopupPluginFunction,
  PopupState,
  PopupTrigger,
} from '@zengchaowu/ui-shared/components/CwPopup/types/state'
import type { CwTooltipAppearance, CwTooltipTexts } from '@zengchaowu/ui-shared/components/CwTooltip/types'

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
