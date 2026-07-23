import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
import type { CwDynamicSheetInnerStyles, CwDynamicSheetInnerTexts } from '../CwDynamicSheet/types'

/** 步骤配置（用于 push 或线性模式 steps） */
export interface CwStackPopStepConfig {
  id?: string
  component: ComponentType<any>
  props?: Record<string, unknown>
}

export interface CwStackPopProps {
  /** 是否显示弹窗（v-model:show） */
  show: boolean
  /** 弹窗高度，如 '80%'，会合并到 CwDynamicSheet 的 contentBottom */
  height?: string
  /** 是否启用步骤切换动画（保留兼容，当前由 CwDynamicSheet 统一动画） */
  transition?: boolean
  /** 线性流程步骤；提供时打开自动推入 steps[0]..steps[initialStepIndex]，并提供 goNext 下一步 */
  steps?: CwStackPopStepConfig[]
  /** 打开时初始步骤下标（仅当 steps 存在时有效） */
  initialStepIndex?: number
  /** 透传给 CwDynamicSheet 的样式 */
  styles?: Partial<CwStackPopStyles>
  /** 透传给 CwDynamicSheet 的文案 */
  texts?: Partial<CwStackPopTexts>
}

export type CwStackPopStyles = Partial<CwDynamicSheetInnerStyles>
export type CwStackPopTexts = Partial<CwDynamicSheetInnerTexts>

export interface CwStackPopEmits {
  'update:show': [value: boolean]
  close: []
  complete: []
}

/** 通过 inject(CW_STACK_POP_API_KEY) 获取，供步骤内容调用 */
export interface CwStackPopApi {
  close: () => void
  back: () => void
  push: (component?: ComponentType<any>, props?: Record<string, unknown>, stepId?: string) => void
  complete: () => void
  stackSize: number
  goPrev: () => void
  goNext: () => void
  isFirst: boolean
  isLast: boolean
  currentIndex: MutableRefObject<number>
  total: number
  isEntryStep: boolean
}

export const CW_STACK_POP_API_KEY = Symbol('CwStackPopApi') as symbol
