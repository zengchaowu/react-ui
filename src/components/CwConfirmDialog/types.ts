import type { CwButtonType } from '../CwButton/types'

import type { CwDynamicDialogConfig } from '../CwDynamicDialog/types'

import type { CwConfirmDialogTexts } from '@zengchaowu/ui-shared/components/CwConfirmDialog/types'

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
   * 是否在正文区展示大标题
   * @default false
   */
  showTitleInContent?: boolean
  /**
   * 自定义文本配置
   */
  texts?: Partial<CwConfirmDialogTexts>
  /**
   * CwDynamicDialog 配置
   */
  dialogConfig?: CwDynamicDialogConfig
}

