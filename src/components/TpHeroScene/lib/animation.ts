/**
 * 动画更新函数
 */

import { updateWaterAnimation } from './water'
import { updateStarsAnimation, updateCloudsAnimation } from './sky'
import { updateFirefliesAnimation } from './particles'
import { updateCampfireAnimation } from './fire'
import { updateDancersAnimation } from './dancers'

export interface AnimationState {
  water: any
  stars: any
  clouds: any[]
  fireflies: any
  campfireParticles: any
  campfireLight: any
  dancers: any[]
  mixers: any[]
}

/**
 * 更新所有动画
 */
export function updateAllAnimations(
  state: AnimationState,
  time: number,
  currentTime: number
): void {
  // 水面波浪
  if (state.water) {
    updateWaterAnimation(state.water, time)
  }
  
  // 星星闪烁
  if (state.stars) {
    updateStarsAnimation(state.stars, time, currentTime)
  }
  
  // 云层漂移
  if (state.clouds && state.clouds.length > 0) {
    updateCloudsAnimation(state.clouds, time)
  }
  
  // 萤火虫飞舞
  if (state.fireflies) {
    updateFirefliesAnimation(state.fireflies, time, currentTime)
  }
  
  // 篝火粒子
  if (state.campfireParticles && state.campfireLight) {
    updateCampfireAnimation(state.campfireParticles, state.campfireLight, time)
  }
  
  // 动画混合器（用于GLTF模型动画）
  const delta = 0.016 // 约60fps
  state.mixers.forEach(mixer => {
    if (mixer && mixer.update) {
      mixer.update(delta)
    }
  })
  
  // 舞者动画
  if (state.dancers && state.dancers.length > 0) {
    updateDancersAnimation(state.dancers, time)
  }
}

