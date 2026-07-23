import type { Placement } from '@zengchaowu/shared/types/placement'
import type { PopupTrigger, PopupPluginFunction } from '../CwPopup/types/state'

/** 内部结构类（不对外暴露 styles 覆盖） */
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
  modelValue?: boolean
  /** 场景外观；禁止 styles，布局用原生 class */
  appearance?: CwTooltipAppearance
  texts?: Partial<CwTooltipTexts>
}

export interface CwTooltipEmits {
  (e: 'visibleChange', visible: boolean): void
  (e: 'update:modelValue', visible: boolean): void
  (e: 'triggerResize', size: { width: number; height: number }): void
}
