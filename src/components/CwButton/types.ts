import type { HTMLAttributes, ReactNode } from 'react'
import type { CwTooltipProps } from '../CwTooltip/types'

export type CwButtonType = 'default' | 'primary' | 'danger'

export type CwButtonVariant = 'solid' | 'outline' | 'text' | 'dashed' | 'ghost' | 'overlay'

/**
 * 官方外观变体。
 */
export type CwButtonAppearance =
  | 'default'
  | 'icon'
  /** 行内紧凑：固定高度、仅水平 padding（单行文字/数字） */
  | 'inline-fixed'
  /** 行内宽松：自适应高度、含垂直 padding（图标/头像 + 文案） */
  | 'inline-padded'
  | 'avatar'
  | 'backdrop'
  | 'tile'
  | 'grid-column'
  | 'bar-slot'
  | 'list-item'
  | 'preset'
  | 'surface-light'
  | 'text-on-image'
  | 'overlay-icon'

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

export interface CwButtonTexts {
  /**
   * 按钮的无障碍标签（aria-label）
   * 仅在按钮无文字内容（如纯图标按钮）时使用
   * 如果按钮有 children 内容，此属性会被忽略
   */
  label?: string
}

export interface CwButtonEmits {
  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent | KeyboardEvent) => void
}
