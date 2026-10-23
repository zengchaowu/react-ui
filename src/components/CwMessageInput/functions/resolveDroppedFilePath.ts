/** Electron / Chromium 拖入文件可能带 `path`；否则退回文件名 */
export function resolveDroppedFilePath(file: File): string {
  const withPath = file as File & { path?: string }
  const p = typeof withPath.path === 'string' ? withPath.path.trim() : ''
  if (p) return p
  return file.name.trim() || 'file'
}
