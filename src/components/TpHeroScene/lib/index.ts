/**
 * TpHeroScene 库函数导出
 * 所有场景功能都被拆分成纯函数模块
 */

// 场景管理
export { initScene, cleanupScene, type SceneState, type InitSceneConfig } from './scene'

// 动画更新
export { updateAllAnimations, type AnimationState } from './animation'

// 资源加载
export { loadThreeJS, type LoadersResult } from './loaders'

// 噪声生成
export { perlinNoise, multiOctaveNoise, fade, lerp, grad } from './noise'

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
} from './textures'

// 地形
export { createTerrain, type TerrainConfig } from './terrain'

// 水体
export { createWater, updateWaterAnimation, type WaterConfig } from './water'

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
} from './sky'

// 三体系统
export {
  createTrisolarisSystem,
  updateTrisolarisSystem,
  getTrisolarisStatus,
  getTrisolarisEra,
  type Sun
} from './trisolaris'

// 光照
export { setupLights, type LightsSystem } from './lights'

// 粒子系统
export {
  createFireflies,
  updateFirefliesAnimation,
  type ParticleVelocity
} from './particles'

// 环境对象
export { addEnvironmentObjects } from './environment'

// 篝火
export {
  createCampfire,
  updateCampfireAnimation,
  type CampfireSystem,
  type ParticleVelocityWithLife
} from './fire'

// 舞者
export {
  createDancers,
  createDancerModel,
  updateDancersAnimation,
  type DancerConfig
} from './dancers'

// 后期处理
export {
  setupPostProcessing,
  type PostProcessingConfig
} from './postprocessing'

// 工具函数
export { formatTime, getTimeOfDay, getTimeEmoji } from './utils'

