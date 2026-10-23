import type { CwCascaderSheetStyles } from './types'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'

/**
 * 级联列贴边铺满：body 不再套 p-4。
 * 面板内容样式见 CwCascaderPanel appearance=sheet。
 */
export const CASCADER_SHEET_BODY_CLASS = 'overflow-hidden p-0'

export const cascaderSheetBase: CwCascaderSheetStyles = {
  headerContainer: 'flex items-center justify-between',
  headerTitle: CW_OVERLAY_HEADER_TITLE_CLASS,
}
