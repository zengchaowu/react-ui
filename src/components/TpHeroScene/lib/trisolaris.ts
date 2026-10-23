/**
 * 三体系统 - 模拟三个太阳的混沌运动
 * 基于简化的三体问题物理模拟
 */

export interface Sun {
  mesh: any
  light: any
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  mass: number
  color: number
  intensity: number
}

export interface TrisolarisSystem {
  suns: Sun[]
  sky: any
}

/**
 * 创建三体系统（三个太阳）
 */
export function createTrisolarisSystem(THREE: any): TrisolarisSystem {
  // 创建天空球
  const skyGeometry = new THREE.SphereGeometry(450, 32, 15)
  const skyMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    fog: false
  })
  const sky = new THREE.Mesh(skyGeometry, skyMaterial)
  
  // 三个太阳的初始配置
  const sunConfigs = [
    {
      position: { x: 100, y: 150, z: -50 },
      velocity: { x: 0.02, y: 0, z: 0.01 },
      mass: 1.0,
      color: 0xffff00,  // 黄色 - Alpha 太阳
      size: 6,
      intensity: 1.2
    },
    {
      position: { x: -80, y: 120, z: 30 },
      velocity: { x: -0.01, y: 0.015, z: -0.02 },
      mass: 0.9,
      color: 0xff6600,  // 橙红色 - Beta 太阳
      size: 5.5,
      intensity: 1.0
    },
    {
      position: { x: 50, y: 180, z: 80 },
      velocity: { x: 0.015, y: -0.01, z: 0.015 },
      mass: 1.1,
      color: 0xff9900,  // 橙黄色 - Gamma 太阳
      size: 6.5,
      intensity: 1.1
    }
  ]
  
  const suns: Sun[] = sunConfigs.map(config => {
    // 创建太阳网格
    const sunGeometry = new THREE.SphereGeometry(config.size, 32, 32)
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      fog: false
    })
    const mesh = new THREE.Mesh(sunGeometry, sunMaterial)
    mesh.position.set(config.position.x, config.position.y, config.position.z)
    
    // 创建太阳光源
    const light = new THREE.DirectionalLight(config.color, config.intensity)
    light.position.copy(mesh.position)
    light.castShadow = true
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 500
    light.shadow.camera.left = -100
    light.shadow.camera.right = 100
    light.shadow.camera.top = 100
    light.shadow.camera.bottom = -100
    
    return {
      mesh,
      light,
      position: { ...config.position },
      velocity: { ...config.velocity },
      mass: config.mass,
      color: config.color,
      intensity: config.intensity
    }
  })
  
  return { suns, sky }
}

/**
 * 更新三体系统（使用简化的三体物理模拟）
 */
export function updateTrisolarisSystem(
  THREE: any,
  system: TrisolarisSystem,
  scene: any,
  time: number,
  deltaTime: number = 0.016
): void {
  const { suns, sky } = system
  const G = 0.5 // 引力常数（调整以获得视觉效果）
  
  // 计算每个太阳受到的引力
  const forces: Array<{ x: number; y: number; z: number }> = suns.map(() => ({ x: 0, y: 0, z: 0 }))
  
  for (let i = 0; i < suns.length; i++) {
    for (let j = i + 1; j < suns.length; j++) {
      const sun1 = suns[i]
      const sun2 = suns[j]
      
      // 计算距离
      const dx = sun2.position.x - sun1.position.x
      const dy = sun2.position.y - sun1.position.y
      const dz = sun2.position.z - sun1.position.z
      const distSq = dx * dx + dy * dy + dz * dz
      const dist = Math.sqrt(distSq)
      
      // 防止距离过小导致力过大
      if (dist < 20) continue
      
      // 计算引力大小
      const forceMag = (G * sun1.mass * sun2.mass) / distSq
      
      // 归一化方向向量
      const fx = (dx / dist) * forceMag
      const fy = (dy / dist) * forceMag
      const fz = (dz / dist) * forceMag
      
      // 牛顿第三定律：作用力和反作用力
      forces[i].x += fx
      forces[i].y += fy
      forces[i].z += fz
      
      forces[j].x -= fx
      forces[j].y -= fy
      forces[j].z -= fz
    }
  }
  
  // 更新每个太阳的位置和速度
  suns.forEach((sun, i) => {
    // 更新速度（F = ma, a = F/m）
    sun.velocity.x += (forces[i].x / sun.mass) * deltaTime
    sun.velocity.y += (forces[i].y / sun.mass) * deltaTime
    sun.velocity.z += (forces[i].z / sun.mass) * deltaTime
    
    // 添加阻尼以稳定系统
    const damping = 0.99
    sun.velocity.x *= damping
    sun.velocity.y *= damping
    sun.velocity.z *= damping
    
    // 更新位置
    sun.position.x += sun.velocity.x
    sun.position.y += sun.velocity.y
    sun.position.z += sun.velocity.z
    
    // 限制太阳的活动范围
    const maxRadius = 250
    const currentRadius = Math.sqrt(
      sun.position.x * sun.position.x +
      sun.position.y * sun.position.y +
      sun.position.z * sun.position.z
    )
    
    if (currentRadius > maxRadius) {
      const scale = maxRadius / currentRadius
      sun.position.x *= scale
      sun.position.y *= scale
      sun.position.z *= scale
      // 反弹效果
      sun.velocity.x *= -0.5
      sun.velocity.y *= -0.5
      sun.velocity.z *= -0.5
    }
    
    // 限制高度（太阳不应该到地下）
    if (sun.position.y < 50) {
      sun.position.y = 50
      sun.velocity.y = Math.abs(sun.velocity.y) * 0.5
    }
    
    // 更新网格位置
    sun.mesh.position.set(sun.position.x, sun.position.y, sun.position.z)
    
    // 更新光源位置
    sun.light.position.copy(sun.mesh.position)
    sun.light.target.position.set(0, 0, 0)
    
    // 根据高度调整光照强度
    const heightFactor = Math.max(0.3, sun.position.y / 200)
    sun.light.intensity = sun.intensity * heightFactor
  })
  
  // 计算天空颜色（基于所有太阳的综合影响）
  updateTrisolarisSkу(THREE, suns, sky, scene, time)
}

