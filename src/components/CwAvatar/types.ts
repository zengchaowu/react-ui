import type { HTMLAttributes, ReactNode } from 'react'
import type { CwImgStyles } from '../CwImg/types'
import type { CwIconEmbed } from '../CwIcon/types'

export type CwAvatarAppearance = 'default' | 'ring-light' | 'ring-bordered'

/** 仅 `appearance="ring-light"` 时生效：叠在壁纸/视频上的阴影强度 */
export type CwAvatarRingLightElevation = 'soft' | 'strong'

export interface CwAvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'size'> {
  /** 头像主图 URL；可无，此时展示 `fallbackSrc` */
  src?: string
  /**
   * 必传：无 `src`、`src` 不可用或主图加载失败时的占位图 URL（由各应用传入默认头像资源）。
   */
  fallbackSrc: string
  /** 仅用于 `img alt` / 无障碍 */
  text?: string
  /** 头像形状 */
  shape?: 'circle' | 'square'
  /** 边长（rem）；`0` 表示由外层 CSS 承担 */
  size?: number
  /** 官方场景外观（结构用 `shape` / `size`；叠层阴影微调用 `elevation`） */
  appearance?: CwAvatarAppearance
  /** `ring-light` 阴影：`soft` 默认；`strong` 用于更重浮层 */
  elevation?: CwAvatarRingLightElevation
  /** 自定义文本（含 defaultAlt） */
  texts?: Partial<CwAvatarTexts>
  /** `badge` 具名插槽 */
  badge?: ReactNode
}

export interface CwAvatarTexts {
  /** 图片 `alt` 兜底文案 */
  defaultAlt: string
}

export interface CwAvatarEmits {
  // Avatar 组件不需要事件
}

/** @internal 默认 img 样式 */
export type { CwImgStyles }
