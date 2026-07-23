import type { CwContextMenuStyles } from '../CwContextMenu/types'
import { attachCwContextMenuStyles } from '../CwContextMenu/styles'

/**
 * @deprecated 请改用 `showCwContextMenu({ appearance: 'attach' })`
 */
export const defaultCwAttachContextMenuStyles: CwContextMenuStyles =
  attachCwContextMenuStyles
