/**
 * 后期处理
 */

export interface PostProcessingConfig {
  width: number
  height: number
}

/**
 * 设置后期处理
 */
export function setupPostProcessing(
  THREE: any,
  renderer: any,
  scene: any,
  camera: any,
  postprocessing: any,
  config: PostProcessingConfig
): any {
  if (!postprocessing || !renderer || !scene || !camera) return null
  
  try {
    const { EffectComposer, RenderPass, UnrealBloomPass } = postprocessing
    
    // 创建效果合成器
    const effectComposer = new EffectComposer(renderer)
    
    // 添加渲染通道
    const renderPass = new RenderPass(scene, camera)
    effectComposer.addPass(renderPass)
    
    // 添加泛光效果
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(config.width, config.height),
      0.5,  // 强度
      0.4,  // 半径
      0.85  // 阈值
    )
    effectComposer.addPass(bloomPass)
    
    return effectComposer
  } catch (err) {
    console.error('后期处理设置失败:', err)
    return null
  }
}

