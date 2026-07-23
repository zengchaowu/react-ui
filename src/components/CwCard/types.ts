export interface CwCardProps {
  /**
   * 是否可折叠（点击 header 展开/收起 body）
   */
  collapsible?: boolean
  /**
   * 默认是否展开（collapsible 为 true 时生效）
   */
  defaultExpanded?: boolean
  /**
   * 是否显示 header 底部分割线
   */
  showHeaderDivider?: boolean
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwCardStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwCardTexts>
}

export interface CwCardStyles {
  root: string
  header: string
  /** header 底部分割线（仅当 showHeaderDivider 为 true 时应用） */
  headerDivider?: string
  /** 可折叠时 header 的可点击态样式 */
  headerClickable?: string
  headerLeft: string
  headerRight: string
  body: string
}

export interface CwCardTexts {
  /** 展开/收起的无障碍标签 */
  expandAriaLabel?: (expanded: boolean) => string
}

export interface CwCardEmits {
  /** 折叠状态变化（collapsible 为 true 时触发） */
  'expand-change'?: [expanded: boolean]
}
