import type { HTMLAttributes, MouseEventHandler } from 'react'

export interface CwSettingsNavRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> {
  title: string
  description?: string
  /** CwIcon name */
  icon?: string
  danger?: boolean
  showChevron?: boolean
  showUnderline?: boolean
  iconSize?: number
  onClick?: MouseEventHandler<HTMLDivElement>
}

export interface CwSettingsNavRowStyles {
  titleWrap: string
  icon: string
  iconDanger: string
  title: string
  titleDanger: string
}
