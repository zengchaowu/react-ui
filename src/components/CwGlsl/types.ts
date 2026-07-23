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
  uniforms?: Record<string, any>
  /** 顶点着色器代码，如果不提供则使用默认的 */
  vertexShader?: string
  /** 是否显示错误信息 */
  showErrors?: boolean
  /** 背景色 */
  backgroundColor?: string
}


export interface CwGlslStyles {
  root: string;
  canvas: string;
  controls?: string;
  controlButton?: string;
  controlButtonActive?: string;
  shaderEditor?: string;
  shaderHeader?: string;
  shaderTitle?: string;
  shaderContent?: string;
  shaderTextarea?: string;
  shaderButton?: string;
  loading?: string;
  loadingSpinner?: string;
  loadingText?: string;
  error?: string;
  errorIcon?: string;
  errorText?: string;
  retryButton?: string;
}

export interface CwGlslTexts {
  // Placeholder for texts
}

export interface CwGlslEmits {
  /** 着色器编译成功时触发 */
  compiled: []
  /** 着色器编译失败时触发 */
  error: [error: string]
  /** uniform变量更新时触发 */
  uniformUpdate: [name: string, value: any]
  /** 播放状态改变时触发 */
  playStateChange: [isPlaying: boolean]
}