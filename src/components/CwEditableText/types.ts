import type { HTMLAttributes } from 'react'
import type { CwIconEmbed } from '../CwIcon/types'
import type { CwInputTexts } from '../CwInput/types'

export type CwEditableTextEditIconVisibility = 'always' | 'hover' | 'never'

/** 场景外观：plain（默认，裸输入）/ 资料页单元格 / 标题行等 */
export type CwEditableTextAppearance = 'default' | 'field-inline' | 'title' | 'plain'

export interface CwEditableTextProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'onError'> {
  /** 当前值 */
  value?: string

  /** 异步修改函数，返回 Promise<boolean>，true 表示成功，false 或抛出错误表示失败 */
  asyncModify?: (newValue: string) => Promise<boolean>

  /** 挂载或变为 true 时自动进入编辑模式（如右键「重命名」） */
  defaultEditing?: boolean

  /** 浏览器拼写检查；文件名重命名等传 false */
  spellcheck?: boolean

  /** 是否禁用 */
  disabled?: boolean

  /** 是否只读 */
  readonly?: boolean

  /** 占位符文本 */
  placeholder?: string

  /** 文本对齐方式 */
  align?: 'left' | 'right'

  /** 场景外观；默认 `plain`（无边框裸输入）；`title` 编辑态同为裸输入 */
  appearance?: CwEditableTextAppearance

  /**
   * 编辑图标显示时机：
   * - always：始终显示（默认）
   * - hover：鼠标悬停 / 键盘聚焦预览区时显示
   * - never：不显示
   */
  editIconVisibility?: CwEditableTextEditIconVisibility

  /** 自定义文本 */
  texts?: Partial<CwEditableTextTexts>

  /** 值确认变更（确认编辑或异步保存成功后回调） */
  onChange?: (value: string) => void

  /** 异步保存成功 */
  onSuccess?: (value: string) => void

  /** 未修改就退出编辑，或按 Esc 取消 */
  onCancel?: () => void

  /** 异步保存失败 */
  onError?: (error: unknown) => void
}

/** @internal */
export interface CwEditableTextStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  previewContainer: string
  previewContainerNormal: string
  previewContainerDisabled: string
  previewContainerReadonly: string
  previewContainerFocused: string
  previewText: string
  previewTextNormal: string
  previewTextDisabled: string
  previewTextReadonly: string
  previewTextEmpty: string
  previewTextAlign: string
  /** 保存中展示的文本（与预览同行，后接 overlayAnchor） */
  savingText?: string
  editIconContainer: string
  editIconContainerNormal: string
  editIconContainerDisabled: string
  editIconContainerReadonly: string
  editIconContainerVisible: string
  editIconContainerHoverReveal: string
  overlayAnchor: string
  overlayLoading: string
  editContainer: string
  loadingContainer: string
  loadingContainerInField: string
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
