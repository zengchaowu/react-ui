/**
 * 场景管理和初始化
 */

import { loadThreeJS, type LoadersResult } from './loaders'
import { createTerrain } from './terrain'
import { createWater } from './water'
import { createSky, createTrisolarisSky, createStars, createClouds, updateSkyAndSun, type TrisolarisSystem } from './sky'
import { setupLights } from './lights'
import { createFireflies } from './particles'
import { addEnvironmentObjects } from './environment'
import { createCampfire } from './fire'
import { createDancers } from './dancers'
import { setupPostProcessing } from './postprocessing'
import type { TpHeroSceneResolvedProps, SceneQuality } from '../types'

export interface SceneState {
  THREE: any
  scene: any
  camera: any
  renderer: any
  controls: any
  terrain: any
  water: any
  sky: any
  sun: any
  sunLight: any
  stars: any
  clouds: any[]
  fireflies: any
  campfireSystem: any
  dancers: any[]
  mixers: any[]
  composer: any
  // 三体系统
  trisolarisSystem?: TrisolarisSystem
  enableTrisolaris: boolean
}

export interface InitSceneConfig {
  container: HTMLDivElement
  props: TpHeroSceneResolvedProps
  qualitySettings: Record<string, SceneQuality>
  onProgress?: (status: string) => void
}

/**
 * 初始化场景
 */
