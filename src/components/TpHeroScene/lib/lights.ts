/**
 * 光照系统
 */

import type { SceneQuality } from '../types'

export interface LightsSystem {
  ambientLight: any
  sunLight: any
  hemisphereLight: any
}

/**
 * 设置光照
 */
export function setupLights(THREE: any, quality: SceneQuality): LightsSystem {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  
  // 太阳光（平行光）
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = quality.shadowMapSize
  sunLight.shadow.mapSize.height = quality.shadowMapSize
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 500
  sunLight.shadow.camera.left = -100
  sunLight.shadow.camera.right = 100
  sunLight.shadow.camera.top = 100
  sunLight.shadow.camera.bottom = -100
  
  // 半球光（更自然的环境光）
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7c59, 0.5)
  
  return {
    ambientLight,
    sunLight,
    hemisphereLight
  }
}

