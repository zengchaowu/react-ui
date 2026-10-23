/**
 * 天空、太阳和星空相关函数
 */

import { createStarTexture } from './textures'
import { createTrisolarisSystem, type TrisolarisSystem } from './trisolaris'

export interface SkySystem {
  sky: any
  sun: any
  stars: any
}

export type { TrisolarisSystem } from './trisolaris'

/**
 * 创建天空和太阳（单太阳系统）
 */
export function createSky(THREE: any): { sky: any; sun: any } {
  // 创建天空球
  const skyGeometry = new THREE.SphereGeometry(450, 32, 15)
  const skyMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    fog: false
  })
  
  const sky = new THREE.Mesh(skyGeometry, skyMaterial)
  
  // 创建太阳
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    fog: false
  })
  
  const sun = new THREE.Mesh(sunGeometry, sunMaterial)
  
  return { sky, sun }
}

/**
 * 创建三体系统（三个太阳）
 */
export function createTrisolarisSky(THREE: any): TrisolarisSystem {
  return createTrisolarisSystem(THREE)
}

/**
 * 创建星空
 */
export function createStars(THREE: any, starCount: number = 3000): any {
  const starsGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(starCount * 3)
  const sizes = new Float32Array(starCount)
  
  for (let i = 0; i < starCount; i++) {
    // 随机分布在球面上
    const radius = 400
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) // 只在上半球
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    
    sizes[i] = Math.random() * 2 + 0.5
  }
  
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    map: createStarTexture(THREE)
  })
  
  return new THREE.Points(starsGeometry, starsMaterial)
}

/**
 * 创建云层
 */
export function createClouds(THREE: any, cloudCount: number = 15): any[] {
  const clouds: any[] = []
  const cloudGeometry = new THREE.SphereGeometry(10, 8, 8)
  
  for (let i = 0; i < cloudCount; i++) {
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 1,
      metalness: 0
    })
    
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
    
    // 随机位置
    cloud.position.set(
      (Math.random() - 0.5) * 300,
      Math.random() * 30 + 40,
      (Math.random() - 0.5) * 300
    )
    
    // 随机缩放
    const scale = Math.random() * 2 + 1
    cloud.scale.set(scale, scale * 0.5, scale)
    
    // 随机旋转
    cloud.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    
    clouds.push(cloud)
  }
  
  return clouds
}

/**
 * 更新天空和太阳位置
 */
export function updateSkyAndSun(
  THREE: any,
  sun: any,
  sunLight: any,
  sky: any,
  scene: any,
  time: number
): void {
  if (!sun || !sunLight || !sky) return
  
  // 计算太阳角度（0-24小时 -> 0-360度）
  const angle = ((time - 6) / 12) * Math.PI
  const radius = 300
  
  // 更新太阳位置
  sun.position.x = Math.cos(angle) * radius
  sun.position.y = Math.sin(angle) * radius
  sun.position.z = -50
  
  // 更新太阳光位置
  sunLight.position.copy(sun.position)
  sunLight.target.position.set(0, 0, 0)
  
  // 根据时间更新颜色
  let skyColor: number
  let sunColor: number
  let sunIntensity: number
  let ambientIntensity: number
  
  if (time >= 5 && time < 7) {
    // 日出
    skyColor = 0xffa500
    sunColor = 0xff6600
    sunIntensity = 0.5
    ambientIntensity = 0.2
  } else if (time >= 7 && time < 17) {
    // 白天
    skyColor = 0x87ceeb
    sunColor = 0xffff99
    sunIntensity = 1.0
    ambientIntensity = 0.4
  } else if (time >= 17 && time < 19) {
    // 日落
    skyColor = 0xff6347
    sunColor = 0xff4500
    sunIntensity = 0.6
    ambientIntensity = 0.3
  } else {
    // 夜晚
    skyColor = 0x000033
    sunColor = 0xaaaaff
    sunIntensity = 0.1
    ambientIntensity = 0.05
  }
  
  sky.material.color.setHex(skyColor)
  sun.material.color.setHex(sunColor)
  sunLight.intensity = sunIntensity
  
  // 更新雾的颜色
  if (scene.fog) {
    scene.fog.color.setHex(skyColor)
  }
  
  // 更新环境光
  if (scene.children[0] instanceof THREE.AmbientLight) {
    scene.children[0].intensity = ambientIntensity
  }
}

/**
 * 更新星星动画
 */
export function updateStarsAnimation(stars: any, time: number, currentTime: number): void {
  if (!stars || !stars.material) return
  
  stars.material.opacity = 0.6 + Math.sin(time * 0.5) * 0.2
  
  // 夜晚时星星更亮
  const nightOpacity = currentTime < 6 || currentTime > 18 ? 0.9 : 0.3
  stars.visible = currentTime < 7 || currentTime > 17
  if (stars.visible) {
    stars.material.opacity = nightOpacity + Math.sin(time * 0.5) * 0.1
  }
}

/**
 * 更新云层动画
 */
export function updateCloudsAnimation(clouds: any[], time: number): void {
  clouds.forEach((cloud, index) => {
    cloud.position.x += 0.02
    cloud.rotation.z += 0.0005
    
    // 循环漂移
    if (cloud.position.x > 150) {
      cloud.position.x = -150
    }
    
    // 上下浮动
    cloud.position.y += Math.sin(time + index) * 0.002
  })
}

