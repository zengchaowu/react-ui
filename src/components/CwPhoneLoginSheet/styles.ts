import type { CwPhoneLoginSheetStyles } from './types'
import { defaultStyles as dialogDefaultStyles } from '../CwPhoneLoginDialog/styles'

export const defaultStyles: CwPhoneLoginSheetStyles = {
  ...dialogDefaultStyles,
  // Sheet 版本的样式：横向与外层 body（p-4）对齐，不在此重复加 px；保留底部 pb 与按钮区呼吸感
  content: 'min-w-0 w-full px-0 pb-4',
  inputGroup: 'mb-2',
  // 减小按钮组的上边距
  buttonGroup: 'mt-1 w-full',
}

