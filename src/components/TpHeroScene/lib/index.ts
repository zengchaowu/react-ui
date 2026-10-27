/**
 * TpHeroScene 库函数导出
 * 所有场景功能都被拆分成纯函数模块
 */

// 场景管理
export { initScene, cleanupScene, type SceneState, type InitSceneConfig } from './scene'

// 动画更新
export { updateAllAnimations, type AnimationState } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/animation'

// 资源加载
export { loadThreeJS, type LoadersResult } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/loaders'

// 噪声生成
export { perlinNoise, multiOctaveNoise, fade, lerp, grad } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/noise'

// 纹理生成
export {
  createTerrainTexture,
  createNormalTexture,
  createRoughnessTexture,
  createWaterNormalMap,
  createStarTexture,
  createRockTexture,
  createRockNormalMap,
  createTreeTrunkTexture,
  createTreeTrunkNormalMap,
  createLeavesTexture,
  createLeavesNormalMap,
  createGrassTexture
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/textures'

// 地形
export { createTerrain, type TerrainConfig } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/terrain'

// 水体
export { createWater, updateWaterAnimation, type WaterConfig } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/water'

// 天空和星空
export {
  createSky,
  createTrisolarisSky,
  createStars,
  createClouds,
  updateSkyAndSun,
  updateStarsAnimation,
  updateCloudsAnimation,
  type SkySystem,
  type TrisolarisSystem
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/sky'

// 三体系统
export {
  createTrisolarisSystem,
  updateTrisolarisSystem,
  getTrisolarisStatus,
  getTrisolarisEra,
  type Sun
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/trisolaris'

// 光照
export { setupLights, type LightsSystem } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/lights'

// 粒子系统
export {
  createFireflies,
  updateFirefliesAnimation,
  type ParticleVelocity
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/particles'

// 环境对象
export { addEnvironmentObjects } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/environment'

// 篝火
export {
  createCampfire,
  updateCampfireAnimation,
  type CampfireSystem,
  type ParticleVelocityWithLife
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/fire'

// 舞者
export {
  createDancers,
  createDancerModel,
  updateDancersAnimation,
  type DancerConfig
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/dancers'

// 后期处理
export {
  setupPostProcessing,
  type PostProcessingConfig
} from '@zengchaowu/ui-shared/components/TpHeroScene/lib/postprocessing'

// 工具函数
export { formatTime, getTimeOfDay, getTimeEmoji } from '@zengchaowu/ui-shared/components/TpHeroScene/lib/utils'

