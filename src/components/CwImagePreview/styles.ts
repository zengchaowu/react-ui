import type { CwImagePreviewStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const imagePreviewBase: CwImagePreviewStyles = {
  // 根容器：基础 + 状态
  root: 'cw-image-preview relative w-full h-full overflow-hidden touch-none select-none outline-none focus:outline-none',
  rootPanDelegated:
    'cw-image-preview relative w-full h-full overflow-hidden touch-manipulation select-none outline-none focus:outline-none',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 交互容器：用于承载 CwImageFit 和交互事件
  viewport: 'relative w-full h-full',
  viewportFocused: INTERACTIVE_FOCUS_CLASS,

  // 控件容器（目前预留，支持用户自定义）
  controls: '',
}
