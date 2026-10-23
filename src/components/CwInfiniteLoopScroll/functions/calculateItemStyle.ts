/**
 * 计算项目的样式
 */
export function calculateItemStyle(
  item: { top: number; left: number; height: number; width: number },
  direction: 'vertical' | 'horizontal' | 'both'
): Record<string, string> {
  const style: Record<string, string> = {}

  if (direction === 'horizontal') {
    style.height = '100%'
    style.width = (item.width || 0) + 'px'
  } else if (direction === 'vertical') {
    style.width = '100%'
    style.height = (item.height || 0) + 'px'
  } else {
    style.width = (item.width || 0) + 'px'
    style.height = (item.height || 0) + 'px'
  }

  const transforms: string[] = []
  if (direction !== 'horizontal') {
    transforms.push(`translateY(${item.top}px)`)
  }
  if (direction !== 'vertical') {
    transforms.push(`translateX(${item.left}px)`)
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(' ')
  }

  return style
}

