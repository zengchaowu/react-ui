/** 从粘贴/拖拽事件的 clipboardData 中取出图片文件 */
export function clipboardImageFiles(ev: ClipboardEvent): File[] {
  const files: File[] = []
  const dt = ev.clipboardData
  if (!dt) return files
  for (const item of Array.from(dt.items ?? [])) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (!file) continue
    if (!file.type || !file.type.startsWith('image/')) continue
    files.push(file)
  }
  return files
}
