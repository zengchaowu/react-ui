import type { CwTooltipAppearance, CwTooltipProps, CwTooltipTexts } from '../CwTooltip/types'

export type CwButtonType = 'default' | 'primary' | 'danger'

export type CwButtonVariant = 'solid' | 'outline' | 'text' | 'dashed' | 'ghost' | 'overlay'

/**
 * 官方外观变体：业务侧只能选择，不可通过 styles 覆盖内部结构。
 */
export type CwButtonAppearance =
  | 'default'
  | 'icon'
  | 'chrome'
  | 'avatar'
  | 'backdrop'
  | 'tile'
  | 'desktop-icon'
  | 'dock'
  | 'list-item'
  | 'preset'
  | 'on-media'
  | 'on-media-text'
  | 'overlay-icon'

export interface CwButtonProps {
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
   * Tooltip 内容（提供字符串或结合 tooltip 插槽使用）
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
}

export interface CwButtonTexts {
  /**
   * 按钮的无障碍标签（aria-label）
   * 仅在按钮无文字内容（如纯图标按钮）时使用
   * 如果按钮有slot内容，此属性会被忽略
   */
  label?: string
}

export interface CwButtonEmits {
  /**
   * 点击事件
   */
  'click': [event: MouseEvent | KeyboardEvent]
}
