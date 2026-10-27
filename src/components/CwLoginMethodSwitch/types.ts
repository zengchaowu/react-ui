import type { LoginMethodType, CwLoginMethodSwitchOption, CwLoginMethodSwitchTexts } from '@zengchaowu/ui-shared/components/CwLoginMethodSwitch/types'


export interface CwLoginMethodSwitchProps {
  /** 当前选中值 */
  value?: LoginMethodType
  /**
   * 选项列表；不传时使用 {@link CwLoginMethodSwitchTexts} 中的默认两条（扫码 / 手机）
   */
  options?: CwLoginMethodSwitchOption[]
  /** 是否禁用 */
  disabled?: boolean
  texts?: Partial<CwLoginMethodSwitchTexts>
  /** 切换登录方式 */
  onChange?: (value: LoginMethodType) => void
  className?: string
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwLoginMethodSwitchEmits {
  'update:modelValue': [value: LoginMethodType]
  'change': [value: LoginMethodType]
}
