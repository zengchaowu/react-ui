/**
 * 计算图片样式（合并尺寸和 transform）
 */
export interface ImageTransform {
  scale?: number
  x?: number
  y?: number
  rotation?: number
}

export interface ImageStyleSize {
  width: string
  height: string
}

export function calculateImageStyle(
  size: ImageStyleSize,
  transform?: ImageTransform
): Record<string, string> {
  const style: Record<string, string> = {
    ...size
  }

  // 添加 transform 样式
  if (transform && (transform.scale !== undefined || transform.x !== undefined || transform.y !== undefined || transform.rotation !== undefined)) {
    const scale = transform.scale ?? 1
    const x = transform.x ?? 0
    const y = transform.y ?? 0
    const rotation = transform.rotation ?? 0

    style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`
    style.transformOrigin = 'center center'
  }

  return style
}
