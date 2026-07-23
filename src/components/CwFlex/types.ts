export type CwFlexDirection = 'column' | 'row'

export type CwFlexAlign = 'stretch' | 'center' | 'flex-start' | 'flex-end'

export type CwFlexJustify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

export interface CwFlexStyles {
  root: string
  directionColumn: string
  directionRow: string
}

export interface CwFlexTexts {}

export interface CwFlexProps {
  /** 主轴方向 */
  direction?: CwFlexDirection
  /** 子项间距（px） */
  gap?: number
  /** 内边距（px） */
  padding?: number
  /** 交叉轴对齐 */
  align?: CwFlexAlign
  /** 主轴对齐 */
  justify?: CwFlexJustify
  styles?: Partial<CwFlexStyles>
  texts?: Partial<CwFlexTexts>
}
