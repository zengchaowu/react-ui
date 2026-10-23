import type { HTMLAttributes, ReactNode } from 'react'

export interface CwSettingsPageTexts {
  backLabel: string
}

export interface CwSettingsPageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  showBack?: boolean
  texts?: Partial<CwSettingsPageTexts>
  children?: ReactNode
  onBack?: () => void
}

export interface CwSettingsPageStyles {
  root: string
  header: string
  title: string
  body: string
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwSettingsPageEmits {
  (e: 'back'): void
}
