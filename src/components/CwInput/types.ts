export type CwInputAppearance =
  | 'default'
  | 'pill'
  | 'search'
  | 'launchpad'
  | 'toolbar'
  | 'on-media'
  | 'on-media-dark'
  /** 复合控件内嵌：无边框透明底（如登录区号+手机号行） */
  | 'embedded'

export interface CwInputProps {
  /** 输入框的值 */
  modelValue?: string
  /** 输入框占位符 */
  placeholder?: string
  /** 输入框类型 */
  type?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /**
   * 展示用前缀：有内容时注入 input 值最前（如 1 → 显示 ¥1），
   * 编辑时拦截并剥离；modelValue 不含 prefix。
   */
  prefix?: string
  /** 文本对齐方式 */
  align?: 'left' | 'right'
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 官方外观（场景皮肤），不可 styles 覆盖 */
  appearance?: CwInputAppearance
  /** 自定义文本 */
  texts?: Partial<CwInputTexts>
}

export interface CwInputTexts {
  placeholder?: string
  label?: string
  clear?: string
}

export interface CwInputEmits {
  'update:modelValue': [value: string]
  'input': [value: string]
  'change': [value: string]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': []
  'keydown': [event: KeyboardEvent]
}
