/**
 * 环境对象（树木、岩石、草地等）
 */

import {
  createRockTexture,
  createRockNormalMap,
  createTreeTrunkTexture,
  createTreeTrunkNormalMap,
  createLeavesTexture,
  createLeavesNormalMap,
  createGrassTexture
} from './textures'
import type { SceneQuality } from '../types'

/**
 * 添加环境装饰
 */
export function addEnvironmentObjects(THREE: any, scene: any, quality: SceneQuality): void {
  if (quality.terrainDetail < 256) return // 只在中高画质添加
  
  // 添加岩石
  addRocks(THREE, scene, quality)
  
  // 添加树木
  addTrees(THREE, scene, quality)
  
  // 添加草丛（高画质）
  if (quality.terrainDetail >= 512) {
    addGrass(THREE, scene)
  }
}

/**
 * 添加岩石
 */
function addRocks(THREE: any, scene: any, quality: SceneQuality): void {
  const rockTexture = createRockTexture(THREE)
  const rockNormalMap = createRockNormalMap(THREE)
  
  const rockMaterial = new THREE.MeshStandardMaterial({
    map: rockTexture,
    normalMap: rockNormalMap,
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughness: 0.95,
    metalness: 0.05,
    envMapIntensity: 0.5
  })
  
  const rockCount = quality.terrainDetail >= 512 ? 40 : 20
  const rockGeometries = [
    new THREE.DodecahedronGeometry(2, 1),
    new THREE.IcosahedronGeometry(2, 0),
    new THREE.OctahedronGeometry(2, 0)
  ]
  
  for (let i = 0; i < rockCount; i++) {
    const geometry = rockGeometries[Math.floor(Math.random() * rockGeometries.length)]
    const rock = new THREE.Mesh(geometry, rockMaterial.clone())
    
    rock.position.set(
      (Math.random() - 0.5) * 180,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 180
    )
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    const scale = Math.random() * 2 + 0.8
    rock.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale)
    rock.castShadow = true
    rock.receiveShadow = true
    scene.add(rock)
  }
}

/**
 * 添加树木
 */
function addTrees(THREE: any, scene: any, quality: SceneQuality): void {
  const treeCount = quality.terrainDetail >= 512 ? 50 : 30
  
  const trunkTexture = createTreeTrunkTexture(THREE)
  const trunkNormalMap = createTreeTrunkNormalMap(THREE)
  
  const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    map: trunkTexture,
    normalMap: trunkNormalMap,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.95,
    metalness: 0.05
  })
  
  const leavesTexture = createLeavesTexture(THREE)
  const leavesNormalMap = createLeavesNormalMap(THREE)
  
  const treeLeavesMaterial = new THREE.MeshStandardMaterial({
    map: leavesTexture,
    normalMap: leavesNormalMap,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughness: 0.85,
    metalness: 0.0,
    emissive: 0x0a1a05,
    emissiveIntensity: 0.05
  })
  
  for (let i = 0; i < treeCount; i++) {
    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.9, 6, 12)
    const trunk = new THREE.Mesh(trunkGeometry, treeTrunkMaterial.clone())
    
    trunk.position.set(
      (Math.random() - 0.5) * 160,
      3,
      (Math.random() - 0.5) * 160
    )
    trunk.castShadow = true
    trunk.receiveShadow = true
    scene.add(trunk)
    
    // 多层树冠
    for (let layer = 0; layer < 3; layer++) {
      const leavesGeometry = new THREE.ConeGeometry(
        4 - layer * 0.8,
        4 - layer * 0.5,
        8
      )
      const leaves = new THREE.Mesh(leavesGeometry, treeLeavesMaterial.clone())
      leaves.position.copy(trunk.position)
      leaves.position.y += 5.5 + layer * 2.5
      leaves.rotation.y = Math.random() * Math.PI
      leaves.castShadow = true
      leaves.receiveShadow = true
      scene.add(leaves)
    }
  }
}

/**
 * 添加草丛
 */
function addGrass(THREE: any, scene: any): void {
  const grassCount = 100
  const grassGeometry = new THREE.PlaneGeometry(0.5, 1)
  const grassTexture = createGrassTexture(THREE)
  
  const grassMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0.0
  })
  
  for (let i = 0; i < grassCount; i++) {
    const grass = new THREE.Mesh(grassGeometry, grassMaterial.clone())
    grass.position.set(
      (Math.random() - 0.5) * 180,
      0.5,
      (Math.random() - 0.5) * 180
    )
    grass.rotation.y = Math.random() * Math.PI
    scene.add(grass)
  }
}

