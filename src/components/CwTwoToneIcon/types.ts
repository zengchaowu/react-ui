export interface CwTwoToneIconStyles {
  root: string
}

export interface CwTwoToneIconTexts {}

export interface CwTwoToneIconProps {
  /**
   * 底层/主色图标的 iconfont 名称（symbol id）
   * @example 'icon-share-bg'
   */
  primaryName: string
  /**
   * 上层/强调色图标的 iconfont 名称（symbol id）
   * @example 'icon-share-arrow'
   */
  accentName: string
  /**
   * 主色（底层图标）
   * @default 'var(--text-color-secondary)'
   */
  primaryColor?: string
  /**
   * 强调色（上层图标）
   * @default 'var(--brand-color-6)'
   */
  accentColor?: string
  /**
   * 额外 class
   */
  className?: string
  texts?: Partial<CwTwoToneIconTexts>
}
