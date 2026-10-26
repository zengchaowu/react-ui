import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import type {
  SkiaCanvasLike,
  SkiaCanvasRenderingContext2DLike,
  TpSkiaCanvasHandle,
  TpSkiaCanvasProps,
} from './types'
import { designPxToRem } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

type SkiaCanvasCtor = new (width: number, height: number) => SkiaCanvasLike

// 动态导入 skia-canvas（与 Vue 侧一致：字面量说明符，交给 Vite 解析依赖）
let Canvas: SkiaCanvasCtor | null = null

if (typeof window !== 'undefined') {
  import('skia-canvas')
    .then((module) => {
      Canvas = module.Canvas as unknown as SkiaCanvasCtor
    })
    .catch((err: unknown) => {
      console.error('Failed to load skia-canvas:', err)
    })
}

export const TpSkiaCanvas = forwardRef<TpSkiaCanvasHandle, TpSkiaCanvasProps>(
  function TpSkiaCanvas(
    {
      width: widthProp,
      height: heightProp,
      pixelRatio: pixelRatioProp,
      draw,
      animate: animateProp,
      autoRedraw,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onReady,
      onRedraw,
      onError,
      onMousedown,
      onMousemove,
      onMouseup,
      onMouseleave,
      onTouchstart,
      onTouchmove,
      onTouchend,
      onAnimationStart,
      onAnimationStop,
      onAnimationPause,
    },
    ref,
  ) {
    // 默认属性（与 Vue 一致：仅取初始值）
    const width = widthProp || 400
    const height = heightProp || 300
    const pixelRatio = pixelRatioProp || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1

    const canvasBoxStyle = useMemo<CSSProperties>(
      () => ({
        width: designPxToRem(width),
        height: designPxToRem(height),
      }),
      [width, height],
    )

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const skiaCanvasRef = useRef<SkiaCanvasLike | undefined>(undefined)
    const skiaCtxRef = useRef<SkiaCanvasRenderingContext2DLike | undefined>(undefined)

    // 交互状态
    const isMouseDownRef = useRef(false)
    const isDrawingRef = useRef(false)
    const lastMousePosRef = useRef({ x: 0, y: 0 })
    const currentMousePosRef = useRef({ x: 0, y: 0 })

    // 动画状态
    const animationIdRef = useRef<number | null>(null)
    const isAnimatingRef = useRef(false)
    const animationStartTimeRef = useRef(0)
    const frameCountRef = useRef(0)

    const callbacksRef = useRef({
      draw,
      animateProp,
      autoRedraw,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onReady,
      onRedraw,
      onError,
      onMousedown,
      onMousemove,
      onMouseup,
      onMouseleave,
      onTouchstart,
      onTouchmove,
      onTouchend,
      onAnimationStart,
      onAnimationStop,
      onAnimationPause,
    })
    callbacksRef.current = {
      draw,
      animateProp,
      autoRedraw,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onReady,
      onRedraw,
      onError,
      onMousedown,
      onMousemove,
      onMouseup,
      onMouseleave,
      onTouchstart,
      onTouchmove,
      onTouchend,
      onAnimationStart,
      onAnimationStop,
      onAnimationPause,
    }

    // 更新 Canvas 显示
    const updateCanvas = useCallback(async () => {
      const skiaCanvas = skiaCanvasRef.current
      if (!skiaCanvas || !canvasRef.current) return

      try {
        // 将 Skia Canvas 内容转换为图片数据
        const imageData = skiaCanvas.toDataURL('png')

        // 创建图片元素
        const img = new Image()
        img.onload = () => {
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
              // 不清空画布，直接绘制新内容
              ctx.drawImage(img, 0, 0, width * pixelRatio, height * pixelRatio)
            }
          }
        }
        img.src = imageData
      } catch (error) {
        console.error('Failed to update canvas:', error)
        callbacksRef.current.onError?.(error as Error)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, pixelRatio])

    // 重新绘制
    const redraw = useCallback(async () => {
      const skiaCtx = skiaCtxRef.current
      if (!skiaCtx) return

      try {
        // 清空画布
        skiaCtx.clearRect(0, 0, width, height)

        // 执行绘制函数
        const drawFn = callbacksRef.current.draw
        if (drawFn) {
          await drawFn(skiaCtx, width, height)
          await updateCanvas()
        }

        callbacksRef.current.onRedraw?.({
          ctx: skiaCtx,
          width,
          height,
        })
      } catch (error) {
        console.error('Failed to redraw:', error)
        callbacksRef.current.onError?.(error as Error)
      }
    }, [width, height, updateCanvas])

    // 初始化 Skia Canvas
    const initSkiaCanvas = useCallback(async () => {
      if (!canvasRef.current || !Canvas) return

      try {
        // 创建 Skia Canvas
        const skiaCanvas = new Canvas(width * pixelRatio, height * pixelRatio)
        skiaCanvasRef.current = skiaCanvas
        const skiaCtx = skiaCanvas.getContext('2d')
        skiaCtxRef.current = skiaCtx

        // 设置高分辨率支持
        skiaCtx.scale(pixelRatio, pixelRatio)

        // 触发初始化完成事件
        callbacksRef.current.onReady?.({
          canvas: skiaCanvas,
          ctx: skiaCtx,
          width,
          height,
        })

        // 如果提供了绘制函数，立即执行
        const drawFn = callbacksRef.current.draw
        if (drawFn) {
          await drawFn(skiaCtx, width, height)
          await updateCanvas()
        }
      } catch (error) {
        console.error('Failed to initialize Skia Canvas:', error)
        callbacksRef.current.onError?.(error as Error)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, pixelRatio, updateCanvas])

    // 获取鼠标位置（考虑像素比例）
    const getMousePos = useCallback(
      (event: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 }

        const rect = containerRef.current.getBoundingClientRect()
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

        // 计算相对于容器的坐标
        const x = clientX - rect.left
        const y = clientY - rect.top

        // 转换为画布坐标（考虑像素比例）
        return {
          x: x * pixelRatio,
          y: y * pixelRatio,
        }
      },
      [pixelRatio],
    )

    // 动画控制
    const startAnimation = useCallback(() => {
      const animateFn = callbacksRef.current.animateProp
      if (isAnimatingRef.current || !animateFn) return

      isAnimatingRef.current = true
      animationStartTimeRef.current = Date.now()
      frameCountRef.current = 0

      const animateFrame = (timestamp: number) => {
        if (!isAnimatingRef.current) return

        frameCountRef.current++

        // 执行动画绘制函数
        const skiaCtx = skiaCtxRef.current
        const currentAnimateFn = callbacksRef.current.animateProp
        if (currentAnimateFn && skiaCtx) {
          const deltaTime = timestamp - animationStartTimeRef.current
          const elapsed = deltaTime / 1000 // 转换为秒

          try {
            void currentAnimateFn(skiaCtx, width, height, elapsed, frameCountRef.current)
            void updateCanvas()
          } catch (error) {
            console.error('Animation error:', error)
            callbacksRef.current.onError?.(error as Error)
          }
        }

        animationIdRef.current = requestAnimationFrame(animateFrame)
      }

      animationIdRef.current = requestAnimationFrame(animateFrame)
      callbacksRef.current.onAnimationStart?.()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, updateCanvas])

    const stopAnimation = useCallback(() => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
        animationIdRef.current = null
      }
      isAnimatingRef.current = false
      callbacksRef.current.onAnimationStop?.()
    }, [])

    const pauseAnimation = useCallback(() => {
      stopAnimation()
      callbacksRef.current.onAnimationPause?.()
    }, [stopAnimation])

    const resumeAnimation = useCallback(() => {
      if (callbacksRef.current.animateProp) {
        startAnimation()
      }
    }, [startAnimation])

    // 鼠标事件处理
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      isMouseDownRef.current = true
      isDrawingRef.current = true
      const pos = getMousePos(nativeEvent)
      lastMousePosRef.current = pos
      currentMousePosRef.current = pos

      callbacksRef.current.onMousedown?.({ ...pos, event: nativeEvent })

      const skiaCtx = skiaCtxRef.current
      const handler = callbacksRef.current.onMouseDown
      if (handler && skiaCtx) {
        void handler(skiaCtx, pos.x, pos.y, nativeEvent)
        // 总是更新画布显示，让用户看到绘制结果
        void updateCanvas()
      }
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      const pos = getMousePos(nativeEvent)
      currentMousePosRef.current = pos

      callbacksRef.current.onMousemove?.({ ...pos, event: nativeEvent })

      // 只有在鼠标按下时才执行绘制和更新
      const skiaCtx = skiaCtxRef.current
      const handler = callbacksRef.current.onMouseMove
      if (handler && skiaCtx && isMouseDownRef.current) {
        void handler(skiaCtx, pos.x, pos.y, nativeEvent)
        // 总是更新画布显示
        void updateCanvas()
      }

      // 如果正在绘制，触发重绘
      if (isDrawingRef.current && callbacksRef.current.autoRedraw) {
        void redraw()
      }
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      isMouseDownRef.current = false
      isDrawingRef.current = false

      const pos = getMousePos(nativeEvent)
      callbacksRef.current.onMouseup?.({ ...pos, event: nativeEvent })

      const skiaCtx = skiaCtxRef.current
      const handler = callbacksRef.current.onMouseUp
      if (handler && skiaCtx) {
        void handler(skiaCtx, pos.x, pos.y, nativeEvent)
      }
    }

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      isMouseDownRef.current = false
      isDrawingRef.current = false
      callbacksRef.current.onMouseleave?.({ event: nativeEvent })
    }

    // 触摸事件处理
    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      event.preventDefault()
      isMouseDownRef.current = true
      isDrawingRef.current = true
      const pos = getMousePos(nativeEvent)
      lastMousePosRef.current = pos
      currentMousePosRef.current = pos

      callbacksRef.current.onTouchstart?.({ ...pos, event: nativeEvent })

      const skiaCtx = skiaCtxRef.current
      const handler = callbacksRef.current.onTouchStart
      if (handler && skiaCtx) {
        void handler(skiaCtx, pos.x, pos.y, nativeEvent)
        void updateCanvas()
      }
    }

    const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      event.preventDefault()
      if (!isMouseDownRef.current) return

      const pos = getMousePos(nativeEvent)
      currentMousePosRef.current = pos

      callbacksRef.current.onTouchmove?.({ ...pos, event: nativeEvent })

      const skiaCtx = skiaCtxRef.current
      const handler = callbacksRef.current.onTouchMove
      if (handler && skiaCtx && isMouseDownRef.current) {
        void handler(skiaCtx, pos.x, pos.y, nativeEvent)
        void updateCanvas()
      }

      if (isDrawingRef.current && callbacksRef.current.autoRedraw) {
        void redraw()
      }
    }

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent
      event.preventDefault()
      isMouseDownRef.current = false
      isDrawingRef.current = false

      const pos = getMousePos(nativeEvent)
      callbacksRef.current.onTouchend?.({ ...pos, event: nativeEvent })

      const skiaCtx = skiaCtxRef.current
      const handler = callbacksRef.current.onTouchEnd
      if (handler && skiaCtx) {
        void handler(skiaCtx, pos.x, pos.y, nativeEvent)
        void updateCanvas()
      }
    }

    // 监听尺寸变化（对应 Vue watch [width, height]）
    const isFirstSizeRenderRef = useRef(true)
    useEffect(() => {
      if (isFirstSizeRenderRef.current) {
        isFirstSizeRenderRef.current = false
        return
      }
      if (skiaCanvasRef.current) {
        void initSkiaCanvas()
      }
    }, [width, height, initSkiaCanvas])

    // 监听绘制函数变化（对应 Vue watch props.draw）
    const isFirstDrawRenderRef = useRef(true)
    useEffect(() => {
      if (isFirstDrawRenderRef.current) {
        isFirstDrawRenderRef.current = false
        return
      }
      if (skiaCtxRef.current) {
        void redraw()
      }
    }, [draw, redraw])

    // 监听动画函数变化（对应 Vue watch props.animate）
    useEffect(() => {
      if (animateProp && !isAnimatingRef.current) {
        startAnimation()
      } else if (!animateProp && isAnimatingRef.current) {
        stopAnimation()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animateProp])

    // 监听自动重绘变化（对应 Vue watch props.autoRedraw）
    useEffect(() => {
      if (autoRedraw && isDrawingRef.current) {
        void redraw()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRedraw])

    // 挂载：等待 skia-canvas 加载完成后初始化（对应 Vue onMounted）
    useEffect(() => {
      let checkInterval: ReturnType<typeof setInterval> | null = null
      let timeout: ReturnType<typeof setTimeout> | null = null

      if (Canvas) {
        void initSkiaCanvas().then(() => {
          // 如果提供了动画函数，自动开始动画
          if (callbacksRef.current.animateProp) {
            startAnimation()
          }
        })
      } else {
        // 如果还未加载，监听加载完成
        checkInterval = setInterval(() => {
          if (Canvas) {
            if (checkInterval) clearInterval(checkInterval)
            void initSkiaCanvas().then(() => {
              if (callbacksRef.current.animateProp) {
                startAnimation()
              }
            })
          }
        }, 100)

        // 5秒超时
        timeout = setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval)
        }, 5000)
      }

      return () => {
        if (checkInterval) clearInterval(checkInterval)
        if (timeout) clearTimeout(timeout)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 卸载（对应 Vue onUnmounted）
    useEffect(() => {
      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current)
          animationIdRef.current = null
        }
        isAnimatingRef.current = false
        if (skiaCanvasRef.current) {
          skiaCanvasRef.current = undefined
        }
      }
    }, [])

    useImperativeHandle(ref, () => ({
      getCanvas: () => skiaCanvasRef.current,
      getContext: () => skiaCtxRef.current,
      getImageData: () => skiaCanvasRef.current?.toDataURL('png'),
      getMousePosition: () => currentMousePosRef.current,
      isDrawingState: () => isDrawingRef.current,
      isAnimatingState: () => isAnimatingRef.current,
      redraw,
      updateCanvas,
      startAnimation,
      stopAnimation,
      pauseAnimation,
      resumeAnimation,
    }), [redraw, updateCanvas, startAnimation, stopAnimation, pauseAnimation, resumeAnimation])

    return (
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-crosshair"
        style={canvasBoxStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={width * pixelRatio}
          height={height * pixelRatio}
          style={{
            width: canvasBoxStyle.width,
            height: canvasBoxStyle.height,
            transform: `scale(${1 / pixelRatio})`,
            transformOrigin: 'top left',
          }}
          className="absolute top-0 left-0"
        />
      </div>
    )
  },
)

export default TpSkiaCanvas
