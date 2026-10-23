/**
 * 水体创建函数
 */

import { createWaterNormalMap } from './textures'

export interface WaterConfig {
  size: number
  segments: number
}

/**
 * 创建水体
 */
export function createWater(THREE: any, config: WaterConfig): any {
  const { size, segments } = config
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
  
  // 创建水面程序化纹理
  const waterNormalMap = createWaterNormalMap(THREE)
  
  // 3A级水面材质
  const material = new THREE.MeshStandardMaterial({
    color: 0x006ba8,
    transparent: true,
    opacity: 0.75,
    roughness: 0.02,
    metalness: 0.95,
    normalMap: waterNormalMap,
    normalScale: new THREE.Vector2(1.5, 1.5),
    envMapIntensity: 2.0,
    emissive: 0x001a33,
    emissiveIntensity: 0.1
  })
  
  const water = new THREE.Mesh(geometry, material)
  water.rotation.x = -Math.PI / 2
  water.position.y = 0.5
  water.receiveShadow = true
  
  // 保存原始顶点数据用于波浪动画
  const vertices = geometry.attributes.position.array
  water.userData.originalVertices = new Float32Array(vertices)
  
  return water
}

/**
 * 更新水面波浪动画
 */
export function updateWaterAnimation(water: any, time: number): void {
  if (!water || !water.geometry.attributes.position) return
  
  const positions = water.geometry.attributes.position
  const originalVertices = water.userData.originalVertices
  
  if (originalVertices) {
    for (let i = 0; i < positions.count; i++) {
      const x = originalVertices[i * 3]
      const y = originalVertices[i * 3 + 1]
      
      // 创建波浪效果
      const wave = Math.sin(x * 0.05 + time) * Math.cos(y * 0.05 + time) * 0.5
      positions.setZ(i, wave)
    }
    positions.needsUpdate = true
    water.geometry.computeVertexNormals()
  }
  
  // 水面上下浮动
  water.position.y = 0.5 + Math.sin(time) * 0.2
}

