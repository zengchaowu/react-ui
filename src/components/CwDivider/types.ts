export interface CwDividerProps {
  /**
   * 是否垂直方向
   */
  vertical?: boolean
  /**
   * 是否显示
   */
  show?: boolean
  /**
   * 是否启用「头发丝」超细分割线（0.5px 物理像素）
   * @default true
   */
  hairline?: boolean
  /**
   * - `standalone`：常规分割线（根 + 方向几何 class）
   * - `embedded`：仅根 class + 外层 `class`（如 Cell 内下划线，线条由外层 border 定义）
   */
  layout?: 'standalone' | 'embedded'
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwDividerTexts>
}

export interface CwDividerStyles {
  root: string
  horizontal: string
  vertical: string
  /** 启用 hairline 时的水平方向样式（覆盖 horizontal） */
  hairlineHorizontal: string
  /** 启用 hairline 时的垂直方向样式（覆盖 vertical） */
  hairlineVertical: string
}

export interface CwDividerTexts {
  // CwDivider组件本身没有硬编码文本
}

export interface CwDividerEmits {
  // CwDivider 不发出事件
}
