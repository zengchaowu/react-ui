/**
 * 从 File 创建对象 URL
 */
export function createImageUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * 撤销对象 URL
 */
export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url)
}
