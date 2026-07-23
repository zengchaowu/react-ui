export type IconPickerType = 'icon' | 'emoji'

export interface IconCategory {
  /** 分类名称 */
  name: string
  /** 分类下的图标列表 */
  icons: IconItem[]
}

export interface IconItem {
  /** 图标标识 */
  value: string
  /** 图标显示内容（SVG 字符串、emoji 或 iconfont 名称） */
  content: string
  /** 图标类型 */
  type: 'iconfont' | 'svg' | 'emoji'
  /** 图标标签（用于搜索） */
  label?: string
  /** iconfont 前缀（仅当 type 为 iconfont 时使用） */
  prefix?: string
}

export interface CwIconPickerProps {
  /** 当前选中的图标值 */
  modelValue?: string
  /** 图标类型（图标或表情） */
  type?: IconPickerType
  /** 图标分类列表 */
  categories?: IconCategory[]
  /** 默认图标值 */
  defaultValue?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否使用 emoji 动图（当前 CDN 仅静态，预留扩展） */
  emojiAnimated?: boolean
  /** 自定义样式 */
  styles?: Partial<CwIconPickerStyles>
  /** 自定义文本 */
  texts?: Partial<CwIconPickerTexts>
}

export interface CwIconPickerStyles {
  /** 根容器 */
  root: string
  /** 头部区域 */
  header: string
  /** 标签页容器 */
  tabs: string
  /** 恢复默认按钮 */
  resetButton: string
  /** 搜索框容器 */
  searchWrapper: string
  /** 内容区域 */
  content: string
  /** 分类容器 */
  category: string
  /** 分类标题 */
  categoryTitle: string
  /** 图标列表容器 */
  iconList: string
  /** 图标项 */
  iconItem: string
  /** 图标项激活状态 */
  iconItemActive: string
  /** 图标项悬停状态 */
  iconItemHover: string
  /** 图标内容 */
  iconContent: string
  /** Emoji 图片样式 */
  emojiImage?: string
}

export interface CwIconPickerTexts {
  /** 图标标签页文本 */
  iconTab?: string
  /** Emoji 标签页文本 */
  emojiTab?: string
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 恢复默认按钮文本 */
  resetButtonText?: string
}

export interface CwIconPickerEmits {
  /** 更新 v-model */
  'update:modelValue': [value: string]
  /** 选择图标时触发 */
  'select': [value: string, item: IconItem]
  /** 恢复默认时触发 */
  'reset': []
}
