import type { HTMLAttributes } from 'react'
import type { CwFileIconTexts } from '@zengchaowu/ui-shared/components/CwFileIcon/types'

export interface CwFileIconProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size'> {
  /** 文件路径（用于匹配图标） */
  path: string
  /** 是否为目录 */
  isDirectory?: boolean
  /**
   * 边长（rem）；`0` 表示尺寸由 em/CSS 承担。
   * 默认 `1`。
   */
  size?: number
  /** 基础 URL（用于构建图标路径） */
  baseUrl?: string
  /** 自定义文本 */
  texts?: Partial<CwFileIconTexts>
}
