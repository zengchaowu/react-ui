import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwSelectTagsProps {
  /** 标签列表 */
  tags?: Array<{ label: string; value: string | number }>
  /** 已选中的标签值列表 */
  modelValue?: Array<string | number>
  /** 是否全选（如果不传入，会根据 tags 和 modelValue 自动判断） */
  selectAll?: boolean
  /**
   * 全选时是否折叠为单个「全选」标签；默认 true。
   * 设为 false 时仍显示各选中项标签（适合窄栏筛选等场景）。
   */
  collapseSelectAll?: boolean
  /** 最大显示行数 */
  maxRows?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 是否显示删除按钮 */
  closable?: boolean
  /** 标签尺寸 */
  tagSize?: 'small' | 'medium' | 'large'
  /** 触发器容器尺寸（与 CwInput 一致）；未指定 tagSize 时内嵌 tag 会比容器小一档 */
  size?: 'small' | 'medium' | 'large'
  /** 标签类型 */
  tagType?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 全选标签文本 */
  selectAllText?: string
  /** 加号标签文本 */
  moreText?: string
  /** 自定义样式 */
  styles?: Partial<CwSelectTagsStyles>
  /** 自定义文本 */
  texts?: Partial<CwSelectTagsTexts>
}

export interface CwSelectTagsStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  label: string
  labelNormal: string
  labelDisabled: string
  tagsWrapper: string
  tagsWrapperNormal: string
  tagsWrapperReadonly: string
  tagsWrapperFocus: string
  tagsWrapperDisabled: string
  tagsContainer: string
  /** 右侧后缀区（清除、下拉箭头等，由 CwSelect 等多选场景注入） */
  suffix: string
  tagItem: string
  moreTag: string
  placeholder: string
  placeholderNormal: string
  placeholderDisabled: string
  /** 尺寸样式：小（容器和占位符） */
  sizeSmall?: string
  /** 尺寸样式：中（容器和占位符） */
  sizeMedium?: string
  /** 尺寸样式：大（容器和占位符） */
  sizeLarge?: string
  /** 占位符尺寸样式：小 */
  placeholderSizeSmall?: string
  /** 占位符尺寸样式：中 */
  placeholderSizeMedium?: string
  /** 占位符尺寸样式：大 */
  placeholderSizeLarge?: string
  /** CwIcon 样式配置 */
  moreIconStyles?: CwIconEmbed
}

export interface CwSelectTagsTexts {
  placeholder?: string
  label?: string
  selectAll?: string
  more?: string
}

export interface CwSelectTagsEmits {
  /** 值更新事件 */
  'update:modelValue': [value: Array<string | number>]
  /** 全选状态更新事件 */
  'update:selectAll': [value: boolean]
  /** 变化事件 */
  'change': [value: Array<string | number>, selectAll: boolean]
  /** 点击标签事件 */
  'tag-click': [tag: { label: string; value: string | number }, event: MouseEvent]
  /** 删除标签事件 */
  'tag-close': [tag: { label: string; value: string | number }, event: MouseEvent]
  /** 点击更多事件 */
  'more-click': [event: MouseEvent]
  /** 聚焦事件 */
  'focus': [event: FocusEvent]
  /** 失焦事件 */
  'blur': [event: FocusEvent]
}

