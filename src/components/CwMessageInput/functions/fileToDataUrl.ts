/** 本地图片 File → data URL（写入 `img[data-cw-inline-image]` src） */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error ?? new Error('读取文件失败'))
    r.readAsDataURL(file)
  })
}
