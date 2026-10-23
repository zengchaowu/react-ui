import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CwSlider } from '../CwSlider'
import { CwGrid } from '../CwGrid'
import type { SceneQuality, TpHeroSceneProps, TpHeroSceneResolvedProps } from './types'
import { initScene, cleanupScene, type SceneState } from './lib/scene'
import { updateSkyAndSun } from './lib/sky'
import { updateAllAnimations } from './lib/animation'
import { formatTime, getTimeOfDay, getTimeEmoji } from './lib/utils'
import { updateTrisolarisSystem, getTrisolarisStatus, getTrisolarisEra } from './lib/trisolaris'

interface TrisolarisEraState {
  type: '恒纪元' | '乱纪元'
  emoji: string
  description: string
}

export function TpHeroScene({
  width = 1920,
  height = 1080,
  showControls = true,
  autoPlay = true,
  timeSpeed = 1.0,
  initialTime = 19,
  quality = 'high',
  enablePostProcessing = true,
  containerClass = '',
  useRealisticModels = true,
  characterModels = [
    '/models/dance1.fbx',
    '/models/dance2.fbx',
    '/models/dance3.fbx'
  ],
  environmentModels = {},
  enableTrisolaris = false,
  className,
  onReady,
  onError,
  onTimeChange,
  onAnimate,
}: TpHeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState('初始化...')
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
  const [timeSpeedState, setTimeSpeed] = useState(timeSpeed)
  const [qualityState, setQualityState] = useState<'low' | 'medium' | 'high'>(quality)
  const [fps, setFps] = useState(60)
  const [drawCalls, setDrawCalls] = useState(0)

  // 三体系统状态
  const [trisolarisStatus, setTrisolarisStatus] = useState('初始化中...')
  const [trisolarisEra, setTrisolarisEra] = useState<TrisolarisEraState>({
    type: '恒纪元',
    emoji: '☀️',
    description: '气候稳定，适宜生存'
  })

  // 场景状态（非响应式，对应 Vue setup 内的普通变量）
  const sceneStateRef = useRef<Partial<SceneState>>({})
  const animationIdRef = useRef<number | null>(null)
  const lastTimeRef = useRef(performance.now())
  const frameCountRef = useRef(0)
  const cancelledRef = useRef(false)

  // 动画循环内读取最新值的 ref 镜像
  const currentTimeRef = useRef(currentTime)
  const isAutoPlayingRef = useRef(isAutoPlaying)
  const timeSpeedRef = useRef(timeSpeed)
  isAutoPlayingRef.current = isAutoPlaying
  timeSpeedRef.current = timeSpeedState

  // 应用默认值后的解析 props（对应 Vue withDefaults 后的 props）
  const resolvedPropsRef = useRef<TpHeroSceneResolvedProps>({
    width,
    height,
    initialTime,
    quality,
    enablePostProcessing,
    enableTrisolaris,
    useRealisticModels,
    showControls,
    autoPlay,
    timeSpeed,
    containerClass,
    characterModels,
    environmentModels,
  })
  resolvedPropsRef.current = {
    width,
    height,
    initialTime,
    quality,
    enablePostProcessing,
    enableTrisolaris,
    useRealisticModels,
    showControls,
    autoPlay,
    timeSpeed,
    containerClass,
    characterModels,
    environmentModels,
  }

  const callbacksRef = useRef({ onReady, onError, onTimeChange, onAnimate })
  callbacksRef.current = { onReady, onError, onTimeChange, onAnimate }

  // 容器样式
  const containerStyle = useMemo<CSSProperties>(() => ({
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100vh'
  }), [width, height])

  // 动画循环
  const animate = useCallback(() => {
    const sceneState = sceneStateRef.current
    if (!sceneState.renderer || !sceneState.scene || !sceneState.camera) return

    animationIdRef.current = requestAnimationFrame(animate)

    const time = Date.now() * 0.001

    // 更新控制器
    if (sceneState.controls && sceneState.controls.update) {
      sceneState.controls.update()
    }

    // 自动播放时间
    if (isAutoPlayingRef.current) {
      let nextTime = currentTimeRef.current + (timeSpeedRef.current * 0.01)
      if (nextTime > 24) {
        nextTime = 0
      }
      currentTimeRef.current = nextTime
      setCurrentTime(nextTime)
    }

    // 更新天空和太阳（或三体系统）
    if (sceneState.enableTrisolaris && sceneState.trisolarisSystem) {
      // 三体系统更新
      updateTrisolarisSystem(
        sceneState.THREE,
        sceneState.trisolarisSystem,
        sceneState.scene,
        time,
        0.016
      )
    } else if (sceneState.THREE && sceneState.sun && sceneState.sunLight && sceneState.sky && sceneState.scene) {
      // 单太阳系统更新
      updateSkyAndSun(
        sceneState.THREE,
        sceneState.sun,
        sceneState.sunLight,
        sceneState.sky,
        sceneState.scene,
        currentTimeRef.current
      )
    }

    // 更新所有动画
    updateAllAnimations(
      {
        water: sceneState.water,
        stars: sceneState.stars,
        clouds: sceneState.clouds || [],
        fireflies: sceneState.fireflies,
        campfireParticles: sceneState.campfireSystem?.particles,
        campfireLight: sceneState.campfireSystem?.light,
        dancers: sceneState.dancers || [],
        mixers: sceneState.mixers || []
      },
      time,
      currentTimeRef.current
    )

    // FPS 计算和三体状态更新
    frameCountRef.current++
    const currentTimestamp = performance.now()
    if (currentTimestamp >= lastTimeRef.current + 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (currentTimestamp - lastTimeRef.current)))
      frameCountRef.current = 0
      lastTimeRef.current = currentTimestamp

      // 更新渲染统计
      if (sceneState.renderer.info) {
        setDrawCalls(sceneState.renderer.info.render.calls)
      }

      // 更新三体系统状态显示
      if (sceneState.enableTrisolaris && sceneState.trisolarisSystem) {
        setTrisolarisStatus(getTrisolarisStatus(sceneState.trisolarisSystem.suns))
        setTrisolarisEra(getTrisolarisEra(sceneState.trisolarisSystem.suns))
      }
    }

    // 渲染场景
    if (sceneState.composer && sceneState.composer.render) {
      sceneState.composer.render()
    } else {
      sceneState.renderer.render(sceneState.scene, sceneState.camera)
    }

    callbacksRef.current.onAnimate?.()
  }, [])

  // 初始化场景
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const container = containerRef.current
      if (!container) {
        throw new Error('容器元素未找到')
      }

      const props = resolvedPropsRef.current

      // 质量配置
      const qualitySettings: Record<string, SceneQuality> = {
        low: {
          terrainDetail: 128,
          shadowMapSize: 1024,
          pixelRatio: 1,
          antialias: false,
          enableFog: true,
          enablePostProcessing: false
        },
        medium: {
          terrainDetail: 256,
          shadowMapSize: 2048,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          antialias: true,
          enableFog: true,
          enablePostProcessing: false
        },
        high: {
          terrainDetail: 512,
          shadowMapSize: 4096,
          pixelRatio: window.devicePixelRatio,
          antialias: true,
          enableFog: true,
          enablePostProcessing: props.enablePostProcessing
        }
      }

      const sceneState = await initScene({
        container,
        props,
        qualitySettings,
        onProgress: (status) => {
          if (!cancelledRef.current) {
            setLoadingStatus(status)
          }
        }
      })

      if (cancelledRef.current) {
        cleanupScene(sceneState, container)
        return
      }

      sceneStateRef.current = sceneState

      setIsLoading(false)
      callbacksRef.current.onReady?.({
        scene: sceneState.scene,
        camera: sceneState.camera,
        renderer: sceneState.renderer
      })

      // 开始动画
      animate()
    } catch (err) {
      if (cancelledRef.current) return
      console.error('场景初始化失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
      callbacksRef.current.onError?.(err)
      setIsLoading(false)
    }
  }, [animate])

  // 清理资源
  const cleanup = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }

    cleanupScene(sceneStateRef.current, containerRef.current ?? undefined)
    sceneStateRef.current = {}
  }, [])

  // 切换自动播放
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev)
  }, [])

  // 更改画质
  const changeQuality = useCallback((newQuality: 'low' | 'medium' | 'high') => {
    setQualityState(newQuality)
    cleanup()
    void initialize()
  }, [cleanup, initialize])

  // 重试
  const retry = useCallback(() => {
    cleanup()
    void initialize()
  }, [cleanup, initialize])

  // 滑块时间变更（v-model:currentTime）
  const handleTimeChange = useCallback((value: number) => {
    currentTimeRef.current = value
    setCurrentTime(value)
  }, [])

  // 监听时间变化（对应 Vue watch currentTime -> emit timeChange）
  const isFirstTimeRef = useRef(true)
  useEffect(() => {
    if (isFirstTimeRef.current) {
      isFirstTimeRef.current = false
      return
    }
    callbacksRef.current.onTimeChange?.(currentTime)
  }, [currentTime])

  // 监听尺寸变化（对应 Vue watch [width, height]）
  const isFirstResizeRef = useRef(true)
  useEffect(() => {
    if (isFirstResizeRef.current) {
      isFirstResizeRef.current = false
      return
    }
    const sceneState = sceneStateRef.current
    if (sceneState.camera && sceneState.renderer) {
      sceneState.camera.aspect = width / height
      sceneState.camera.updateProjectionMatrix()
      sceneState.renderer.setSize(width, height)
    }
  }, [width, height])

  // 生命周期：挂载初始化，卸载清理
  useEffect(() => {
    cancelledRef.current = false
    void initialize()

    return () => {
      cancelledRef.current = true
      cleanup()
    }
  }, [initialize, cleanup])

  return (
    <div
      ref={containerRef}
      className={['relative overflow-hidden bg-[var(--scrim-base)]', containerClass, className].filter(Boolean).join(' ')}
      style={containerStyle}
    >
      {/* Loading状态 */}
      {isLoading && (
        <div
          className="absolute inset-0 z-[var(--z-index-scene-overlay)] flex flex-col items-center justify-center bg-gradient-to-b from-[var(--scrim-base)] to-[var(--scrim-base)]"
        >
          <div className="text-center text-[var(--text-color-anti)]">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-[var(--brand-color-6)] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-[var(--purple-color-6)] border-t-transparent rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
            </div>
            <p className="text-lg font-semibold mb-2">正在构建世界...</p>
            <p className="text-sm text-[var(--text-color-disabled)]">加载 Three.js 和场景资源</p>
            <div className="mt-4 text-xs text-[var(--text-color-placeholder)]">
              <p>{loadingStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div
          className="absolute inset-0 z-[var(--z-index-scene-overlay)] flex items-center justify-center bg-gradient-to-b from-[var(--error-color-active)] to-[var(--scrim-base)]"
        >
          <div className="p-6 text-center text-[var(--text-color-anti)]">
            <div className="mb-4 text-[var(--error-color-special)]">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg mb-3">场景加载失败</p>
            <p className="text-sm text-[var(--text-color-disabled)] mb-4">{error}</p>
            <div
              onClick={retry}
              className="px-6 py-2 bg-[var(--error-color-6)] hover:bg-[var(--error-color-hover)] rounded-lg text-sm transition-colors cursor-pointer inline-block"
            >
              重新加载
            </div>
          </div>
        </div>
      )}

      {/* 控制面板 */}
      {showControls && !isLoading && !error && (
        <div
          className="absolute top-4 right-4 z-[var(--z-index-fixed-column-shadow)] min-w-64 rounded-xl border border-[color-mix(in_srgb,var(--text-color-anti)_10%,transparent)] bg-[color-mix(in_srgb,var(--scrim-base)_60%,transparent)] p-4 backdrop-blur-sm"
        >
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[var(--text-color-anti)] mb-3 pb-3 hairline-border-b border-[var(--bg-color-component)]">
              🌍 场景控制
            </div>

            {/* 时间控制 */}
            <div className="space-y-2">
              <div className="text-xs text-[var(--text-color-disabled)] flex justify-between">
                <span>时间: {formatTime(currentTime)}</span>
                <span className="text-[var(--brand-color-special)]">{getTimeOfDay(currentTime)}</span>
              </div>
              <CwSlider
                value={currentTime}
                onChange={handleTimeChange}
                min={0}
                max={24}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* 自动播放 */}
            <div
              onClick={toggleAutoPlay}
              className={[
                'w-full px-3 py-2 text-xs rounded-lg transition-all cursor-pointer text-center',
                isAutoPlaying ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--brand-color-hover)]' : 'bg-[var(--bg-color-component)] text-[var(--text-color-placeholder)] hover:bg-[var(--bg-color-secondarycomponent-hover)]'
              ].filter(Boolean).join(' ')}
            >
              {isAutoPlaying ? '⏸ 暂停时间' : '▶ 播放时间'}
            </div>

            {/* 时间速度 */}
            <div className="space-y-2">
              <div className="text-xs text-[var(--text-color-disabled)]">
                速度: {timeSpeedState.toFixed(1)}x
              </div>
              <CwSlider
                value={timeSpeedState}
                onChange={setTimeSpeed}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* 质量设置 */}
            <div className="pt-3 hairline-border-t border-[var(--bg-color-component)]">
              <div className="text-xs text-[var(--text-color-disabled)] block mb-2">画质</div>
              <CwGrid columns={3} gutter={8} rowGap={0} align="stretch">
                {(['low', 'medium', 'high'] as const).map(q => (
                  <div
                    key={q}
                    onClick={() => changeQuality(q)}
                    className={[
                      'px-2 py-1 text-xs rounded transition-colors cursor-pointer text-center',
                      qualityState === q ? 'bg-[var(--success-color-6)] text-[var(--text-color-anti)]' : 'bg-[var(--bg-color-component)] text-[var(--text-color-placeholder)] hover:bg-[var(--bg-color-secondarycomponent-hover)]'
                    ].filter(Boolean).join(' ')}
                  >
                    {q === 'low' ? '低' : q === 'medium' ? '中' : '高'}
                  </div>
                ))}
              </CwGrid>
            </div>

            {/* 统计信息 */}
            <div className="pt-3 hairline-border-t border-[var(--bg-color-component)] text-xs text-[var(--text-color-disabled)] space-y-1">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className="text-[var(--success-color-special)]">{fps}</span>
              </div>
              <div className="flex justify-between">
                <span>Draw Calls:</span>
                <span>{drawCalls}</span>
              </div>
            </div>

            {/* 相机提示 */}
            <div className="text-xs text-[var(--text-color-placeholder)] pt-3 hairline-border-t border-[var(--bg-color-component)]">
              <p>🖱 左键拖动：旋转视角</p>
              <p>🖱 右键拖动：平移</p>
              <p>🖱 滚轮：缩放</p>
            </div>
          </div>
        </div>
      )}

      {/* 时间/三体状态显示 HUD */}
      {!isLoading && !error && (
        <div
          className="absolute bottom-6 left-6 z-[var(--z-index-fixed-column-header)] rounded-lg bg-[color-mix(in_srgb,var(--scrim-base)_50%,transparent)] px-4 py-2 backdrop-blur-sm"
        >
          {!enableTrisolaris ? (
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getTimeEmoji(currentTime)}</div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-color-anti)]">{formatTime(currentTime)}</div>
                <div className="text-[var(--text-color-disabled)] text-xs">{getTimeOfDay(currentTime)}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-xl">{trisolarisEra.emoji}</div>
                <div>
                  <div className="text-[var(--text-color-anti)] text-sm font-semibold">{trisolarisEra.type}</div>
                  <div className="text-[var(--text-color-disabled)] text-xs">{trisolarisStatus}</div>
                </div>
              </div>
              <div className="text-xs text-[var(--text-color-placeholder)] mt-1">{trisolarisEra.description}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TpHeroScene