/**
 * 更新三体系统的天空颜色
 */
function updateTrisolarisSkу(
  THREE: any,
  suns: Sun[],
  sky: any,
  scene: any,
  time: number
): void {
  // 计算所有太阳的平均高度
  let avgHeight = 0
  let totalIntensity = 0
  let r = 0, g = 0, b = 0
  
  suns.forEach(sun => {
    avgHeight += sun.position.y
    totalIntensity += sun.light.intensity
    
    // 提取太阳的颜色分量
    const color = new THREE.Color(sun.color)
    r += color.r * sun.light.intensity
    g += color.g * sun.light.intensity
    b += color.b * sun.light.intensity
  })
  
  avgHeight /= suns.length
  
  // 归一化颜色
  if (totalIntensity > 0) {
    r /= totalIntensity
    g /= totalIntensity
    b /= totalIntensity
  }
  
  // 根据平均高度调整天空基础颜色
  let skyColor: number
  
  if (avgHeight > 150) {
    // 高照度 - 明亮的天空
    skyColor = new THREE.Color(
      Math.min(0.53 + r * 0.2, 1),
      Math.min(0.81 + g * 0.1, 1),
      Math.min(0.92 + b * 0.08, 1)
    ).getHex()
  } else if (avgHeight > 100) {
    // 中等照度 - 黄昏色调
    skyColor = new THREE.Color(
      Math.min(r * 0.8, 1),
      Math.min(g * 0.5, 0.7),
      Math.min(b * 0.3, 0.5)
    ).getHex()
  } else {
    // 低照度 - 黑暗
    skyColor = new THREE.Color(
      Math.min(r * 0.1, 0.2),
      Math.min(g * 0.1, 0.2),
      Math.min(b * 0.2, 0.3)
    ).getHex()
  }
  
  sky.material.color.setHex(skyColor)
  
  // 更新雾的颜色
  if (scene.fog) {
    scene.fog.color.setHex(skyColor)
  }
  
  // 更新环境光（基于总光照强度）
  if (scene.children[0] instanceof THREE.AmbientLight) {
    scene.children[0].intensity = Math.min(totalIntensity * 0.3, 0.6)
  }
}

/**
 * 获取三体系统状态描述
 */
export function getTrisolarisStatus(suns: Sun[]): string {
  const avgHeight = suns.reduce((sum, sun) => sum + sun.position.y, 0) / suns.length
  
  if (avgHeight > 150) {
    return '三日凌空 - 极昼'
  } else if (avgHeight > 100) {
    return '双日当空'
  } else if (avgHeight > 50) {
    return '单日悬空'
  } else {
    return '混沌时代'
  }
}

/**
 * 获取当前时代类型
 */
export function getTrisolarisEra(suns: Sun[]): {
  type: '恒纪元' | '乱纪元'
  emoji: string
  description: string
} {
  // 计算太阳之间的距离变化率
  let totalDistChange = 0
  let count = 0
  
  for (let i = 0; i < suns.length; i++) {
    for (let j = i + 1; j < suns.length; j++) {
      const dx = suns[i].position.x - suns[j].position.x
      const dy = suns[i].position.y - suns[j].position.y
      const dz = suns[i].position.z - suns[j].position.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      // 计算速度差
      const dvx = suns[i].velocity.x - suns[j].velocity.x
      const dvy = suns[i].velocity.y - suns[j].velocity.y
      const dvz = suns[i].velocity.z - suns[j].velocity.z
      const relVel = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz)
      
      totalDistChange += relVel
      count++
    }
  }
  
  const avgChange = totalDistChange / count
  
  // 判断时代
  if (avgChange < 0.02) {
    return {
      type: '恒纪元',
      emoji: '☀️',
      description: '气候稳定，适宜生存'
    }
  } else {
    return {
      type: '乱纪元',
      emoji: '⚠️',
      description: '气候混乱，需要脱水'
    }
  }
}

