export { default as CwChromeTab } from './CwChromeTab'
export { defaultTexts as defaultCwChromeTabTexts } from './texts'
export {
  buildChromeTabContextMenuItems,
  isChromeTabClosable,
  resolveChromeTabCloseTargetIds,
} from './chromeTabContextMenu'
export type { ChromeTabContextAction, ChromeTabContextMenuItem } from './chromeTabContextMenu'
export type {
  CwChromeTabItem,
  CwChromeTabAppearance,
  CwChromeTabEmits,
  CwChromeTabIconScope,
  CwChromeTabProps,
  CwChromeTabStyles,
  CwChromeTabTexts,
} from './types'
