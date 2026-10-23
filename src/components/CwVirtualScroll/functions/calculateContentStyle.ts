/**
 * 计算内容容器的样式
 */
export function calculateContentStyle(
  direction: 'vertical' | 'horizontal' | 'both',
  totalHeight: number,
  totalWidth: number,
  contentTransform: string,
): {
  height: string | number
  width: string | number
  transform: string
} {
  return {
    height: direction === 'horizontal' ? '100%' : totalHeight + 'px',
    width: direction === 'vertical' ? '100%' : totalWidth + 'px',
    transform: contentTransform,
  }
}
