import type { ReactNode } from 'react'
import type {
  CwButtonAppearance,
  CwButtonTexts,
  CwButtonType,
  CwButtonVariant,
} from '../CwButton/types'

export type CwCountDownButtonStatus = 'idle' | 'pending' | 'counting' | 'finished'

/** 默认插槽作用域参数（对应 Vue 具名默认插槽 slot props） */
export interface CwCountDownButtonSlotProps {
  status: CwCountDownButtonStatus
  remaining: number
  duration: number
  percentage: number
  pending: boolean
}

export interface CwCountDownButtonProps {
  /**
   * 按钮类型
   */
  type?: CwButtonType
  /**
   * 按钮形态
   */
  variant?: CwButtonVariant
  /**
   * 透传官方外观
   */
  appearance?: CwButtonAppearance
  /**
   * 按钮尺寸
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * 按钮外形
   */
  shape?: 'square' | 'rounded' | 'circle'
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否只读（可聚焦但不会开始倒计时）
   */
  readonly?: boolean
  /**
   * 倒计时总时长，单位：秒
   */
  duration?: number
  /**
   * 倒计时间隔，单位：秒
   */
  interval?: number
  /**
   * 是否在挂载后自动尝试开始倒计时
   */
  autoStart?: boolean
  /**
   * 受控模式：是否处于倒计时中（对应 Vue `v-model:modelValue`）
   */
  value?: boolean
  /**
   * 倒计时开始前的异步校验函数，返回 true 才会进入倒计时
   */
  beforeStart?: () => Promise<boolean | void> | boolean
  /**
   * beforeStart 执行期间是否在按钮上展示 loading
   */
  pendingLoading?: boolean
  /**
   * 根容器是否拉满父宽（验证码旁等场景）
   */
  block?: boolean
  /**
   * 自定义文本
   */
  texts?: Partial<CwCountDownButtonTexts>
  /**
   * 默认插槽：可直接传节点，也可传接收作用域参数（status/remaining/...）的渲染函数
   */
  children?: ReactNode | ((slotProps: CwCountDownButtonSlotProps) => ReactNode)
  className?: string
  /**
   * 点击事件透传
   */
  onClick?: (event: MouseEvent | KeyboardEvent) => void
  /**
   * v-model 同步（对应 `update:modelValue`）
   */
  onChange?: (value: boolean) => void
  /**
   * 倒计时开始
   */
  onCountdownStart?: (payload: { duration: number }) => void
  /**
   * 倒计时跳动
   */
  onCountdownTick?: (payload: { remaining: number; duration: number }) => void
  /**
   * 倒计时结束
   */
  onCountdownFinish?: () => void
  /**
   * beforeStart 抛出异常
   */
  onBeforeStartError?: (error: unknown) => void
  /**
   * beforeStart 返回 false
   */
  onBeforeStartReject?: () => void
  /**
   * 手动重置倒计时
   */
  onReset?: () => void
}

export interface CwCountDownButtonTexts {
  /**
   * 初始文案
   */
  idle: string
  /**
   * beforeStart 校验中的文案
   */
  pending: string
  /**
   * 倒计时过程中的文案，支持 {{remaining}}、{{duration}}、{{elapsed}} 占位符
   */
  counting: string
  /**
   * 倒计时完成后的文案
   */
  finished: string
  /**
   * 无障碍标签
   */
  ariaLabel?: string
  /**
   * 透传给内部 CwButton 的文本
   */
  buttonTexts?: Partial<CwButtonTexts>
}

export interface CwCountDownButtonEmits {
  /**
   * v-model 同步
   */
  onChange?: (value: boolean) => void
  /**
   * 点击事件透传
   */
  onClick?: (event: MouseEvent | KeyboardEvent) => void
  /**
   * 倒计时开始
   */
  onCountdownStart?: (payload: { duration: number }) => void
  /**
   * 倒计时跳动
   */
  onCountdownTick?: (payload: { remaining: number; duration: number }) => void
  /**
   * 倒计时结束
   */
  onCountdownFinish?: () => void
  /**
   * beforeStart 抛出异常
   */
  onBeforeStartError?: (error: unknown) => void
  /**
   * beforeStart 返回 false
   */
  onBeforeStartReject?: () => void
  /**
   * 手动重置倒计时
   */
  onReset?: () => void
}

/** 组件实例句柄（对应 Vue `defineExpose`） */
export interface CwCountDownButtonExpose {
  /**
   * 手动触发倒计时
   */
  start: (options?: { skipBeforeStart?: boolean }) => Promise<void>
  /**
   * 重置倒计时
   */
  reset: () => void
  /**
   * 当前状态
   */
  readonly status: CwCountDownButtonStatus
  /**
   * 剩余秒数
   */
  readonly remaining: number
}
