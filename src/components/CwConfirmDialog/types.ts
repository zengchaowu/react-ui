import type { CwButtonTexts, CwButtonType } from '../CwButton/types'
import type { CwDynamicDialogConfig, CwDynamicDialogStyles, CwDynamicDialogTexts } from '../CwDynamicDialog/types'

export interface CwConfirmDialogOptions {
  /**
   * 对话框标题
   */
  title?: string
  /**
   * 对话框内容/消息
   */
  message?: string
  /**
   * 确认按钮文本
   */
  confirmText?: string
  /**
   * 取消按钮文本
   */
  cancelText?: string
  /**
   * 确认按钮类型
   */
  confirmType?: CwButtonType
  /**
   * 取消按钮类型
   */
  cancelType?: CwButtonType
  /**
   * 是否显示取消按钮
   */
  showCancel?: boolean
  /**
   * 是否在顶栏展示标题（与 showTitleInContent 择一即可，避免重复）
   * @default true
   */
  showTitleInHeader?: boolean
  /**
   * 是否在正文区展示大标题（styles.title）
   * @default false
   */
  showTitleInContent?: boolean
  /**
   * 自定义样式配置
   */
  styles?: Partial<CwConfirmDialogStyles>
  /**
   * 自定义文本配置
   */
  texts?: Partial<CwConfirmDialogTexts>
  /**
   * CwDynamicDialog 配置
   */
  dialogConfig?: CwDynamicDialogConfig
}

export interface CwConfirmDialogStyles {
  /**
   * 对话框样式
   */
  dialogStyles?: Partial<CwDynamicDialogStyles>
  /**
   * 内容容器样式
   */
  content?: string
  /**
   * 标题样式
   */
  title?: string
  /**
   * 消息样式
   */
  message?: string
  /**
   * 按钮容器样式
   */
  footer?: string
}

export interface CwConfirmDialogTexts {
  /**
   * 对话框文本配置
   */
  dialogTexts?: Partial<CwDynamicDialogTexts>
  /**
   * 确认按钮文本配置
   */
  confirmButtonTexts?: Partial<CwButtonTexts>
  /**
   * 取消按钮文本配置
   */
  cancelButtonTexts?: Partial<CwButtonTexts>
}

export type CwConfirmDialogResult = 'confirm' | 'cancel'

