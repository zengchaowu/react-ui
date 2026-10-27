import type { IconPickerType, IconCategory, CwIconPickerTexts, IconItem } from '@zengchaowu/ui-shared/components/CwIconPicker/types'


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

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwIconPickerEmits {
  /** 更新 v-model */
  'update:modelValue': [value: string]
  /** 选择图标时触发 */
  'select': [value: string, item: IconItem]
  /** 恢复默认时触发 */
  'reset': []
}
