/** 清除/后缀图标随表单控件 size 缩放（设计稿 px ÷ 16 → rem） */
export const CW_CLEAR_ICON_SIZE = {
  small: 0.875,
  medium: 1.125,
  large: 1.25,
} as const

export type CwClearIconFieldSize = keyof typeof CW_CLEAR_ICON_SIZE

export function cwClearIconSize(size: CwClearIconFieldSize | undefined): number {
  return CW_CLEAR_ICON_SIZE[size || 'medium']
}
