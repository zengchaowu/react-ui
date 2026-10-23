export interface CwQuickAnswerProps {
  /**
   * 标签文本（如"肺结节"）
   */
  label?: string
  /**
   * 问题描述
   */
  description?: string
  /**
   * 条件列表
   */
  conditions?: string[]
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 当前选中的值（'yes' | 'no' | null）
   */
  value?: 'yes' | 'no' | null
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwQuickAnswerTexts>
  /**
   * 值变化（Vue `update:modelValue`）
   */
  onChange?: (value: 'yes' | 'no' | null) => void
  /**
   * 选择事件（Vue `change`，仅在选中时触发）
   */
  onSelect?: (value: 'yes' | 'no') => void
}

export interface CwQuickAnswerStyles {
  root: string
  label: string
  content: string
  description: string
  conditions: string
  conditionItem: string
  buttons: string
  buttonYes: string
  buttonNo: string
  buttonYesActive: string
  buttonNoActive: string
}

export interface CwQuickAnswerTexts {
  yes: string
  no: string
}

export interface CwQuickAnswerEmits {
  /**
   * 值变化事件
   */
  onChange?: (value: 'yes' | 'no' | null) => void
  /**
   * 选择事件
   */
  onSelect?: (value: 'yes' | 'no') => void
}
