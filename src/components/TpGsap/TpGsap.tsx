import type { TpGsapProps } from './types'

/**
 * 与 Vue 侧 `TpGsap.vue` 一致：模板为空，不渲染任何内容。
 * 动画能力通过 props 类型（gsap fromTo vars / ScrollTrigger）对外提供。
 */
export function TpGsap(_props: TpGsapProps) {
  return null
}

export default TpGsap
