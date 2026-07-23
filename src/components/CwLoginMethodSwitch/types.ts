/** 登录方式类型 */
export type LoginMethodType = 'qrcode' | 'phone'

/** 登录方式选项 */
export interface CwLoginMethodSwitchOption {
  /** 显示标签 */
  label: string
  /** 选项值 */
  value: LoginMethodType
  /** 是否禁用 */
  disabled?: boolean
}

export interface CwLoginMethodSwitchStyles {
  root: string
  rootDisabled: string
  badge: string
  toggleHit: string
  toggleHitDisabled: string
  toggleHitEnabled: string
  clipWrap: string
  clipInner: string
  iconWrap: string
}

export interface CwLoginMethodSwitchTexts {
  qrcodeOptionLabel: string
  phoneOptionLabel: string
}

export interface CwLoginMethodSwitchProps {
  /** 当前选中值 */
  modelValue?: LoginMethodType
  /**
   * 选项列表；不传时使用 {@link CwLoginMethodSwitchTexts} 中的默认两条（扫码 / 手机）
   */
  options?: CwLoginMethodSwitchOption[]
  /** 是否禁用 */
  disabled?: boolean
  styles?: Partial<CwLoginMethodSwitchStyles>
  texts?: Partial<CwLoginMethodSwitchTexts>
}

export interface CwLoginMethodSwitchEmits {
  'update:modelValue': [value: LoginMethodType]
  'change': [value: LoginMethodType]
}
