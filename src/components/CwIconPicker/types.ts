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
  /** 图标显示内容（iconfont font_class 或 emoji） */
  content: string
  /** 图标类型 */
  type: 'asset' | 'emoji'
  /** 图标标签（用于搜索） */
  label?: string
  /** asset 前缀（仅当 type 为 asset 时使用） */
  prefix?: string
}

export interface CwIconPickerProps {
  /** 当前选中的图标值（对应 Vue `modelValue`） */
  value?: string
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
  /** 自定义文本 */
  texts?: Partial<CwIconPickerTexts>
  /** 追加到根节点的 class（对应 Vue `attrs.class`） */
  className?: string
  /** 对应 Vue `update:modelValue` */
  onChange?: (value: string) => void
  /** 选择图标时触发（对应 Vue `select`） */
  onSelect?: (value: string, item: IconItem) => void
  /** 恢复默认时触发（对应 Vue `reset`） */
  onReset?: () => void
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
  /** 内容区域（CwDiv 根） */
  content: string
  /** 内容内边距（CwDiv contentClass） */
  contentInner: string
  /** 分类容器 */
  category: string
  /** 分类标题 */
  categoryTitle: string
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


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwIconPickerEmits {
  /** 更新 v-model */
  'update:modelValue': [value: string]
  /** 选择图标时触发 */
  'select': [value: string, item: IconItem]
  /** 恢复默认时触发 */
  'reset': []
}
