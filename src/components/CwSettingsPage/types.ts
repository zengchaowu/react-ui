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
