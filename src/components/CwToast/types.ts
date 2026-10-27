
import type { CwRichTextNode } from '@zengchaowu/ui-shared/components/CwRichText/types'
import type { CwToastType, CwToastPosition } from '@zengchaowu/ui-shared/components/CwToast/types'
import type { CwToastTexts } from '@zengchaowu/ui-shared/components/CwToast/types'

export type { CwRichTextNode } from '@zengchaowu/ui-shared/components/CwRichText/types'

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
