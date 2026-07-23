export interface CwDivTexts {}

export interface CwDivStyles {
  root: string
  viewport: string
  content: string
  scrollbarHidden: string
  scrollbarShown: string
  scrollbarVertical: string
  scrollbarVerticalHasHorizontal: string
  scrollbarHorizontal: string
  scrollbarHorizontalHasVertical: string
  thumbBase: string
  thumbVertical: string
  thumbHorizontal: string
}

export interface CwDivProps {
  /** 为 true 时完全隐藏自定义滚动条（仅隐藏滚动条轨道与滑块，视口仍可滚动） */
  hideScrollbar?: boolean
  /** 为 true 时只要有溢出就常显自定义滚动条（默认仅在滚动/拖拽轨道时显示并淡出） */
  persistScrollbar?: boolean
  styles?: Partial<CwDivStyles>
  texts?: Partial<CwDivTexts>
}
