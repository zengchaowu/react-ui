export interface CwGlslProps {
  /** GLSL代码字符串 */
  code: string
  /** 画布宽度 */
  width?: number
  /** 画布高度 */
  height?: number
  /** 是否自动播放动画 */
  autoPlay?: boolean
  /** 是否显示控制面板 */
  showControls?: boolean
  /** 自定义uniform变量 */
  uniforms?: Record<string, unknown>
  /** 顶点着色器代码，如果不提供则使用默认的 */
  vertexShader?: string
  /** 是否显示错误信息 */
  showErrors?: boolean
  /** 背景色 */
  backgroundColor?: string
}

/** 由 GLSL uniform 声明解析出的控制器配置 */
export interface CwGlslUniformControl {
  type: 'float' | 'int' | 'color'
  value: number | string
  min?: number
  max?: number
  step?: number
}

export interface CwGlslTexts {
  shaderEditor?: string
  vertexShader?: string
  fragmentShader?: string
  compile?: string
  reset?: string
  play?: string
  pause?: string
  fullscreen?: string
  loading?: string
  error?: string
  retry?: string
  compileSuccess?: string
  compileError?: string
  invalidShader?: string
  unsupportedFeature?: string
}

export interface CwGlslEmits {
  /** 着色器编译成功时触发 */
  onCompiled?: () => void
  /** 着色器编译失败时触发 */
  onError?: (error: string) => void
  /** uniform变量更新时触发 */
  onUniformUpdate?: (name: string, value: number | string) => void
  /** 播放状态改变时触发 */
  onPlayStateChange?: (isPlaying: boolean) => void
}
