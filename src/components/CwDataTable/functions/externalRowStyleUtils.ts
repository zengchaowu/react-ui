const FIXED_BODY_FIRST_SUBSTRINGS = ['fixedRightBodyFirst', 'fixedLeftBodyFirst'] as const

/** 外部行：去掉表体「首个固定列」专用边框类，保留阴影等其它类 */
export function stripFixedBodyFirstBorderClasses(classes: string[]): string[] {
  return classes.filter(
    (cls) => !FIXED_BODY_FIRST_SUBSTRINGS.some((sub) => cls.includes(sub)),
  )
}

export function mergeColumnStyleTransparentRight<T extends object>(
  style: T,
): T & { borderRightColor: string } {
  return { ...style, borderRightColor: 'transparent' }
}

export function mergeColumnStyleTransparentLateralBorders<T extends object>(
  style: T,
): T & { borderRightColor: string; borderLeftColor: string } {
  return {
    ...style,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  }
}
