/**
 * 篝火效果
 */

import { createStarTexture } from './textures'

export interface CampfireSystem {
  logs: any[]
  particles: any
  light: any
  ambientLight: any
}

export interface ParticleVelocityWithLife {
  x: number
  y: number
  z: number
  life: number
}

/**
 * 创建篝火
 */
export function createCampfire(THREE: any, position: any): CampfireSystem {
  const logs: any[] = []
  
  // 创建木柴堆
  const logGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8)
  const logMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9
  })
  
  // 摆放5根木柴
  for (let i = 0; i < 5; i++) {
    const log = new THREE.Mesh(logGeometry, logMaterial)
    const angle = (i / 5) * Math.PI * 2
    log.position.copy(position)
    log.position.x += Math.cos(angle) * 0.5
    log.position.z += Math.sin(angle) * 0.5
    log.rotation.z = Math.PI / 2
    log.rotation.y = angle
    log.castShadow = true
    log.receiveShadow = true
    logs.push(log)
  }
  
  // 创建火焰粒子系统
  const particleCount = 200
  const particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  const velocities: ParticleVelocityWithLife[] = []
  
  for (let i = 0; i < particleCount; i++) {
    // 初始位置
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 0.5
    positions[i * 3] = position.x + Math.cos(angle) * radius
    positions[i * 3 + 1] = position.y + Math.random() * 0.5
    positions[i * 3 + 2] = position.z + Math.sin(angle) * radius
    
    // 火焰颜色
    const colorMix = Math.random()
    colors[i * 3] = 1.0
    colors[i * 3 + 1] = 0.3 + colorMix * 0.7
    colors[i * 3 + 2] = 0.0
    
    sizes[i] = Math.random() * 0.5 + 0.3
    
    // 粒子速度
    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: Math.random() * 0.05 + 0.02,
      z: (Math.random() - 0.5) * 0.02,
      life: Math.random()
    })
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: createStarTexture(THREE)
  })
  
  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  particles.userData.velocities = velocities
  particles.userData.basePosition = position
  
  // 创建篝火光源
  const light = new THREE.PointLight(0xff6600, 3, 30)
  light.position.copy(position)
  light.position.y += 2
  light.castShadow = true
  light.shadow.mapSize.width = 512
  light.shadow.mapSize.height = 512
  
  // 添加环境光照
  const ambientLight = new THREE.PointLight(0xff8833, 1.5, 20)
  ambientLight.position.copy(position)
  
  return {
    logs,
    particles,
    light,
    ambientLight
  }
}

/**
 * 更新篝火粒子动画
 */
export function updateCampfireAnimation(particles: any, light: any, time: number): void {
  if (!particles || !particles.geometry.attributes.position) return
  
  const positions = particles.geometry.attributes.position
  const colors = particles.geometry.attributes.color
  const sizes = particles.geometry.attributes.size
  const velocities = particles.userData.velocities
  const basePos = particles.userData.basePosition
  
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i)
    let y = positions.getY(i)
    let z = positions.getZ(i)
    
    // 应用速度
    x += velocities[i].x
    y += velocities[i].y
    z += velocities[i].z
    
    // 生命周期
    velocities[i].life -= 0.01
    
    // 粒子重生
    if (velocities[i].life <= 0 || y > basePos.y + 5) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.5
      x = basePos.x + Math.cos(angle) * radius
      y = basePos.y + Math.random() * 0.5
      z = basePos.z + Math.sin(angle) * radius
      velocities[i].life = 1
      velocities[i].y = Math.random() * 0.05 + 0.02
    }
    
    // 颜色渐变
    const life = velocities[i].life
    colors.setXYZ(i, life, life * (0.3 + life * 0.7), 0)
    sizes.setX(i, life * (Math.random() * 0.5 + 0.3))
    
    positions.setXYZ(i, x, y, z)
  }
  
  positions.needsUpdate = true
  colors.needsUpdate = true
  sizes.needsUpdate = true
  
  // 篝火光照闪烁
  if (light) {
    light.intensity = 2.5 + Math.sin(time * 5) * 0.5 + Math.random() * 0.3
  }
}

