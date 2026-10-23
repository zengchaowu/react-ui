import { FabricImage, type FabricObject } from 'fabric'
import {
  FABRIC_EDITOR_APPEND_STAGGER_PX,
  offsetSvgImportRootsForAppend,
  placeSvgImportRootsAtScenePoint,
} from './fabricEditorSvgImport.pure'

export function isFabricEditorSvgFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  return lower.endsWith('.svg') || file.type === 'image/svg+xml'
}

export function isFabricEditorRasterImageFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif')
  ) {
    return true
  }
  return /^image\/(png|jpe?g|webp|gif)$/i.test(file.type)
}

export function isFabricEditorImportableFile(file: File): boolean {
  return isFabricEditorSvgFile(file) || isFabricEditorRasterImageFile(file)
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string' || !result) {
        reject(new Error(`无法读取图片：${file.name}`))
        return
      }
      resolve(result)
    }
    reader.onerror = () => {
      reject(new Error(`读取图片失败：${file.name}`))
    }
    reader.readAsDataURL(file)
  })
}

/** 从本地 PNG/JPG 等创建 Fabric 图片对象（图层类型为 image）。 */
export async function createFabricImageFromFile(file: File): Promise<FabricImage> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await FabricImage.fromURL(dataUrl)
  img.set({
    originX: 'left',
    originY: 'top',
  })
  return img
}

export function placeImportedFabricRoots(
  roots: FabricObject[],
  opts: {
    placeAt?: { x: number; y: number }
    appendStaggerIndex?: number
  },
): void {
  if (opts.placeAt) {
    placeSvgImportRootsAtScenePoint(roots, opts.placeAt)
    return
  }
  if (opts.appendStaggerIndex != null) {
    offsetSvgImportRootsForAppend(roots, opts.appendStaggerIndex)
  }
}

/** 从系统剪贴板读取栅格图（截图 / 复制图片）。无权限或非图片时返回空数组。 */
export async function readSystemClipboardImageFiles(): Promise<File[]> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.read) {
    return []
  }
  try {
    const items = await navigator.clipboard.read()
    const files: File[] = []
    let index = 0
    for (const item of items) {
      const imageType = item.types.find((t) =>
        /^image\/(png|jpe?g|webp|gif)$/i.test(t),
      )
      if (!imageType) continue
      const blob = await item.getType(imageType)
      const ext = /jpeg/i.test(imageType)
        ? 'jpg'
        : /webp/i.test(imageType)
          ? 'webp'
          : /gif/i.test(imageType)
            ? 'gif'
            : 'png'
      files.push(
        new File([blob], `clipboard-${++index}.${ext}`, { type: imageType }),
      )
    }
    return files
  } catch {
    return []
  }
}

/** 从 `paste` 事件的 clipboardData 提取图片文件。 */
export function imageFilesFromClipboardEvent(e: ClipboardEvent): File[] {
  const data = e.clipboardData
  if (!data) return []
  const files: File[] = []
  if (data.files?.length) {
    for (const file of Array.from(data.files)) {
      if (isFabricEditorRasterImageFile(file)) files.push(file)
    }
  }
  if (files.length) return files

  const items = data.items
  if (!items?.length) return []
  let index = 0
  for (const item of Array.from(items)) {
    if (!item.type.startsWith('image/')) continue
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(item.type)) continue
    const file = item.getAsFile()
    if (!file) continue
    const named =
      file.name && file.name !== 'image.png'
        ? file
        : new File(
            [file],
            `clipboard-${++index}.${/jpeg/i.test(item.type) ? 'jpg' : 'png'}`,
            { type: item.type },
          )
    files.push(named)
  }
  return files
}

export { FABRIC_EDITOR_APPEND_STAGGER_PX }
