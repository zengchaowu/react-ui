import type * as THREE from 'three'

export interface TpHeroSceneReadyPayload {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
}

export interface TpHeroSceneProps {
  /** 容器宽度 */
  width?: number
  /** 容器高度 */
  height?: number
  /** 是否显示控制面板 */
  showControls?: boolean
  /** 是否自动播放时间流逝 */
  autoPlay?: boolean
  /** 时间速度倍率 (1 = 正常速度) */
  timeSpeed?: number
  /** 初始时间 (0-24小时) */
  initialTime?: number
  /** 画质级别 */
  quality?: 'low' | 'medium' | 'high'
  /** 是否启用后期处理 */
  enablePostProcessing?: boolean
  /** 容器额外的CSS类名 */
  containerClass?: string
  /** 使用真实的3D模型而不是程序化生成 */
  useRealisticModels?: boolean
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
  className?: string
  /** 场景初始化完成（对应 Vue `ready`） */
  onReady?: (payload: TpHeroSceneReadyPayload) => void
  /** 初始化错误（对应 Vue `error`） */
  onError?: (error: unknown) => void
  /** 时间变化（对应 Vue `timeChange`） */
  onTimeChange?: (time: number) => void
  /** 动画帧更新（对应 Vue `animate`） */
  onAnimate?: () => void
}

/**
 * 应用 withDefaults 默认值后的解析 props（供 lib 场景函数使用）。
 * Vue 中 defineProps 的必填字段由 withDefaults 保证存在，React 中在组件解构时兜底。
 */
export type TpHeroSceneResolvedProps = Omit<
  TpHeroSceneProps,
  | 'width'
  | 'height'
  | 'initialTime'
  | 'quality'
  | 'useRealisticModels'
  | 'enablePostProcessing'
  | 'enableTrisolaris'
  | 'className'
  | 'onReady'
  | 'onError'
  | 'onTimeChange'
  | 'onAnimate'
> & {
  width: number
  height: number
  initialTime: number
  quality: 'low' | 'medium' | 'high'
  useRealisticModels: boolean
  enablePostProcessing: boolean
  enableTrisolaris: boolean
}

export type { SceneQuality } from '@zengchaowu/ui-shared/components/TpHeroScene/types'
