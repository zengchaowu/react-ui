import type { CwChromeTabItem, CwChromeTabTexts } from './types'

export type ChromeTabContextAction =
  | 'close'
  | 'close-others'
  | 'close-to-the-right'
  | 'close-all'

/** 右键菜单项（对应 CwContextMenu `CwContextMenuItem` 的子集） */
export interface ChromeTabContextMenuItem {
  key: ChromeTabContextAction
  label: string
  disabled?: boolean
}

export function isChromeTabClosable(
  tab: Pick<CwChromeTabItem, 'closable'> | undefined,
  closable: boolean,
): boolean {
  if (!closable || !tab) return false
  if (tab.closable === false) return false
  return true
}

export function resolveChromeTabCloseTargetIds(
  action: ChromeTabContextAction,
  tabs: CwChromeTabItem[],
  index: number,
  closable: boolean,
): Array<string | number> {
  const current = tabs[index]
  if (!current) return []

  if (action === 'close') {
    return isChromeTabClosable(current, closable) ? [current.id] : []
  }

  if (action === 'close-others') {
    return tabs
      .filter((tab, i) => i !== index && isChromeTabClosable(tab, closable))
      .map((tab) => tab.id)
  }

  if (action === 'close-to-the-right') {
    return tabs
      .filter((tab, i) => i > index && isChromeTabClosable(tab, closable))
      .map((tab) => tab.id)
  }

  return tabs.filter((tab) => isChromeTabClosable(tab, closable)).map((tab) => tab.id)
}

export function buildChromeTabContextMenuItems(
  tabs: CwChromeTabItem[],
  index: number,
  options: { closable: boolean; texts: CwChromeTabTexts },
): ChromeTabContextMenuItem[] {
  const { closable, texts } = options
  return [
    {
      key: 'close',
      label: texts.closeTabMenuLabel,
      disabled: resolveChromeTabCloseTargetIds('close', tabs, index, closable).length === 0,
    },
    {
      key: 'close-others',
      label: texts.closeOtherTabsMenuLabel,
      disabled:
        resolveChromeTabCloseTargetIds('close-others', tabs, index, closable).length === 0,
    },
    {
      key: 'close-to-the-right',
      label: texts.closeTabsToTheRightMenuLabel,
      disabled:
        resolveChromeTabCloseTargetIds('close-to-the-right', tabs, index, closable)
          .length === 0,
    },
    {
      key: 'close-all',
      label: texts.closeAllTabsMenuLabel,
      disabled: resolveChromeTabCloseTargetIds('close-all', tabs, index, closable).length === 0,
    },
  ]
}
