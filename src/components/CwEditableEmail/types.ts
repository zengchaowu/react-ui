import type {  CwIconEmbed  } from '../CwIcon/types'
import type { CwAutoCompleteEmailStyles, CwAutoCompleteEmailTexts } from '../CwAutoCompleteEmail/types'

export interface CwEditableEmailProps {
  /** 当前值 */
  modelValue?: string | null
  /** 异步修改函数，返回 Promise<boolean>，true 表示成功，false 或抛出错误表示失败 */
  asyncModify?: (newValue: string | null) => Promise<boolean>
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 文本对齐方式 */
  align?: 'left' | 'right'
  /** 邮箱后缀列表 */
  emailSuffixes?: string[]
  /** 输入防抖毫秒 */
  debounce?: number
  /** 自定义样式 */
  styles?: Partial<CwEditableEmailStyles>
  /** 自定义文本 */
  texts?: Partial<CwEditableEmailTexts>
}

export interface CwEditableEmailStyles {
  /** 根容器基础样式 */
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  /** 预览容器基础样式 */
  previewContainer: string
  previewContainerNormal: string
  previewContainerDisabled: string
  previewContainerReadonly: string
  previewContainerFocused: string
  /** 预览文本基础样式 */
  previewText: string
  previewTextNormal: string
  previewTextDisabled: string
  previewTextReadonly: string
  previewTextEmpty: string
  previewTextAlign: string
  /** 编辑图标容器基础样式 */
  editIconContainer: string
  editIconContainerNormal: string
  editIconContainerDisabled: string
  editIconContainerReadonly: string
  /** 编辑容器基础样式 */
  editContainer: string
  /** Loading 容器基础样式 */
  loadingContainer: string
  /** CwAutoCompleteEmail 样式配置 */
  autoCompleteEmailStyles?: Partial<CwAutoCompleteEmailStyles>
  /** CwIcon 样式配置 */
  iconStyles?: CwIconEmbed
}

export interface CwEditableEmailTexts {
  /** 编辑图标标签 */
  edit?: string
  /** 占位符文本 */
  placeholder?: string
  /** CwAutoCompleteEmail 文本配置 */
  autoCompleteEmailTexts?: Partial<CwAutoCompleteEmailTexts>
}

export interface CwEditableEmailEmits {
  /** 值更新事件 */
  'update:modelValue': [value: string | null]
  /** 修改成功事件 */
  'success': [value: string | null]
  /** 修改失败事件 */
  'error': [error: any]
}

