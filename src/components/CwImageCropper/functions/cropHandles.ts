/**
 * 裁剪手柄配置
 */
export interface CropHandle {
  position: string
  style: {
    left?: string
    right?: string
    top?: string
    bottom?: string
    width: string
    height: string
    cursor: string
  }
}

/**
 * 生成裁剪手柄配置
 */
export function generateCropHandles(handleSize: number = 20): CropHandle[] {
  const handleOffset = handleSize / 2
  return [
    { position: 'nw', style: { left: `-${handleOffset}px`, top: `-${handleOffset}px`, width: `${handleSize}px`, height: `${handleSize}px`, cursor: 'nwse-resize' } },
    { position: 'ne', style: { right: `-${handleOffset}px`, top: `-${handleOffset}px`, width: `${handleSize}px`, height: `${handleSize}px`, cursor: 'nesw-resize' } },
    { position: 'sw', style: { left: `-${handleOffset}px`, bottom: `-${handleOffset}px`, width: `${handleSize}px`, height: `${handleSize}px`, cursor: 'nesw-resize' } },
    { position: 'se', style: { right: `-${handleOffset}px`, bottom: `-${handleOffset}px`, width: `${handleSize}px`, height: `${handleSize}px`, cursor: 'nwse-resize' } }
  ]
}
