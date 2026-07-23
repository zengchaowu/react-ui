import type { CwImgStyles } from '../CwImg/types'

export type CwAvatarAppearance = 'default' | 'on-media' | 'on-media-windows' | 'chat'

export interface CwAvatarProps {
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
  /** 官方外观 */
  appearance?: CwAvatarAppearance
  /** 自定义文本（含 defaultAlt） */
  texts?: Partial<CwAvatarTexts>
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
