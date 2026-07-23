export interface TpHeroSceneProps {
  /** 容器宽度 */
  width: number
  /** 容器高度 */
  height: number
  /** 是否显示控制面板 */
  showControls?: boolean
  /** 是否自动播放时间流逝 */
  autoPlay?: boolean
  /** 时间速度倍率 (1 = 正常速度) */
  timeSpeed?: number
  /** 初始时间 (0-24小时) */
  initialTime: number
  /** 画质级别 */
  quality: 'low' | 'medium' | 'high'
  /** 是否启用后期处理 */
  enablePostProcessing?: boolean
  /** 容器额外的CSS类名 */
  containerClass?: string
  /** 使用真实的3D模型而不是程序化生成 */
  useRealisticModels: boolean
  /** 角色模型URL数组（支持 GLTF/GLB/FBX 格式） */
  characterModels?: string[]
  /** 环境模型URL（树木、岩石等） */
  environmentModels?: {
    trees?: string[]
    rocks?: string[]
    grass?: string
  }
  /** 启用三体系统（三个太阳） */
  enableTrisolaris?: boolean
}


export interface TpHeroSceneStyles {
  root: string;
  canvas: string;
  overlay?: string;
  content?: string;
  title?: string;
  subtitle?: string;
  button?: string;
  controls?: string;
  controlButton?: string;
  controlButtonActive?: string;
  loading?: string;
  loadingSpinner?: string;
  loadingText?: string;
  error?: string;
  errorIcon?: string;
  errorText?: string;
  retryButton?: string;
}

export interface TpHeroSceneTexts {
  // Placeholder for texts
}

export interface TpHeroSceneEmits {
  /** 场景初始化完成 */
  ready: [payload: { scene: any; camera: any; renderer: any }]
  /** 初始化错误 */
  error: [error: any]
  /** 时间变化 */
  timeChange: [time: number]
  /** 动画帧更新 */
  animate: []
}

export interface SceneQuality {
  terrainDetail: number
  shadowMapSize: number
  pixelRatio: number
  antialias: boolean
  enableFog: boolean
  enablePostProcessing: boolean
}

