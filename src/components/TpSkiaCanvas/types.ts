/**
 * skia-canvas 是 Node.js 原生模块，浏览器端无法安装/解析。
 * Vue 侧通过 `import type ... from 'skia-canvas'` 引入类型并动态加载；
 * React 侧保持相同的运行时动态导入语义，类型用最小结构类型替代。
 */

/** skia-canvas `Canvas` 的最小结构 */
export interface SkiaCanvasLike {
  width: number
  height: number
  getContext: (contextType: '2d') => SkiaCanvasRenderingContext2DLike
  toDataURL: (format?: string) => string
}

/** skia-canvas `CanvasRenderingContext2D` 的最小结构（兼容 DOM 2D 上下文） */
export type SkiaCanvasRenderingContext2DLike = CanvasRenderingContext2D &
  Record<string, unknown>

// 绘制函数类型
export type DrawFunction = (
  ctx: SkiaCanvasRenderingContext2DLike,
  width: number,
  height: number
) => void | Promise<void>

// 动画函数类型
export type AnimationFunction = (
  ctx: SkiaCanvasRenderingContext2DLike,
  width: number,
  height: number,
  elapsed: number,
  frameCount: number
) => void | Promise<void>

// 交互事件函数类型
export type InteractionFunction = (
  ctx: SkiaCanvasRenderingContext2DLike,
  x: number,
  y: number,
  event: MouseEvent | TouchEvent
) => void | Promise<void>

// 组件属性接口
export interface TpSkiaCanvasProps {
  /** 画布宽度 */
  width?: number
  /** 画布高度 */
  height?: number
  /** 像素比例，用于高分辨率支持 */
  pixelRatio?: number
  /** 绘制函数，用于自定义绘制内容 */
  draw?: DrawFunction
  /** 动画函数，用于连续动画绘制 */
  animate?: AnimationFunction
  /** 是否自动重绘 */
  autoRedraw?: boolean
  /** 背景色 */
  backgroundColor?: string
  /** 鼠标按下事件处理函数 */
  onMouseDown?: InteractionFunction
  /** 鼠标移动事件处理函数 */
  onMouseMove?: InteractionFunction
  /** 鼠标抬起事件处理函数 */
  onMouseUp?: InteractionFunction
  /** 触摸开始事件处理函数 */
  onTouchStart?: InteractionFunction
  /** 触摸移动事件处理函数 */
  onTouchMove?: InteractionFunction
  /** 触摸结束事件处理函数 */
  onTouchEnd?: InteractionFunction
  /** 画布初始化完成事件（对应 Vue `ready`） */
  onReady?: (data: {
    canvas: SkiaCanvasLike
    ctx: SkiaCanvasRenderingContext2DLike
    width: number
    height: number
  }) => void
  /** 重绘事件（对应 Vue `redraw`） */
  onRedraw?: (data: {
    ctx: SkiaCanvasRenderingContext2DLike
    width: number
    height: number
  }) => void
  /** 错误事件（对应 Vue `error`） */
  onError?: (error: Error) => void
  /** 鼠标按下事件（对应 Vue `mousedown`） */
  onMousedown?: (data: { x: number; y: number; event: MouseEvent }) => void
  /** 鼠标移动事件（对应 Vue `mousemove`） */
  onMousemove?: (data: { x: number; y: number; event: MouseEvent }) => void
  /** 鼠标抬起事件（对应 Vue `mouseup`） */
  onMouseup?: (data: { x: number; y: number; event: MouseEvent }) => void
  /** 鼠标离开事件（对应 Vue `mouseleave`） */
  onMouseleave?: (data: { event: MouseEvent }) => void
  /** 触摸开始事件（对应 Vue `touchstart`） */
  onTouchstart?: (data: { x: number; y: number; event: TouchEvent }) => void
  /** 触摸移动事件（对应 Vue `touchmove`） */
  onTouchmove?: (data: { x: number; y: number; event: TouchEvent }) => void
  /** 触摸结束事件（对应 Vue `touchend`） */
  onTouchend?: (data: { x: number; y: number; event: TouchEvent }) => void
  /** 动画开始事件（对应 Vue `animationStart`） */
  onAnimationStart?: () => void
  /** 动画停止事件（对应 Vue `animationStop`） */
  onAnimationStop?: () => void
  /** 动画暂停事件（对应 Vue `animationPause`） */
  onAnimationPause?: () => void
}

export interface TpSkiaCanvasTexts {
  loading?: string
  error?: string
  retry?: string
  clear?: string
  undo?: string
  redo?: string
  save?: string
  export?: string
  brush?: string
  eraser?: string
  line?: string
  rectangle?: string
  circle?: string
  text?: string
  color?: string
  size?: string
  opacity?: string
}

// 画布配置接口
export interface SkiaCanvasConfig {
  width: number
  height: number
  pixelRatio: number
  backgroundColor?: string
}

// 绘制上下文接口
export interface DrawContext {
  ctx: SkiaCanvasRenderingContext2DLike
  width: number
  height: number
  canvas: SkiaCanvasLike
}

// 动画帧接口
export interface AnimationFrame {
  elapsed: number
  frameCount: number
  deltaTime: number
}

// 鼠标位置接口
export interface MousePosition {
  x: number
  y: number
}

// 交互数据接口
export interface InteractionData {
  x: number
  y: number
  event: MouseEvent | TouchEvent
}

/** `defineExpose` 等价物：通过 ref 调用 */
export interface TpSkiaCanvasHandle {
  getCanvas: () => SkiaCanvasLike | undefined
  getContext: () => SkiaCanvasRenderingContext2DLike | undefined
  getImageData: () => string | undefined
  getMousePosition: () => MousePosition
  isDrawingState: () => boolean
  isAnimatingState: () => boolean
  redraw: () => Promise<void>
  updateCanvas: () => Promise<void>
  startAnimation: () => void
  stopAnimation: () => void
  pauseAnimation: () => void
  resumeAnimation: () => void
}
