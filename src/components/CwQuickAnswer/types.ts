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
  modelValue?: 'yes' | 'no' | null
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwQuickAnswerStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwQuickAnswerTexts>
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
  'update:modelValue': [value: 'yes' | 'no' | null]
  /**
   * 选择事件
   */
  'change': [value: 'yes' | 'no']
}
