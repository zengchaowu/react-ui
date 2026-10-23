/**
 * 地形生成函数
 */

import { multiOctaveNoise } from './noise'
import { createTerrainTexture, createNormalTexture, createRoughnessTexture } from './textures'
import type { SceneQuality } from '../types'

export interface TerrainConfig {
  size: number
  quality: SceneQuality
}

/**
 * 创建地形
 */
export function createTerrain(THREE: any, config: TerrainConfig): any {
  const { size, quality } = config
  const segments = quality.terrainDetail
  
  // 创建平面几何体
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
  
  // 使用Perlin噪声生成真实地形
  const vertices = geometry.attributes.position.array
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    const y = vertices[i + 1]
    
    // 多层Perlin噪声生成地形
    const height = 
      multiOctaveNoise(x * 0.02, y * 0.02, 4) * 25 +    // 大山脉
      multiOctaveNoise(x * 0.05, y * 0.05, 3) * 8 +     // 中等起伏
      multiOctaveNoise(x * 0.1, y * 0.1, 2) * 3         // 细节
    
    vertices[i + 2] = Math.max(0, height)
  }
  
  geometry.computeVertexNormals()
  
  // 创建程序化纹理
  const terrainTexture = createTerrainTexture(THREE)
  const normalTexture = createNormalTexture(THREE)
  const roughnessTexture = createRoughnessTexture(THREE)
  
  // 3A级PBR材质
  const material = new THREE.MeshStandardMaterial({
    map: terrainTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: roughnessTexture,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: false,
    envMapIntensity: 1.0
  })
  
  const terrain = new THREE.Mesh(geometry, material)
  terrain.rotation.x = -Math.PI / 2
  terrain.receiveShadow = true
  terrain.castShadow = true
  
  return terrain
}

