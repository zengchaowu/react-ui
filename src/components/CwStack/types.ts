import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
export interface CwStackItem {
  /** 栈帧唯一 id，用于 `<component :key>` 与多层 DOM 叠放 */
  id: string
  component: ComponentType<any>
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
  initialComponent?: ComponentType<any>
  /**
   * 初始组件的 props
   */
  initialProps?: Record<string, unknown>
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwStackStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwStackTexts>
  /**
   * 是否保留非栈顶层的 DOM（`visibility: hidden` 叠在下方，滚动/表单等状态不丢）；为 false 时仅挂载栈顶。
   * @default true
   */
  stackCache?: boolean
}

export interface CwStackStyles {
  root: string
  layerHost: string
  layer: string
  layerIdleUnder: string
  layerIdleTop: string
  layerEnterFwd: string
  layerEnterFwdRoot: string
  layerLeaveFwd: string
  layerEnterBack: string
  layerLeaveBack: string
  /** 被新页盖住时的下层遮罩 */
  layerScrim: string
  layerScrimIdle: string
  layerScrimEnter: string
  layerScrimLeave: string
}

export interface CwStackTexts {
  // 当前组件不需要文本
}

export interface CwStackEmits {
  /**
   * 栈变化事件
   */
  stackChange: [stack: CwStackItem[]]
  /**
   * 组件入栈事件
   */
  componentPush: [item: CwStackItem]
  /**
   * 组件出栈事件
   */
  componentPop: [item: CwStackItem | undefined]
}

export interface CwStackExposed {
  /**
   * 将组件推入栈顶（可带 props）
   */
  push: (component: ComponentType<any>, props?: Record<string, unknown>) => void
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
   * 开始一段「不播转场」的栈批量更新（须与 {@link endSilentStackBatch} 成对；建议在 `nextTick` 里结束）。
   * 用于首屏 `clear` + 连续 `push` 直达二级等场景。
   */
  beginSilentStackBatch: () => void
  /**
   * 结束静默批次（与 {@link beginSilentStackBatch} 成对调用）。
   */
  endSilentStackBatch: () => void
  /**
   * 获取当前栈的副本（只读）
   */
  stack: CwStackItem[]
}

