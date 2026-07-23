import type {  CwIconEmbed  } from '../CwIcon/types'
import type { CwInputTexts } from '../CwInput/types'

export type CwEditableTextEditIconVisibility = 'always' | 'hover'

export interface CwEditableTextProps {
  /** 当前值 */
  modelValue?: string
  /** 异步修改函数，返回 Promise<boolean>，true 表示成功，false 或抛出错误表示失败 */
  asyncModify?: (newValue: string) => Promise<boolean>
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 文本对齐方式 */
  align?: 'left' | 'right'
  /**
   * 编辑图标显示时机：
   * - always：始终显示（默认）
   * - hover：鼠标悬停 / 键盘聚焦预览区时显示
   */
  editIconVisibility?: CwEditableTextEditIconVisibility
  /** 自定义样式 */
  styles?: Partial<CwEditableTextStyles>
  /** 自定义文本 */
  texts?: Partial<CwEditableTextTexts>
}

export interface CwEditableTextStyles {
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
  /** editIconVisibility=hover 时附加：绝对定位不占布局，默认隐藏，悬停/聚焦预览区时显示 */
  editIconContainerHoverReveal: string
  /** 编辑容器基础样式 */
  editContainer: string
  /** Loading 容器基础样式 */
  loadingContainer: string
  /** CwInput 文本配置 */
  inputTexts?: Partial<CwInputTexts>
  /** CwIcon 样式配置 */
  iconStyles?: CwIconEmbed
}

export interface CwEditableTextTexts {
  /** 编辑图标标签 */
  edit?: string
  /** 占位符文本 */
  placeholder?: string
  /** CwInput 文本配置 */
  inputTexts?: Partial<CwInputTexts>
}

export interface CwEditableTextEmits {
  /** 值更新事件 */
  'update:modelValue': [value: string]
  /** 修改成功事件 */
  'success': [value: string]
  /** 修改失败事件 */
  'error': [error: any]
}

