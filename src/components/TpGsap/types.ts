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
  class?: string
  /** ScrollTrigger 配置，传对象时启用，传 false/undefined 时关闭 */
  scrollTrigger?: ScrollTriggerVars | boolean
}


export interface TpGsapStyles {
  root: string;
  container: string;
  controls?: string;
  controlButton?: string;
  controlButtonActive?: string;
  timeline?: string;
  timelineHeader?: string;
  timelineTitle?: string;
  timelineControls?: string;
  timelineButton?: string;
  timelineButtonActive?: string;
  timelineProgress?: string;
  timelineProgressFill?: string;
  timelineTime?: string;
  loading?: string;
  loadingSpinner?: string;
  loadingText?: string;
  error?: string;
  errorIcon?: string;
  errorText?: string;
  retryButton?: string;
}

export interface TpGsapTexts {
  // Placeholder for texts
}

export interface TpGsapEmits {
  start: []
  complete: []
  update: []
}