export type CwWalletPayPasswordPanelMode = 'verify' | 'setup'

export type CwWalletPayPasswordPanelPresentation = 'page' | 'sheet'

export type CwWalletPayPasswordPanelProps = {
  mode: CwWalletPayPasswordPanelMode
  /** 嵌入独立路由页时由外层 NavBar 承担标题与返回 */
  embedded?: boolean
  /** page：全屏页；sheet：半屏弹层 */
  presentation?: CwWalletPayPasswordPanelPresentation
  submitPassword: (password: string) => Promise<void>
}

export type CwWalletPayPasswordPanelEmits = {
  cancel: []
  complete: [password: string]
}
