import type { HTMLAttributes, ReactNode } from 'react'
import type { CwTooltipProps } from '../CwTooltip/types'
import type { CwButtonAppearance } from '@zengchaowu/ui-shared/components/CwButton/types'
import type { CwButtonTexts } from '@zengchaowu/ui-shared/components/CwButton/types'

export type CwButtonType = 'default' | 'primary' | 'danger'

export type CwButtonVariant = 'solid' | 'outline' | 'text' | 'dashed' | 'ghost' | 'overlay'

/** Tooltip 外观变体（与 CwTooltip 保持一致） */
type CwTooltipAppearance = 'default' | 'inline' | 'mention'

/** Tooltip 文本配置（与 CwTooltip 保持一致） */
interface CwTooltipTexts {
  trigger: string
  content: string
}

export interface CwButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onClick'> {
  /**
   * 按钮类型（仅 default/primary/danger）
   */
  type?: CwButtonType
  /**
   * 按钮展示形态
   */
  variant?: CwButtonVariant
  /**
   * 官方外观（布局/场景），与 type/variant/size 组合使用
   */
  appearance?: CwButtonAppearance
  /**
   * 选中态（仅 list-item / preset 生效）
   */
  selected?: boolean
  /**
   * 按钮尺寸
   */
  size?: 'compact' | 'small' | 'medium' | 'large'
  /**
   * 按钮形状
   */
  shape?: 'square' | 'rounded' | 'circle'
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否加载中
   */
  loading?: boolean
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwButtonTexts>
  /**
   * Tooltip 内容（提供字符串或结合 tooltipSlot 使用）
   */
  tooltip?: string
  /**
   * Tooltip 自定义配置
   */
  tooltipProps?: Partial<
    Omit<CwTooltipProps, 'appearance' | 'texts' | 'content' | 'modelValue' | 'trigger'>
  >
  /** Tooltip 外观 */
  tooltipAppearance?: CwTooltipAppearance
  /** Tooltip 触发器布局 class */
  tooltipClass?: string
  /**
   * Tooltip 文本配置
   */
  tooltipTexts?: Partial<CwTooltipTexts>
  /**
   * Tooltip 内容插槽
   */
  tooltipSlot?: ReactNode
  /**
   * 默认插槽内容
   */
  children?: ReactNode
  className?: string
  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent | KeyboardEvent) => void
}

export interface CwButtonEmits {
  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent | KeyboardEvent) => void
}
