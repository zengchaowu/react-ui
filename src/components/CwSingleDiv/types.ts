import type { MouseEvent } from 'react'
import type { CwSingleDivTexts } from '@zengchaowu/ui-shared/components/CwSingleDiv/types'

export interface CwSingleDivStyle {
  // 基础样式
  background?: string
  boxShadow?: string
  borderRadius?: string
  width?: string
  height?: string
  transform?: string
  position?: 'relative' | 'absolute' | 'fixed'
  // 边框
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  // 渐变和滤镜
  backgroundImage?: string
  filter?: string
  // 变换
  transformOrigin?: string
  // 定位
  top?: string
  left?: string
  right?: string
  bottom?: string
  zIndex?: string
  // 其他CSS属性
  [key: string]: string | number | undefined
}

export interface CwSingleDivPseudo {
  content?: string
  background?: string
  boxShadow?: string
  borderRadius?: string
  width?: string
  height?: string
  transform?: string
  position?: 'relative' | 'absolute' | 'fixed'
  top?: string
  left?: string
  right?: string
  bottom?: string
  // 边框
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  // 渐变和滤镜
  backgroundImage?: string
  filter?: string
  // 变换
  transformOrigin?: string
  zIndex?: string
  // 其他CSS属性
  [key: string]: string | number | undefined
}

export interface CwSingleDivDSL {
  /** 主元素样式 */
  main: CwSingleDivStyle
  /** ::before 伪元素样式 */
  before?: CwSingleDivPseudo
  /** ::after 伪元素样式 */
  after?: CwSingleDivPseudo
  /** 额外的子元素（通过多层嵌套实现更复杂的图案） */
  children?: CwSingleDivDSL[]
}

export interface CwSingleDivProps {
  /** DSL 配置对象 */
  dsl: CwSingleDivDSL
  texts?: Partial<CwSingleDivTexts>
}

export interface CwSingleDivEmits {
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}
