/**
 * 粒子系统（萤火虫等）
 */

import { createStarTexture } from './textures'

export interface ParticleVelocity {
  x: number
  y: number
  z: number
}

/**
 * 创建萤火虫粒子
 */
export function createFireflies(THREE: any, particleCount: number = 100): any {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = Math.random() * 20 + 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    
    // 黄绿色萤火虫
    colors[i * 3] = 1.0
    colors[i * 3 + 1] = 1.0
    colors[i * 3 + 2] = 0.3
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    map: createStarTexture(THREE)
  })
  
  const fireflies = new THREE.Points(geometry, material)
  fireflies.userData.velocity = []
  
  // 为每个粒子创建速度
  for (let i = 0; i < particleCount; i++) {
    fireflies.userData.velocity.push({
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.05
    })
  }
  
  return fireflies
}

/**
 * 更新萤火虫动画
 */
export function updateFirefliesAnimation(
  fireflies: any,
  time: number,
  currentTime: number
): void {
  if (!fireflies || !fireflies.geometry.attributes.position) return
  
  const positions = fireflies.geometry.attributes.position
  const velocities = fireflies.userData.velocity
  
  // 只在夜晚显示萤火虫
  fireflies.visible = currentTime < 6 || currentTime > 19
  
  if (fireflies.visible && velocities) {
    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i)
      let y = positions.getY(i)
      let z = positions.getZ(i)
      
      // 应用速度
      x += velocities[i].x
      y += velocities[i].y + Math.sin(time + i) * 0.01
      z += velocities[i].z
      
      // 边界检测
      if (Math.abs(x) > 50) velocities[i].x *= -1
      if (y < 2 || y > 22) velocities[i].y *= -1
      if (Math.abs(z) > 50) velocities[i].z *= -1
      
      positions.setXYZ(i, x, y, z)
    }
    positions.needsUpdate = true
    
    // 萤火虫闪烁
    fireflies.material.opacity = 0.5 + Math.sin(time * 3) * 0.3
  }
}

