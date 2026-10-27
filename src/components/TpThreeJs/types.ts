import type * as THREE from 'three'
import type { TpThreeJsTexts } from '@zengchaowu/ui-shared/components/TpThreeJs/types'

export interface TpThreeJsReadyPayload {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
}

export interface TpThreeJsProps {
  /** 容器宽度，不设置则自适应 */
  width?: number
  /** 容器高度，默认384px */
  height?: number
  /** 是否显示控制面板 */
  showControls?: boolean
  /** 是否自动旋转 */
  autoRotate?: boolean
  /** 背景颜色 */
  backgroundColor?: number | string
  /** 相机位置 */
  cameraPosition?: {
    x: number
    y: number
    z: number
  }
  /** 容器额外的CSS类名 */
  containerClass?: string
  // 3D模型相关属性
  modelUrl?: string
  modelScale?: number
  enableOrbitControls?: boolean
  showWireframe?: boolean
  enableLights?: boolean
  /**
   * 自定义文本对象
   */
  texts?: TpThreeJsTexts
  /** Three.js初始化完成（对应 Vue `ready`） */
  onReady?: (payload: TpThreeJsReadyPayload) => void
  /** 初始化错误（对应 Vue `error`） */
  onError?: (error: unknown) => void
  /** 动画帧更新（对应 Vue `animate`） */
  onAnimate?: (payload: TpThreeJsReadyPayload) => void
  /** 动画切换（对应 Vue `animationToggle`） */
  onAnimationToggle?: (isAnimating: boolean) => void
  /** 相机重置（对应 Vue `cameraReset`） */
  onCameraReset?: () => void
  /** 容器大小变化（对应 Vue `resize`） */
  onResize?: (payload: { width: number; height: number }) => void
  /** 模型加载完成（对应 Vue `modelLoaded`） */
  onModelLoaded?: (model: THREE.Group) => void
  /** 模型加载失败（对应 Vue `modelError`） */
  onModelError?: (error: unknown) => void
}
