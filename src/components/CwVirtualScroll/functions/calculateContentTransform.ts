/**
 * 计算内容容器的 transform
 */
export function calculateContentTransform(
  scrollTop: number,
  scrollLeft: number,
  direction: 'vertical' | 'horizontal' | 'both',
): string {
  const transforms: string[] = []
  if (direction !== 'horizontal') {
    transforms.push(`translateY(-${scrollTop}px)`)
  }
  if (direction !== 'vertical') {
    transforms.push(`translateX(-${scrollLeft}px)`)
  }
  return transforms.join(' ')
}
