import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type * as THREE from 'three'
import type { GLTFLoader as GLTFLoaderClass } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { OrbitControls as OrbitControlsClass } from 'three/examples/jsm/controls/OrbitControls.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { TpThreeJsProps } from './types'
import { threeJsBase } from '@zengchaowu/ui-shared/components/TpThreeJs/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/TpThreeJs/texts'
import { CwIcon } from '../CwIcon'
import { designPxToRem } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

type ThreeModule = typeof THREE

// 延迟函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function TpThreeJs({
  width = 800,
  height = 600,
  showControls = true,
  autoRotate = false,
  backgroundColor = 0x000000,
  cameraPosition = { x: 0, y: 0, z: 5 },
  containerClass = '',
  modelUrl = '',
  modelScale = 1,
  enableOrbitControls = true,
  showWireframe = false,
  enableLights = true,
  texts: textsProp = defaultTexts,
  className,
  onReady,
  onError,
  onAnimate,
  onAnimationToggle,
  onCameraReset,
  onResize,
  onModelLoaded,
  onModelError,
}: TpThreeJsProps & { className?: string }) {
  const texts = textsProp || defaultTexts

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      width: designPxToRem(width),
      height: designPxToRem(height),
    }),
    [width, height],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  // Three.js 相关引用
  const threeRef = useRef<ThreeModule | null>(null)
  const gltfLoaderRef = useRef<typeof GLTFLoaderClass | null>(null)
  const orbitControlsRef = useRef<typeof OrbitControlsClass | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cubeRef = useRef<THREE.Mesh | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const controlsRef = useRef<OrbitControlsClass | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const isPlayingRef = useRef(true)
  isPlayingRef.current = isPlaying

  const propsRef = useRef({
    width,
    height,
    autoRotate,
    backgroundColor,
    cameraPosition,
    modelUrl,
    modelScale,
    enableOrbitControls,
    showWireframe,
    enableLights,
  })
  propsRef.current = {
    width,
    height,
    autoRotate,
    backgroundColor,
    cameraPosition,
    modelUrl,
    modelScale,
    enableOrbitControls,
    showWireframe,
    enableLights,
  }

  const callbacksRef = useRef({
    onReady,
    onError,
    onAnimate,
    onAnimationToggle,
    onCameraReset,
    onResize,
    onModelLoaded,
    onModelError,
  })
  callbacksRef.current = {
    onReady,
    onError,
    onAnimate,
    onAnimationToggle,
    onCameraReset,
    onResize,
    onModelLoaded,
    onModelError,
  }

  // 动态导入 Three.js（带重试机制）
  const loadThreeJS = useCallback(async (retries = 3, delayMs = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`尝试加载 Three.js (第${attempt}次)...`)

        threeRef.current = await import('three')
        console.log('Three.js 核心库加载成功')

        // 动态导入GLTFLoader
        if (propsRef.current.modelUrl) {
          try {
            const { GLTFLoader: Loader } = await import(
              'three/examples/jsm/loaders/GLTFLoader.js'
            )
            gltfLoaderRef.current = Loader
            console.log('GLTFLoader 加载成功')
          } catch (gltfErr) {
            console.warn('GLTFLoader 加载失败:', gltfErr)
            if (attempt === retries) throw gltfErr
          }
        }

        // 动态导入OrbitControls
        if (propsRef.current.enableOrbitControls) {
          try {
            const { OrbitControls: OrbitControlsCtor } = await import(
              'three/examples/jsm/controls/OrbitControls.js'
            )
            orbitControlsRef.current = OrbitControlsCtor
            console.log('OrbitControls 加载成功')
          } catch (controlsErr) {
            console.warn('OrbitControls 加载失败:', controlsErr)
            if (attempt === retries) throw controlsErr
          }
        }

        console.log('Three.js 所有模块加载完成')
        return threeRef.current
      } catch (err) {
        console.error(`第${attempt}次加载失败:`, err)

        if (attempt === retries) {
          throw new Error(
            `Three.js 加载失败 (尝试${retries}次): ${err instanceof Error ? err.message : String(err)}`,
          )
        }

        // 等待后重试
        console.log(`等待 ${delayMs}ms 后重试...`)
        await delay(delayMs)
        delayMs *= 1.5 // 指数退避
      }
    }
    return threeRef.current
  }, [])

  // 动画循环
  const animate = useCallback(() => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    if (!renderer || !scene || !camera) {
      return
    }

    animationIdRef.current = requestAnimationFrame(animate)

    // 更新轨道控制器
    if (controlsRef.current) {
      controlsRef.current.update()
    }

    // 自动旋转
    if (propsRef.current.autoRotate && isPlayingRef.current) {
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01
        cubeRef.current.rotation.y += 0.01
      }
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01
      }
    }

    renderer.render(scene, camera)
    callbacksRef.current.onAnimate?.({ scene, camera, renderer })
  }, [])

  // 创建默认立方体
  const createDefaultCube = useCallback(() => {
    const THREE_NS = threeRef.current
    const scene = sceneRef.current
    if (!THREE_NS || !scene) return
    const geometry = new THREE_NS.BoxGeometry()
    const material = new THREE_NS.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: propsRef.current.showWireframe,
    })
    const cube = new THREE_NS.Mesh(geometry, material)
    cubeRef.current = cube
    scene.add(cube)
  }, [])

  // 加载3D模型
  const loadModel = useCallback(async () => {
    const GLTFLoaderCtor = gltfLoaderRef.current
    const scene = sceneRef.current
    if (!GLTFLoaderCtor || !scene) return
    try {
      const loader = new GLTFLoaderCtor()
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        loader.load(propsRef.current.modelUrl || '', resolve, undefined, reject)
      })

      const model = gltf.scene
      modelRef.current = model
      model.scale.setScalar(propsRef.current.modelScale)

      // 设置材质
      model.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh) {
          if (propsRef.current.showWireframe) {
            const material = mesh.material as THREE.Material & { wireframe?: boolean }
            material.wireframe = true
          }
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })

      scene.add(model)
      callbacksRef.current.onModelLoaded?.(model)
    } catch (err) {
      console.error('模型加载失败:', err)
      callbacksRef.current.onModelError?.(err)
      // 加载失败时创建默认立方体
      createDefaultCube()
    }
  }, [createDefaultCube])

  // 初始化 Three.js
  const initThreeJs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 动态导入 Three.js（带重试机制）
      if (!threeRef.current) {
        console.log('开始加载 Three.js 库...')
        await loadThreeJS(3, 1000) // 最多重试3次，初始延迟1秒
      }

      const THREE_NS = threeRef.current
      if (!THREE_NS) {
        throw new Error('Failed to load Three.js library')
      }

      const container = containerRef.current
      if (!container) {
        throw new Error('Container element not found')
      }

      const currentProps = propsRef.current

      // 创建场景
      const scene = new THREE_NS.Scene()
      sceneRef.current = scene

      // 创建相机
      const camera = new THREE_NS.PerspectiveCamera(
        75,
        currentProps.width / currentProps.height,
        0.1,
        1000,
      )
      cameraRef.current = camera
      camera.position.set(
        currentProps.cameraPosition.x,
        currentProps.cameraPosition.y,
        currentProps.cameraPosition.z,
      )

      // 创建渲染器
      const renderer = new THREE_NS.WebGLRenderer({ antialias: true })
      rendererRef.current = renderer
      renderer.setSize(currentProps.width, currentProps.height)
      renderer.setClearColor(currentProps.backgroundColor)

      // 将渲染器添加到容器
      container.appendChild(renderer.domElement)

      // 添加光源
      if (currentProps.enableLights) {
        const ambientLight = new THREE_NS.AmbientLight(0x404040, 0.6)
        scene.add(ambientLight)

        const directionalLight = new THREE_NS.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(1, 1, 1)
        directionalLight.castShadow = true
        scene.add(directionalLight)
      }

      // 添加轨道控制器
      const OrbitControlsCtor = orbitControlsRef.current
      if (currentProps.enableOrbitControls && OrbitControlsCtor) {
        const controls = new OrbitControlsCtor(camera, renderer.domElement)
        controlsRef.current = controls
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.enableZoom = true
        controls.enablePan = true
      }

      // 加载3D模型或创建默认立方体
      if (currentProps.modelUrl && gltfLoaderRef.current) {
        await loadModel()
      } else {
        createDefaultCube()
      }

      setIsLoading(false)
      callbacksRef.current.onReady?.({ scene, camera, renderer })

      // 开始动画循环
      animate()
    } catch (err) {
      console.error('Three.js 初始化失败:', err)

      // 提供更详细的错误信息
      let errorMessage = '未知错误'
      if (err instanceof Error) {
        if (err.message.includes('Failed to load Three.js library')) {
          errorMessage = 'Three.js 库加载失败，请检查网络连接或稍后重试'
        } else if (err.message.includes('GLTFLoader')) {
          errorMessage = 'GLTF模型加载器初始化失败'
        } else if (err.message.includes('OrbitControls')) {
          errorMessage = '轨道控制器初始化失败'
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      callbacksRef.current.onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }, [animate, createDefaultCube, loadModel, loadThreeJS])

  // 清理资源
  const cleanup = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }

    if (controlsRef.current) {
      controlsRef.current.dispose()
      controlsRef.current = null
    }

    const renderer = rendererRef.current
    if (renderer && containerRef.current) {
      if (containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }

    const cube = cubeRef.current
    if (cube) {
      if (cube.geometry) cube.geometry.dispose()
      const material = cube.material as THREE.Material | THREE.Material[]
      if (Array.isArray(material)) {
        material.forEach((mat) => mat.dispose())
      } else if (material) {
        material.dispose()
      }
    }

    const model = modelRef.current
    if (model) {
      model.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh) {
          if (mesh.geometry) mesh.geometry.dispose()
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose())
            } else {
              mesh.material.dispose()
            }
          }
        }
      })
    }

    sceneRef.current = null
    cameraRef.current = null
    rendererRef.current = null
    cubeRef.current = null
    modelRef.current = null
  }, [])

  // 手动重试加载
  const retryLoad = useCallback(() => {
    // 重置 Three.js 相关变量
    threeRef.current = null
    gltfLoaderRef.current = null
    orbitControlsRef.current = null

    // 清理现有场景
    cleanup()

    console.log('用户手动重试加载 Three.js...')
    void initThreeJs()
  }, [cleanup, initThreeJs])

  // 切换动画
  const toggleAnimation = useCallback(() => {
    const next = !isPlayingRef.current
    setIsPlaying(next)

    if (next && propsRef.current.autoRotate) {
      animate()
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }

    callbacksRef.current.onAnimationToggle?.(next)
  }, [animate])

  // 重置相机
  const resetCamera = useCallback(() => {
    const camera = cameraRef.current
    if (camera) {
      camera.position.set(
        propsRef.current.cameraPosition.x,
        propsRef.current.cameraPosition.y,
        propsRef.current.cameraPosition.z,
      )
      camera.lookAt(0, 0, 0)

      // 重置轨道控制器
      if (controlsRef.current) {
        controlsRef.current.reset()
      }

      const renderer = rendererRef.current
      const scene = sceneRef.current
      if (renderer && scene) {
        renderer.render(scene, camera)
      }

      callbacksRef.current.onCameraReset?.()
    }
  }, [])

  // 重置模型
  const resetModel = useCallback(() => {
    const model = modelRef.current
    if (model) {
      model.rotation.set(0, 0, 0)
      model.position.set(0, 0, 0)
      model.scale.setScalar(propsRef.current.modelScale)

      const renderer = rendererRef.current
      const scene = sceneRef.current
      const camera = cameraRef.current
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }
  }, [])

  // 响应尺寸变化
  const handleResize = useCallback(() => {
    const camera = cameraRef.current
    const renderer = rendererRef.current
    if (camera && renderer) {
      camera.aspect = propsRef.current.width / propsRef.current.height
      camera.updateProjectionMatrix()
      renderer.setSize(propsRef.current.width, propsRef.current.height)

      const scene = sceneRef.current
      if (scene) {
        renderer.render(scene, camera)
      }

      callbacksRef.current.onResize?.({
        width: propsRef.current.width || 0,
        height: propsRef.current.height || 0,
      })
    }
  }, [])

  // 预加载 Three.js 库
  const preloadThreeJS = useCallback(async () => {
    try {
      console.log('开始预加载 Three.js 库...')
      await loadThreeJS(2, 500) // 预加载时减少重试次数和延迟
      console.log('Three.js 库预加载完成')
    } catch (err) {
      console.warn('Three.js 库预加载失败，将在初始化时重新加载:', err)
      // 预加载失败不影响后续初始化
    }
  }, [loadThreeJS])

  // 生命周期：挂载（对应 Vue onMounted）
  useEffect(() => {
    let cancelled = false

    const mount = async () => {
      // 如果 Three.js 还未加载，先尝试预加载
      if (!threeRef.current) {
        await preloadThreeJS()
      }
      if (!cancelled) {
        void initThreeJs()
      }
    }

    void mount()

    return () => {
      cancelled = true
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听属性变化（对应 Vue watch width/height）
  const isFirstResizeRef = useRef(true)
  useEffect(() => {
    if (isFirstResizeRef.current) {
      isFirstResizeRef.current = false
      return
    }
    handleResize()
  }, [width, height, handleResize])

  // 监听 backgroundColor（对应 Vue watch）
  useEffect(() => {
    const renderer = rendererRef.current
    if (renderer) {
      renderer.setClearColor(backgroundColor)
      const scene = sceneRef.current
      const camera = cameraRef.current
      if (scene && camera) {
        renderer.render(scene, camera)
      }
    }
  }, [backgroundColor])

  // 监听 autoRotate（对应 Vue watch）
  useEffect(() => {
    if (autoRotate && isPlayingRef.current) {
      animate()
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRotate])

  return (
    <div
      ref={containerRef}
      className={[threeJsBase.root, containerClass, className].filter(Boolean).join(' ')}
      style={containerStyle}
    >
      {/* Loading状态 */}
      {isLoading && (
        <div className={threeJsBase.loadingOverlay}>
          <div className={threeJsBase.loadingContent}>
            <div className={threeJsBase.loadingSpinner}></div>
            <p className={threeJsBase.loadingText}>{texts.loadingMain}</p>
            <p className={threeJsBase.loadingSubtext}>{texts.loadingSub}</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className={threeJsBase.errorOverlay}>
          <div className={threeJsBase.errorContent}>
            <div className={threeJsBase.errorIcon}>
              <CwIcon
                name="common--status--info-line"
                prefix="icon"
                size={2}
                className={threeJsBase.errorIconSvg}
              />
            </div>
            <p className={threeJsBase.errorTitle}>{texts.errorTitle}</p>
            <p className={threeJsBase.errorMessage}>{error}</p>
            <div onClick={retryLoad} className={threeJsBase.retryButton}>
              {texts.retryText}
            </div>
          </div>
        </div>
      )}

      {/* 控制面板 */}
      {showControls && !isLoading && !error && (
        <div className={threeJsBase.controlsOverlay}>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--text-color-secondary)] mb-2">
              {modelUrl ? '3D模型控制' : '立方体控制'}
            </div>
            <div
              onClick={toggleAnimation}
              className={[
                'w-full px-3 py-1 text-xs rounded transition-colors cursor-pointer text-center',
                isPlaying
                  ? 'bg-[var(--error-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--error-color-hover)]'
                  : 'bg-[var(--success-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--success-color-hover)]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isPlaying ? '暂停旋转' : '开始旋转'}
            </div>
            <div
              onClick={resetCamera}
              className="w-full px-3 py-1 text-xs bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--brand-color-hover)] transition-colors cursor-pointer text-center"
            >
              重置视角
            </div>
            {modelUrl && (
              <div
                onClick={resetModel}
                className="w-full px-3 py-1 text-xs bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--brand-color-hover)] transition-colors cursor-pointer text-center"
              >
                重置模型
              </div>
            )}
            {enableOrbitControls && (
              <div className="text-xs text-[var(--text-color-secondary)] mt-2 pt-2 hairline-border-t border-[var(--border-color)]">
                <div>鼠标左键：旋转</div>
                <div>鼠标右键：平移</div>
                <div>滚轮：缩放</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TpThreeJs
