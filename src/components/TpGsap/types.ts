import { gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

export type ScrollTriggerVars = Parameters<typeof ScrollTriggerType.create>[0]

type GsapTweenVars = NonNullable<Parameters<typeof gsap.fromTo>[2]>

export interface TpGsapProps {
  /** 初始状态（from），如 { opacity: 0, y: 40 } */
  from?: GsapTweenVars
  /** 目标状态（to），如 { opacity: 1, y: 0 } */
  to?: GsapTweenVars
  /** 动画持续时间（秒） */
  duration?: number
  /** 动画延迟（秒） */
  delay?: number
  /** 重复次数，0 为不重复，-1 为无限 */
  repeat?: number
  /** 是否往返播放 */
  yoyo?: boolean
  /** 初始是否暂停 */
  paused?: boolean
  /** 使用自定义容器标签，如 'div'、'span' */
  tag?: string
  /** 额外类名 */
  className?: string
  /** ScrollTrigger 配置，传对象时启用，传 false/undefined 时关闭 */
  scrollTrigger?: ScrollTriggerVars | boolean
  /** 动画开始（对应 Vue `start` 事件） */
  onStart?: () => void
  /** 动画完成（对应 Vue `complete` 事件） */
  onComplete?: () => void
  /** 动画更新（对应 Vue `update` 事件） */
  onUpdate?: () => void
}

