import type { ReactNode } from 'react'

import type { CwSelectTagsTexts } from '@zengchaowu/ui-shared/components/CwSelectTags/types'

export interface CwSelectTagsTag {
  label: string
  value: string | number
}

export interface CwSelectTagsProps {
  /** 标签列表 */
  tags?: CwSelectTagsTag[]
  /** 已选中的标签值列表（对应 Vue `modelValue`） */
  value?: Array<string | number>
  /** 是否全选（如果不传入，会根据 tags 和 value 自动判断） */
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
  /** 自定义文本 */
  texts?: Partial<CwSelectTagsTexts>
  /** 具名插槽 suffix（右侧后缀区，由 CwSelect 等多选场景注入） */
  suffixSlot?: ReactNode
  /** 值更新事件（对应 Vue `update:modelValue` + `change`） */
  onChange?: (value: Array<string | number>, selectAll: boolean) => void
  /** 全选状态更新事件（对应 Vue `update:selectAll`） */
  onSelectAllChange?: (value: boolean) => void
  /** 点击标签事件 */
  onTagClick?: (tag: CwSelectTagsTag, event: MouseEvent) => void
  /** 删除标签事件 */
  onTagClose?: (tag: CwSelectTagsTag, event: MouseEvent) => void
  /** 点击更多事件 */
  onMoreClick?: (event: MouseEvent) => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}

export interface CwSelectTagsEmits {
  /** 值更新事件 */
  'update:modelValue': [value: Array<string | number>]
  /** 全选状态更新事件 */
  'update:selectAll': [value: boolean]
  /** 变化事件 */
  'change': [value: Array<string | number>, selectAll: boolean]
  /** 点击标签事件 */
  'tag-click': [tag: CwSelectTagsTag, event: MouseEvent]
  /** 删除标签事件 */
  'tag-close': [tag: CwSelectTagsTag, event: MouseEvent]
  /** 点击更多事件 */
  'more-click': [event: MouseEvent]
  /** 聚焦事件 */
  'focus': [event: FocusEvent]
  /** 失焦事件 */
  'blur': [event: FocusEvent]
}
