import type { ComponentType } from 'react'

/**
 * 栈帧可渲染组件（Vue `Component` 的 React 等价物）。
 * 栈帧 props 由 `push(component, props)` 透传，故以松散索引签名承接。
 */
export type CwStackComponent = ComponentType<Record<string, unknown>>

export interface CwStackItem {
  /** 栈帧唯一 id，用于 `key` 与多层 DOM 叠放 */
  id: string
  component: CwStackComponent
  props?: Record<string, unknown>
}

export interface CwStackProps {
  /**
   * 是否启用类 iOS 导航的横向转场：push 时新页自右滑入、下层视差左移；pop 时当前页右滑出、下层自左侧视差归位（仅平移，不缩放）。
   */
  slideTransition?: boolean
  /**
   * 初始组件，可选
   */
  initialComponent?: CwStackComponent
  /**
   * 初始组件的 props
   */
  initialProps?: Record<string, unknown>
  /**
   * 是否保留非栈顶层的 DOM（`visibility: hidden` 叠在下方，滚动/表单等状态不丢）；为 false 时仅挂载栈顶。
   * @default true
   */
  stackCache?: boolean
  /**
   * 栈层是否铺满不透明底。设为 false 时由内容（如 CwSettingsPage）自带背景，
   * push/pop 时两侧留白可见。全屏聊天等场景保持默认 true。
   * @default true
   */
  opaqueLayerBackground?: boolean
  /** 栈变化事件（Vue `stackChange`） */
  onStackChange?: (stack: CwStackItem[]) => void
  /** 组件入栈事件（Vue `componentPush`） */
  onComponentPush?: (item: CwStackItem) => void
  /** 组件出栈事件（Vue `componentPop`） */
  onComponentPop?: (item: CwStackItem | undefined) => void
}

export interface CwStackEmits {
  /**
   * 栈变化事件
   */
  (e: 'stackChange', stack: CwStackItem[]): void
  /**
   * 组件入栈事件
   */
  (e: 'componentPush', item: CwStackItem): void
  /**
   * 组件出栈事件
   */
  (e: 'componentPop', item: CwStackItem | undefined): void
}

export interface CwStackExposed {
  /**
   * 将组件推入栈顶（可带 props）
   */
  push: (component: CwStackComponent, props?: Record<string, unknown>) => void
  /**
   * 弹出栈顶组件
   */
  pop: () => CwStackItem | undefined
  /**
   * 清空整个栈
   */
  clear: () => void
  /**
   * 获取栈大小
   */
  size: () => number
  /**
   * 检查栈是否为空
   */
  isEmpty: () => boolean
  /**
   * 开始一段「不播转场」的栈批量更新（须与 {@link CwStackExposed.endSilentStackBatch} 成对；建议在下一个微任务里结束）。
   * 用于首屏 `clear` + 连续 `push` 直达二级等场景。
   */
  beginSilentStackBatch: () => void
  /**
   * 结束静默批次（与 {@link CwStackExposed.beginSilentStackBatch} 成对调用）。
   */
  endSilentStackBatch: () => void
  /**
   * 获取当前栈的副本（只读）
   */
  stack: CwStackItem[]
}

export type CwStackHandle = CwStackExposed
