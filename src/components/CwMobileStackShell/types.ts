export type CwMobileStackShellMode = 'list' | 'detail'

export interface CwMobileStackShellProps {
  /** list 为根，detail 为 push 层 */
  stack: CwMobileStackShellMode
  /** 为 false 时关闭 CwStack 横向 push/pop 转场 */
  slideTransition?: boolean
}

export interface CwMobileStackShellStyles {
  root: string
  stackRoot: string
  layer: string
}

export interface CwMobileStackShellTexts {}

export interface CwMobileStackShellEmits {}
