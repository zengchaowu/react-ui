import type { CwLoadingTexts } from '../CwLoading/types'
import type { CwRichTextNode } from '../CwRichText/types'

export type { CwRichTextNode } from '../CwRichText/types'

export type CwToastType = 'text' | 'success' | 'fail' | 'loading'

export type CwToastPosition = 'top' | 'middle' | 'bottom'

/** 多次调用时的行为：replace=覆盖当前，queue=排队依次显示 */
export type CwToastMode = 'replace' | 'queue'

/** Toast 内容区结构 class（壳层由 CwDynamicDialog toast variant 提供） */
export interface CwToastStyles {
  /** 根容器（固定定位的包裹层） */
  root: string
  /** 位置：顶部 */
  positionTop: string
  /** 位置：居中 */
  positionMiddle: string
  /** 位置：底部 */
  positionBottom: string
  /** 内容盒子 */
  box: string
  /** 图标容器（success/fail/loading 时） */
  iconWrap: string
  /** 文案区（flex 子项，负责截断溢出） */
  messageWrap: string
  /** 纯文案（无 dsl 时） */
  message: string
}

export interface CwToastTexts {
  /** 内嵌 {@link CwLoading} */
  loadingTexts?: Partial<CwLoadingTexts>
}

export interface CwToastEmits {
  /** 关闭时触发（动画结束后） */
  onClose?: () => void
  /** 用于 visible 双向同步 */
  onVisibleChange?: (value: boolean) => void
  /** 指针移入内容区：命令式 Toast 用于暂停自动关闭倒计时 */
  onAutoClosePause?: () => void
  /** 指针移出内容区：恢复自动关闭倒计时 */
  onAutoCloseResume?: () => void
  /** {@link CwRichText} 链接点击 */
  onLinkClick?: (href: string, event: MouseEvent) => void
}

export interface CwToastProps extends CwToastEmits {
  /** 是否显示 */
  visible?: boolean
  /** 纯文案；与 {@link dsl} 二选一，dsl 优先 */
  message?: string
  /** {@link CwRichText} DSL，支持多链接、加粗等 */
  dsl?: CwRichTextNode[]
  /** 类型：纯文案 / 成功 / 失败 / 加载中 */
  type?: CwToastType
  /** 显示位置 */
  position?: CwToastPosition
  texts?: Partial<CwToastTexts>
  /** 内容键：覆盖时递增，用于内容切换过渡（仅命令式 replace 时使用） */
  contentKey?: number
  className?: string
}
