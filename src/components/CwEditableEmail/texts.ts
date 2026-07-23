import type { CwEditableEmailTexts } from './types'

export const defaultTexts: CwEditableEmailTexts = {
  edit: '编辑',
  placeholder: '请输入邮箱',
  // CwAutoCompleteEmail -> CwAutoComplete -> CwInput 多层文本配置
  autoCompleteEmailTexts: {
    placeholder: '请输入邮箱',
    // CwAutoComplete 文本配置
    autoCompleteTexts: {
      placeholder: '请输入邮箱',
      clear: '清除'
    }
  }
}

