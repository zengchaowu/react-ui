import type { Canvas, CanvasRenderingContext2D } from 'skia-canvas'

// 绘制函数类型
export type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => void | Promise<void>

// 动画函数类型
export type AnimationFunction = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  frameCount: number
) => void | Promise<void>

// 交互事件函数类型
export type InteractionFunction = (
  ctx: CanvasRenderingContext2D,
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
}

// 组件事件接口

export interface TpSkiaCanvasStyles {
  root: string;
  canvas: string;
  toolbar: string;
  toolbarLeft?: string;
  toolbarRight?: string;
  button?: string;
  buttonActive?: string;
  loading?: string;
  loadingSpinner?: string;
  loadingText?: string;
  error?: string;
  errorIcon?: string;
  errorText?: string;
  retryButton?: string;
}

export interface TpSkiaCanvasTexts {
  // Placeholder for texts
}

export interface TpSkiaCanvasEmits {
  /** 画布初始化完成事件 */
  ready: [data: {
    canvas: Canvas
    ctx: CanvasRenderingContext2D
    width: number
    height: number
  }]
  /** 重绘事件 */
  redraw: [data: {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
  }]
  /** 错误事件 */
  error: [error: Error]
  /** 鼠标按下事件 */
  mousedown: [data: { x: number; y: number; event: MouseEvent }]
  /** 鼠标移动事件 */
  mousemove: [data: { x: number; y: number; event: MouseEvent }]
  /** 鼠标抬起事件 */
  mouseup: [data: { x: number; y: number; event: MouseEvent }]
  /** 鼠标离开事件 */
  mouseleave: [data: { event: MouseEvent }]
  /** 触摸开始事件 */
  touchstart: [data: { x: number; y: number; event: TouchEvent }]
  /** 触摸移动事件 */
  touchmove: [data: { x: number; y: number; event: TouchEvent }]
  /** 触摸结束事件 */
  touchend: [data: { x: number; y: number; event: TouchEvent }]
  /** 动画开始事件 */
  animationStart: []
  /** 动画停止事件 */
  animationStop: []
  /** 动画暂停事件 */
  animationPause: []
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
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  canvas: Canvas
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