/**
 * 舞者模型和动画
 */

export interface DancerConfig {
  campfirePosition: any
  radius: number
  dancerCount: number
  useRealisticModels: boolean
  characterModels?: string[]
}

/**
 * 创建舞者（程序化或真实模型）
 */
export async function createDancers(
  THREE: any,
  GLTFLoader: any,
  FBXLoader: any,
  config: DancerConfig,
  onProgress?: (status: string) => void
): Promise<{ dancers: any[]; mixers: any[] }> {
  const { campfirePosition, radius, dancerCount, useRealisticModels, characterModels } = config
  const dancers: any[] = []
  const mixers: any[] = []
  
  if (useRealisticModels && characterModels && characterModels.length > 0) {
    // 加载真实模型
    const result = await createRealisticDancers(
      THREE,
      GLTFLoader,
      FBXLoader,
      campfirePosition,
      radius,
      dancerCount,
      characterModels,
      onProgress
    )
    dancers.push(...result.dancers)
    mixers.push(...result.mixers)
  } else {
    // 使用程序化模型
    const clothesColors = [
      0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da,
      0xfcbad3, 0xa8e6cf, 0xdcedc1, 0xffd3b6, 0xffaaa5, 0xa8dadc
    ]
    
    for (let i = 0; i < dancerCount; i++) {
      const angle = (i / dancerCount) * Math.PI * 2
      const dancer = createDancerModel(THREE, clothesColors[i])
      
      dancer.position.x = campfirePosition.x + Math.cos(angle) * radius
      dancer.position.y = 0
      dancer.position.z = campfirePosition.z + Math.sin(angle) * radius
      dancer.lookAt(campfirePosition)
      
      dancer.userData = {
        angle: angle,
        radius: radius,
        baseY: 0,
        jumpPhase: Math.random() * Math.PI * 2,
        armSwing: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4,
        campfirePosition: campfirePosition,
        isRealistic: false
      }
      
      dancers.push(dancer)
    }
  }
  
  return { dancers, mixers }
}

/**
 * 创建真实模型的舞者
 */
async function createRealisticDancers(
  THREE: any,
  GLTFLoader: any,
  FBXLoader: any,
  campfirePosition: any,
  radius: number,
  dancerCount: number,
  modelUrls: string[],
  onProgress?: (status: string) => void
): Promise<{ dancers: any[]; mixers: any[] }> {
  const dancers: any[] = []
  const mixers: any[] = []
  
  if (!GLTFLoader && !FBXLoader) {
    console.error('模型加载器未加载，回退到程序化模型')
    return { dancers, mixers }
  }
  
  const clothesColors = [
    0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da,
    0xfcbad3, 0xa8e6cf, 0xdcedc1, 0xffd3b6, 0xffaaa5, 0xa8dadc
  ]
  
  for (let i = 0; i < dancerCount; i++) {
    try {
      const modelUrl = modelUrls[i % modelUrls.length]
      onProgress?.(`加载舞者 ${i + 1}/${dancerCount}...`)
      
      const isFBX = modelUrl.toLowerCase().endsWith('.fbx')
      let dancer: any = null
      let animations: any[] = []
      
      if (isFBX && FBXLoader) {
        const loader = new FBXLoader()
        const loadedData = await new Promise<any>((resolve, reject) => {
          loader.load(modelUrl, resolve, undefined, reject)
        })
        dancer = loadedData
        animations = loadedData.animations || []
      } else if (GLTFLoader) {
        const loader = new GLTFLoader()
        const loadedData = await new Promise<any>((resolve, reject) => {
          loader.load(modelUrl, resolve, undefined, reject)
        })
        dancer = loadedData.scene
        animations = loadedData.animations || []
      } else {
        throw new Error('没有合适的加载器')
      }
      
      // 设置位置
      const angle = (i / dancerCount) * Math.PI * 2
      dancer.position.x = campfirePosition.x + Math.cos(angle) * radius
      dancer.position.y = 0
      dancer.position.z = campfirePosition.z + Math.sin(angle) * radius
      
      // 自动缩放
      const box = new THREE.Box3().setFromObject(dancer)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const targetHeight = 2.5
      const scale = targetHeight / maxDim
      dancer.scale.setScalar(scale)
      
      dancer.lookAt(campfirePosition)
      
      // 启用阴影
      dancer.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      dancer.userData = {
        angle: angle,
        radius: radius,
        baseY: 0,
        speed: 0.8 + Math.random() * 0.4,
        campfirePosition: campfirePosition,
        isRealistic: true,
        mixer: null,
        actions: []
      }
      
      // 创建动画混合器
      if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(dancer)
        dancer.userData.mixer = mixer
        mixers.push(mixer)
        
        animations.forEach((clip: any, index: number) => {
          const action = mixer.clipAction(clip)
          action.play()
          dancer.userData.actions.push(action)
          if (index > 0) {
            action.stop()
          }
        })
        
        console.log(`舞者 ${i + 1} 加载成功，包含 ${animations.length} 个动画`)
      }
      
      dancers.push(dancer)
    } catch (err) {
      console.error(`加载舞者 ${i + 1} 失败:`, err)
      // 后备方案：使用程序化模型
      const dancer = createDancerModel(THREE, clothesColors[i])
      const angle = (i / dancerCount) * Math.PI * 2
      dancer.position.x = campfirePosition.x + Math.cos(angle) * radius
      dancer.position.z = campfirePosition.z + Math.sin(angle) * radius
      dancer.userData = {
        angle: angle,
        radius: radius,
        baseY: 0,
        jumpPhase: Math.random() * Math.PI * 2,
        armSwing: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4,
        campfirePosition: campfirePosition,
        isRealistic: false
      }
      dancers.push(dancer)
    }
  }
  
  return { dancers, mixers }
}

