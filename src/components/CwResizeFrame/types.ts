export interface CwResizeFrameSize {
  width: number
  height: number
}

export interface CwResizeFrameProps {
  width: number
  height: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  resizeWidth?: boolean
  resizeHeight?: boolean
  disabled?: boolean
  showSize?: boolean
  styles?: Partial<CwResizeFrameStyles>
  texts?: Partial<CwResizeFrameTexts>
}

export interface CwResizeFrameEmits {
  (e: 'update:width', value: number): void
  (e: 'update:height', value: number): void
  (e: 'resize', payload: CwResizeFrameSize): void
}

export interface CwResizeFrameStyles {
  root: string
  sizeLabel: string
  chrome: string
  chromeResizeWidth: string
  chromeResizeHeight: string
  frameBody: string
  content: string
  handleBase: string
  handleEast: string
  handleSouth: string
  handleSouthEast: string
  gripVertical: string
  gripHorizontal: string
  gripCorner: string
}

export interface CwResizeFrameTexts {
  sizeLabel: string
  handleEastAriaLabel: string
  handleSouthAriaLabel: string
  handleSouthEastAriaLabel: string
}
