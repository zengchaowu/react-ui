/**
 * 资源加载器（异步函数）
 */

export interface LoadersResult {
  THREE: any
  OrbitControls: any
  GLTFLoader: any | null
  FBXLoader: any | null
  postprocessing: {
    EffectComposer: any
    RenderPass: any
    UnrealBloomPass: any
  } | null
}

/**
 * 加载 Three.js 和所有必要的库
 */
export async function loadThreeJS(
  enablePostProcessing: boolean = false,
  retries: number = 3,
  delayMs: number = 1000,
  onProgress?: (status: string) => void
): Promise<LoadersResult> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      onProgress?.(`加载 Three.js 库... (${attempt}/${retries})`)
      
      // @ts-ignore
      const THREE = await import('three')
      
      onProgress?.('加载轨道控制器...')
      // @ts-ignore
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      
      onProgress?.('加载模型加载器...')
      // @ts-ignore
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      
      let FBXLoader = null
      try {
        // @ts-ignore
        const fbxModule = await import('three/examples/jsm/loaders/FBXLoader.js')
        FBXLoader = fbxModule.FBXLoader
        console.log('FBXLoader 加载成功')
      } catch (err) {
        console.warn('FBXLoader 加载失败，将只支持 GLTF 格式:', err)
      }
      
      let postprocessing = null
      if (enablePostProcessing) {
        try {
          onProgress?.('加载后期处理...')
          // @ts-ignore
          const effectComposer = await import('three/examples/jsm/postprocessing/EffectComposer.js')
          // @ts-ignore
          const renderPass = await import('three/examples/jsm/postprocessing/RenderPass.js')
          // @ts-ignore
          const bloomPass = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js')
          
          postprocessing = {
            EffectComposer: effectComposer.EffectComposer,
            RenderPass: renderPass.RenderPass,
            UnrealBloomPass: bloomPass.UnrealBloomPass
          }
        } catch (err) {
          console.warn('后期处理加载失败，继续使用基础渲染:', err)
        }
      }
      
      return {
        THREE,
        OrbitControls,
        GLTFLoader,
        FBXLoader,
        postprocessing
      }
    } catch (err) {
      console.error(`第${attempt}次加载失败:`, err)
      if (attempt === retries) {
        throw new Error(`Three.js 加载失败: ${err instanceof Error ? err.message : String(err)}`)
      }
      await new Promise(resolve => setTimeout(resolve, delayMs))
      delayMs *= 1.5
    }
  }
  
  throw new Error('加载失败')
}

