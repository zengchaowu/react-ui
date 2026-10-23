import type { ReactNode } from 'react'

export interface CwParticleBackgroundProps {
  width?: string
  height?: string
  count?: number
  maxSize?: number
  speed?: number
  connectionRadius?: number
  connectionOpacity?: number
  colors?: string[]
  /** 对应 Vue `class`（attrs） */
  className?: string
  /** 默认插槽内容 */
  children?: ReactNode
}
