export interface CwCornerClosableWrapProps {
  closable?: boolean
  disabled?: boolean
  rounded?: boolean
  styles?: Partial<CwCornerClosableWrapStyles>
  texts?: Partial<CwCornerClosableWrapTexts>
}

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

export interface CwCornerClosableWrapEmits {
  close: [event: MouseEvent]
}
