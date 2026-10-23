import type { CwStackComponent, CwStackHandle } from '../CwStack'
import type { CwDynamicSheetInnerTexts } from '../CwDynamicSheet/types'

/** 步骤配置（用于 push 或线性模式 steps） */
export interface CwStackPopStepConfig {
  id?: string
  component: CwStackComponent
  props?: Record<string, unknown>
}

export interface CwStackPopProps {
  /** 是否显示弹窗（Vue `v-model:show`） */
  show?: boolean
  /** 弹窗高度，如 '80%'，会合并到 CwDynamicSheet 的 contentBottom */
  height?: string
  /** 是否启用步骤 push/pop 横向转场（透传 CwStack.slideTransition；Sheet 开合动画由 CwDynamicSheet 负责） */
  transition?: boolean
  /** 线性流程步骤；提供时打开自动推入 steps[0]..steps[initialStepIndex]，并提供 goNext 下一步 */
  steps?: CwStackPopStepConfig[]
  /** 打开时初始步骤下标（仅当 steps 存在时有效） */
  initialStepIndex?: number
  /** 透传给 CwDynamicSheet 的文案 */
  texts?: Partial<CwStackPopTexts>
  /** v-model:show 回调（Vue `update:show`） */
  onShowChange?: (value: boolean) => void
  /** 关闭事件 */
  onClose?: () => void
  /** 完成事件 */
  onComplete?: () => void
}

export type CwStackPopTexts = Partial<CwDynamicSheetInnerTexts>

export interface CwStackPopEmits {
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
  (e: 'complete'): void
}

/** 通过 `useCwStackPopContext()` 获取，供步骤内容调用 */
export interface CwStackPopApi {
  close: () => void
  back: () => void
  push: (
    component?: CwStackComponent,
    props?: Record<string, unknown>,
    stepId?: string,
  ) => void
  complete: () => void
  stackSize: number
  goPrev: () => void
  goNext: () => void
  isFirst: boolean
  isLast: boolean
  currentIndex: number
  total: number
  isEntryStep: boolean
}

export interface CwStackPopHandle {
  push: (
    component?: CwStackComponent,
    props?: Record<string, unknown>,
    stepId?: string,
  ) => void
  back: () => void
  close: () => void
  complete: () => void
  clear: () => void
  stackRef: CwStackHandle | null
}
