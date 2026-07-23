/** 基础节点属性 */
interface BaseNode {
  /** 自定义内联样式（可选，用于覆盖默认样式） */
  style?: Record<string, string>
}

/** 文本节点 */
export interface TextNode extends BaseNode {
  type: 'text'
  text: string
}

/** 链接节点 */
export interface LinkNode extends BaseNode {
  type: 'link'
  href: string
  text?: string
  children?: CwRichTextNode[]
}

/** 格式节点（粗体、斜体、下划线） */
export interface FormatNode extends BaseNode {
  type: 'bold' | 'italic' | 'underline'
  text?: string
  children?: CwRichTextNode[]
}

/** 换行节点 */
export interface BrNode {
  type: 'br'
}

/** 富文本 DSL 节点（联合类型） */
export type CwRichTextNode = TextNode | LinkNode | FormatNode | BrNode

/** 兼容旧版本的别名 */
export type RichTextNode = CwRichTextNode

/** 样式定义（只包含 class 名称） */
export interface CwRichTextStyles {
  /** 根容器样式（布局） */
  root: string
  /** 根容器：状态（互斥） */
  rootNormal?: string
  rootDisabled?: string
  rootReadonly?: string
  /** 普通文本样式 */
  text: string
  /** 链接样式 */
  link: string
  /** 链接：状态（互斥） */
  linkNormal?: string
  linkDisabled?: string
  linkReadonly?: string
  /** 链接：聚焦样式（仅键盘导航时显示） */
  linkFocused?: string
  /** 粗体文本样式 */
  bold: string
  /** 斜体文本样式 */
  italic: string
  /** 下划线文本样式 */
  underline: string
  /** 尺寸样式：小 */
  sizeSmall: string
  /** 尺寸样式：中 */
  sizeMedium: string
  /** 尺寸样式：大 */
  sizeLarge: string
}

/** 文本定义（用于无障碍等场景） */
export interface CwRichTextTexts {
  /** 链接 aria-label 前缀，例如“链接：” */
  linkAriaLabelPrefix: string
}

export interface CwRichTextProps {
  /** DSL 配置对象（节点数组） */
  dsl: CwRichTextNode[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 富文本尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 样式配置（部分覆盖默认样式） */
  styles?: Partial<CwRichTextStyles>
  /** 文本配置（部分覆盖默认文本） */
  texts?: Partial<CwRichTextTexts>
}

export interface CwRichTextEmits {
  /** 链接点击事件 */
  'link-click': [href: string, event: MouseEvent]
}

