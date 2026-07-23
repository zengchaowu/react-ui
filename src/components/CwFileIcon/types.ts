export interface CwFileIconProps {
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

export interface CwFileIconTexts {
  /** 图标描述（用于无障碍访问） */
  alt?: string
}

/**
 * 其它组件内嵌 FileIcon 时的精简配置。
 * @deprecated 优先直接传 `size` / `class`
 */
export interface CwFileIconEmbed {
  size?: number
  class?: string
  /** @deprecated 使用 `class` */
  root?: string
  image?: string
}
