export type CwWalletPayPasswordPanelMode = 'verify' | 'setup'

export type CwWalletPayPasswordPanelPresentation = 'page' | 'sheet'

export interface CwWalletPayPasswordPanelProps {
  mode: CwWalletPayPasswordPanelMode
  /** 嵌入独立路由页时由外层 NavBar 承担标题与返回 */
  embedded?: boolean
  /** page：全屏页；sheet：半屏弹层 */
  presentation?: CwWalletPayPasswordPanelPresentation
  submitPassword: (password: string) => Promise<void>
  /** 返回 / 取消 */
  onCancel?: () => void
  /** 密码校验或设置完成 */
  onComplete?: (password: string) => void
  className?: string
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export type CwWalletPayPasswordPanelEmits = {
  cancel: []
  complete: [password: string]
}