/**
 * 创建程序化舞者模型
 */
export function createDancerModel(THREE: any, color: number): any {
  const dancer = new THREE.Group()
  
  // 身体
  const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.1
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 1.8
  body.castShadow = true
  body.receiveShadow = true
  dancer.add(body)
  
  // 头部
  const headGeometry = new THREE.SphereGeometry(0.35, 16, 16)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdbac,
    roughness: 0.8
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 2.8
  head.castShadow = true
  dancer.add(head)
  
  // 左臂
  const armGeometry = new THREE.BoxGeometry(0.25, 1.0, 0.25)
  const armMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7
  })
  const leftArm = new THREE.Mesh(armGeometry, armMaterial)
  leftArm.position.set(-0.6, 1.8, 0)
  leftArm.castShadow = true
  dancer.add(leftArm)
  dancer.userData.leftArm = leftArm
  
  // 右臂
  const rightArm = new THREE.Mesh(armGeometry, armMaterial.clone())
  rightArm.position.set(0.6, 1.8, 0)
  rightArm.castShadow = true
  dancer.add(rightArm)
  dancer.userData.rightArm = rightArm
  
  // 左腿
  const legGeometry = new THREE.BoxGeometry(0.3, 1.0, 0.3)
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c3e50,
    roughness: 0.8
  })
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
  leftLeg.position.set(-0.25, 0.6, 0)
  leftLeg.castShadow = true
  dancer.add(leftLeg)
  dancer.userData.leftLeg = leftLeg
  
  // 右腿
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial.clone())
  rightLeg.position.set(0.25, 0.6, 0)
  rightLeg.castShadow = true
  dancer.add(rightLeg)
  dancer.userData.rightLeg = rightLeg
  
  return dancer
}

/**
 * 更新舞者动画
 */
export function updateDancersAnimation(dancers: any[], time: number): void {
  dancers.forEach((dancer, index) => {
    const userData = dancer.userData
    
    // 围着篝火旋转
    userData.angle += 0.01 * userData.speed
    
    const x = userData.campfirePosition.x + Math.cos(userData.angle) * userData.radius
    const z = userData.campfirePosition.z + Math.sin(userData.angle) * userData.radius
    
    dancer.position.x = x
    dancer.position.z = z
    
    // 如果是真实模型且没有内置动画，添加程序化跳跃
    if (userData.isRealistic && (!userData.mixer || userData.actions.length === 0)) {
      userData.jumpPhase = userData.jumpPhase || 0
      userData.jumpPhase += 0.15 * userData.speed
      const jump = Math.abs(Math.sin(userData.jumpPhase)) * 0.3
      dancer.position.y = userData.baseY + jump
    } else if (!userData.isRealistic) {
      // 程序化模型的完整动画
      userData.jumpPhase += 0.15 * userData.speed
      const jump = Math.abs(Math.sin(userData.jumpPhase)) * 0.5
      dancer.position.y = userData.baseY + jump
      
      // 手臂摆动
      if (userData.leftArm && userData.rightArm) {
        userData.armSwing += 0.1 * userData.speed
        userData.leftArm.rotation.z = Math.sin(userData.armSwing) * 0.8
        userData.rightArm.rotation.z = -Math.sin(userData.armSwing) * 0.8
        userData.leftArm.rotation.x = Math.cos(userData.armSwing * 0.5) * 0.3
        userData.rightArm.rotation.x = -Math.cos(userData.armSwing * 0.5) * 0.3
      }
      
      // 腿部动画
      if (userData.leftLeg && userData.rightLeg) {
        userData.leftLeg.rotation.x = Math.sin(userData.jumpPhase * 2) * 0.4
        userData.rightLeg.rotation.x = -Math.sin(userData.jumpPhase * 2) * 0.4
      }
    }
    
    // 面向篝火
    const lookAngle = userData.angle + Math.PI + Math.sin(time + index) * 0.3
    dancer.rotation.y = lookAngle
  })
}

