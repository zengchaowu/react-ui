import type { HTMLAttributes, MouseEvent } from 'react'

export interface CwCornerClosableWrapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClose'> {
  closable?: boolean
  disabled?: boolean
  rounded?: boolean
  texts?: Partial<CwCornerClosableWrapTexts>
  /** 点击关闭钮时触发（禁用时不触发） */
  onClose?: (event: MouseEvent<HTMLDivElement>) => void
}

/** @internal */
export interface CwCornerClosableWrapStyles {
  root: string
  rootRounded: string
  rootSquare: string
  closeWrap: string
  closeWrapDisabled: string
  closeCircle: string
  closeCircleDisabled: string
}

export interface CwCornerClosableWrapTexts {
  closeLabel: string
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwCornerClosableWrapEmits {
  close: [event: MouseEvent]
}
