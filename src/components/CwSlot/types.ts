import type { HTMLAttributes } from 'react'

export interface CwSlotStyles {
  /** 根容器（固定 24×24） */
  root: string
  /** 占位字母 S */
  label: string
  /** `block` 为 true 时外层：在父级内居中放置 24×24 占位 */
  blockWrap: string
}

export interface CwSlotTexts {
  defaultLabel: string
}

export interface CwSlotProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 块级演示：在父容器内居中显示固定 24×24 占位 */
  block?: boolean
  texts?: Partial<CwSlotTexts>
}
