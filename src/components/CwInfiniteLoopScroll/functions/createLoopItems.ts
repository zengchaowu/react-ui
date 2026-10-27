import type { CwInfiniteLoopScrollItem } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/types'

/**
 * 创建循环项目列表
 */
export function createLoopItems(
  items: CwInfiniteLoopScrollItem[],
  copyCount: number
): Array<{
  key: string | number
  index: number
  originalIndex: number
  data: unknown
  height?: number
  width?: number
}> {
  if (items.length === 0) return []

  const itemsList: Array<{
    key: string | number
    index: number
    originalIndex: number
    data: unknown
    height?: number
    width?: number
  }> = []

  for (let copyIndex = 0; copyIndex < copyCount; copyIndex++) {
    items.forEach((item, originalIndex) => {
      itemsList.push({
        key: `${copyIndex}-${item.key}`,
        index: copyIndex * items.length + originalIndex,
        originalIndex,
        data: item.data,
        height: item.height,
        width: item.width
      })
    })
  }

  return itemsList
}

