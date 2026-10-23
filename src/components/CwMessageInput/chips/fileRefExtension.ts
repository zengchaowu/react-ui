import { getFileExtension } from '@zengchaowu/shared/functions/file/getFileExtension'
import { pathLastSegment } from '@zengchaowu/shared/functions/path/pathLastSegment'

/** 从 path / 文件名得到扩展名：小写、不含点；无后缀返回 `""` */
export function fileRefExtensionFromPath(path: string, label: string): string {
  const name = String(label || path || '').trim()
  return getFileExtension(pathLastSegment(name))
}
