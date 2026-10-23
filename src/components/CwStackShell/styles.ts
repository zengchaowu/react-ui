import type { CwStackShellStyles } from './types'

export const stackShellBase: CwStackShellStyles = {
  root: 'flex h-full min-h-0 w-full flex-col',
  stackRoot: 'flex h-full min-h-0 min-w-0 flex-1 flex-col',
  /** 全屏：不透明页底；contentInset 时由 slot 页自带背景 */
  layer: 'flex h-full min-h-0 w-full flex-col bg-[var(--bg-color-page)]',
  layerInset: 'flex h-full min-h-0 w-full flex-col',
}