export async function initScene(config: InitSceneConfig): Promise<SceneState> {
  const { container, props, qualitySettings, onProgress } = config
  
  // 加载 Three.js
  onProgress?.('加载 Three.js 库...')
  const loaders = await loadThreeJS(
    props.enablePostProcessing && qualitySettings[props.quality].enablePostProcessing,
    3,
    1000,
    onProgress
  )
  
  const { THREE, OrbitControls, GLTFLoader, FBXLoader, postprocessing } = loaders
  
  onProgress?.('创建场景...')
  
  // 创建场景
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x87ceeb, 100, 500)
  
  // 创建相机
  const aspectRatio = props.width / props.height
  const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000)
  camera.position.set(0, 30, 80)
  
  // 创建渲染器
  const settings = qualitySettings[props.quality]
  const renderer = new THREE.WebGLRenderer({
    antialias: settings.antialias,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setSize(props.width, props.height)
  renderer.setPixelRatio(settings.pixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  
  container.appendChild(renderer.domElement)
  
  // 添加轨道控制器
  const orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.05
  orbitControls.minDistance = 20
  orbitControls.maxDistance = 200
  orbitControls.maxPolarAngle = Math.PI / 2.2
  
  // 创建地形
  onProgress?.('生成地形...')
  const terrain = createTerrain(THREE, {
    size: 200,
    quality: settings
  })
  scene.add(terrain)
  
  // 创建水体
  onProgress?.('创建水体...')
  const water = createWater(THREE, {
    size: 200,
    segments: 128
  })
  scene.add(water)
  
  // 创建天空和太阳（或三体系统）
  let sky: any
  let sun: any
  let sunLight: any
  let trisolarisSystem: TrisolarisSystem | undefined
  
  if (props.enableTrisolaris) {
    // 三体系统模式
    onProgress?.('构建三体系统...')
    trisolarisSystem = createTrisolarisSky(THREE)
    sky = trisolarisSystem.sky
    scene.add(sky)
    
    // 添加三个太阳及其光源
    trisolarisSystem.suns.forEach(sunData => {
      scene.add(sunData.mesh)
      scene.add(sunData.light)
    })
    
    // 使用第一个太阳作为主太阳引用（用于兼容）
    sun = trisolarisSystem.suns[0].mesh
    sunLight = trisolarisSystem.suns[0].light
  } else {
    // 单太阳模式
    onProgress?.('构建天空...')
    const skySystem = createSky(THREE)
    sky = skySystem.sky
    sun = skySystem.sun
    scene.add(sky)
    scene.add(sun)
    
    // 设置光照
    onProgress?.('添加光照...')
    const lights = setupLights(THREE, settings)
    sunLight = lights.sunLight
    scene.add(lights.ambientLight)
    scene.add(sunLight)
    scene.add(lights.hemisphereLight)
    
    // 更新天空颜色
    updateSkyAndSun(THREE, sun, sunLight, sky, scene, props.initialTime)
  }
  
  // 如果不是三体系统，需要单独设置环境光
  if (!props.enableTrisolaris) {
    const lights = setupLights(THREE, settings)
    scene.add(lights.ambientLight)
    scene.add(lights.hemisphereLight)
  } else {
    // 三体系统也需要环境光和半球光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7c59, 0.5)
    scene.add(ambientLight)
    scene.add(hemisphereLight)
  }
  
  // 创建星空
  onProgress?.('创建星空...')
  const stars = createStars(THREE, 3000)
  scene.add(stars)
  
  // 创建云层
  onProgress?.('生成云层...')
  const clouds = createClouds(THREE, 15)
  clouds.forEach(cloud => scene.add(cloud))
  
  // 创建萤火虫
  onProgress?.('添加粒子效果...')
  const fireflies = createFireflies(THREE, 100)
  scene.add(fireflies)
  
  // 添加环境对象
  onProgress?.('添加环境装饰...')
  addEnvironmentObjects(THREE, scene, settings)
  
  // 创建篝火
  onProgress?.('点燃篝火...')
  const campfirePosition = new THREE.Vector3(0, 1, 20)
  const campfireSystem = createCampfire(THREE, campfirePosition)
  campfireSystem.logs.forEach(log => scene.add(log))
  scene.add(campfireSystem.particles)
  scene.add(campfireSystem.light)
  scene.add(campfireSystem.ambientLight)
  
  // 创建舞者
  onProgress?.('召唤舞者...')
  const { dancers, mixers } = await createDancers(
    THREE,
    GLTFLoader,
    FBXLoader,
    {
      campfirePosition,
      radius: 8,
      dancerCount: 12,
      useRealisticModels: props.useRealisticModels,
      characterModels: props.characterModels
    },
    onProgress
  )
  dancers.forEach(dancer => scene.add(dancer))
  
  // 设置后期处理
  onProgress?.('设置后期处理...')
  let composer = null
  if (postprocessing && settings.enablePostProcessing) {
    composer = setupPostProcessing(
      THREE,
      renderer,
      scene,
      camera,
      postprocessing,
      { width: props.width, height: props.height }
    )
  }
  
  onProgress?.('完成！')
  
  return {
    THREE,
    scene,
    camera,
    renderer,
    controls: orbitControls,
    terrain,
    water,
    sky,
    sun,
    sunLight,
    stars,
    clouds,
    fireflies,
    campfireSystem,
    dancers,
    mixers,
    composer,
    trisolarisSystem,
    enableTrisolaris: props.enableTrisolaris || false
  }
}

/**
 * 清理场景资源
 */
export function cleanupScene(state: Partial<SceneState>, container?: HTMLDivElement): void {
  // 清理动画混合器
  if (state.mixers) {
    state.mixers.forEach(mixer => {
      if (mixer && mixer.stopAllAction) {
        mixer.stopAllAction()
      }
    })
  }
  
  // 清理控制器
  if (state.controls && state.controls.dispose) {
    state.controls.dispose()
  }
  
  // 清理合成器
  if (state.composer && state.composer.dispose) {
    state.composer.dispose()
  }
  
  // 清理渲染器
  if (state.renderer && container) {
    try {
      container.removeChild(state.renderer.domElement)
    } catch (e) {
      // 忽略错误
    }
    state.renderer.dispose()
  }
  
  // 清理场景对象
  if (state.scene && state.THREE) {
    state.scene.traverse((object: any) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material: any) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }
}

