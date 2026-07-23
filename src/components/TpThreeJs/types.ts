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
   * 自定义样式对象
   */
  styles?: TpThreeJsStyles
  /**
   * 自定义文本对象
   */
  texts?: TpThreeJsTexts
}

export interface TpThreeJsStyles {
  root: string
  loadingOverlay: string
  loadingContent: string
  loadingSpinner: string
  loadingText: string
  loadingSubtext: string
  errorOverlay: string
  errorContent: string
  errorIcon: string
  errorIconSvg: string
  errorTitle: string
  errorMessage: string
  retryButton: string
  controlsOverlay: string
  controlsButton: string
  controlsButtonActive: string
  statsContainer: string
  statsPanel: string
}

export interface TpThreeJsTexts {
  loadingMain: string
  loadingSub: string
  errorTitle: string
  retryText: string
  playText: string
  pauseText: string
  resetText: string
  fullscreenText: string
  exitFullscreenText: string
  wireframeText: string
  statsText: string
}

export interface TpThreeJsEmits {
  /** Three.js初始化完成 */
  ready: [payload: { scene: any; camera: any; renderer: any }]
  /** 初始化错误 */
  error: [error: any]
  /** 动画帧更新 */
  animate: [payload: { scene: any; camera: any; renderer: any }]
  /** 动画切换 */
  animationToggle: [isAnimating: boolean]
  /** 相机重置 */
  cameraReset: []
  /** 容器大小变化 */
  resize: [payload: { width: number; height: number }]
  modelLoaded: [model: any]
  modelError: [error: any]
}