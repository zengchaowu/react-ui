import type { CwLoadingTexts } from '../CwLoading/types'
import type { CwRichTextNode, CwRichTextStyles } from '../CwRichText/types'

export type { CwRichTextNode } from '../CwRichText/types'

export type CwToastType = 'text' | 'success' | 'fail' | 'loading'

export type CwToastPosition = 'top' | 'middle' | 'bottom'

/** 多次调用时的行为：replace=覆盖当前，queue=排队依次显示 */
export type CwToastMode = 'replace' | 'queue'

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

export interface CwToastProps {
  /** 是否显示 */
  visible?: boolean
  /** 纯文案；与 {@link dsl} 二选一，dsl 优先 */
  message?: string
  /** {@link CwRichText} DSL，支持多链接、加粗等 */
  dsl?: CwRichTextNode[]
  /** 内嵌富文本样式覆盖 */
  richTextStyles?: Partial<CwRichTextStyles>
  /** 类型：纯文案 / 成功 / 失败 / 加载中 */
  type?: CwToastType
  /** 显示位置 */
  position?: CwToastPosition
  /** 自定义样式 */
  styles?: Partial<CwToastStyles>
  texts?: Partial<CwToastTexts>
  /** 内容键：覆盖时递增，用于内容切换过渡（仅命令式 replace 时使用） */
  contentKey?: number
}

export interface CwToastEmits {
  /** 关闭时触发（动画结束后） */
  close: []
  /** 用于 v-model:visible 同步 */
  'update:visible': [value: boolean]
  /** 指针移入内容区：命令式 Toast 用于暂停自动关闭倒计时 */
  autoClosePause: []
  /** 指针移出内容区：恢复自动关闭倒计时 */
  autoCloseResume: []
  /** {@link CwRichText} 链接点击 */
  linkClick: [href: string, event: MouseEvent]
}
