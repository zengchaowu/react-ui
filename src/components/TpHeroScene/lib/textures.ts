/**
 * 纹理生成函数（纯函数）
 */
import {
  canvasRgb,
  canvasRgba,
  hexToRgb,
  tokenSolidColors,
} from '../../../assets/tokens/tokenSolidColors'

const [terrainR, terrainG, terrainB] = hexToRgb(tokenSolidColors.sceneTerrainGrass)
const [trunkR, trunkG, trunkB] = hexToRgb(tokenSolidColors.sceneTreeTrunk)
const [leavesR, leavesG, leavesB] = hexToRgb(tokenSolidColors.sceneLeaves)
const [rockR, rockG, rockB] = hexToRgb(tokenSolidColors.sceneRockBase)

/**
 * 创建地形纹理
 */
export function createTerrainTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneTerrainGrass
    ctx.fillRect(0, 0, 512, 512)

    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = Math.random() * 3
      const brightness = Math.random() * 50 - 25

      ctx.fillStyle = canvasRgb(
        terrainR + brightness,
        terrainG + brightness,
        terrainB + brightness,
      )
      ctx.fillRect(x, y, size, size)
    }

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      ctx.strokeStyle = canvasRgba(45, 80, 60, Math.random() * 0.3)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.random() * 4 - 2, y + Math.random() * 4 + 2)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)
  return texture
}

/**
 * 创建法线贴图
 */
export function createNormalTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneNormalMapBase
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const r = Math.floor(128 + Math.random() * 20 - 10)
      const g = Math.floor(128 + Math.random() * 20 - 10)
      const b = Math.floor(255)
      ctx.fillStyle = canvasRgb(r, g, b)
      ctx.fillRect(x, y, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)
  return texture
}

/**
 * 创建粗糙度贴图
 */
export function createRoughnessTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneRoughnessBase
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const brightness = Math.random() * 60
      ctx.fillStyle = canvasRgb(brightness, brightness, brightness)
      ctx.fillRect(x, y, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)
  return texture
}

/**
 * 创建水面法线贴图
 */
export function createWaterNormalMap(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneNormalMapBase
    ctx.fillRect(0, 0, 512, 512)

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const radius = Math.random() * 40 + 20

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, tokenSolidColors.sceneNormalMapHi)
      gradient.addColorStop(0.5, tokenSolidColors.sceneNormalMapBase)
      gradient.addColorStop(1, tokenSolidColors.sceneNormalMapLo)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 5)
  return texture
}

/**
 * 创建星星纹理
 */
export function createStarTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, canvasRgba(255, 255, 255, 1))
    gradient.addColorStop(0.5, canvasRgba(255, 255, 255, 0.5))
    gradient.addColorStop(1, canvasRgba(255, 255, 255, 0))

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建岩石纹理
 */
export function createRockTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneRockBase
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const brightness = Math.random() * 80 - 40
      ctx.fillStyle = canvasRgb(
        rockR + brightness,
        rockG + brightness,
        rockB + brightness,
      )
      ctx.fillRect(x, y, 2, 2)
    }
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建岩石法线贴图
 */
export function createRockNormalMap(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneNormalMapBase
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const r = Math.floor(128 + Math.random() * 40 - 20)
      const g = Math.floor(128 + Math.random() * 40 - 20)
      ctx.fillStyle = canvasRgb(r, g, 255)
      ctx.fillRect(x, y, 2, 2)
    }
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建树干纹理
 */
export function createTreeTrunkTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneTreeTrunk
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 50; i++) {
      const y = Math.random() * 256
      ctx.strokeStyle = canvasRgba(60, 45, 30, Math.random() * 0.5)
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(256, y + (Math.random() - 0.5) * 10)
      ctx.stroke()
    }

    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const brightness = Math.random() * 30 - 15
      ctx.fillStyle = canvasRgb(
        trunkR + brightness,
        trunkG + brightness,
        trunkB + brightness,
      )
      ctx.fillRect(x, y, 1, 1)
    }
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建树干法线贴图
 */
export function createTreeTrunkNormalMap(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneNormalMapBase
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256
      ctx.strokeStyle = canvasRgba(100, 100, 255, 0.3)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5) * 20, 256)
      ctx.stroke()
    }
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建树叶纹理
 */
export function createLeavesTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneLeaves
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const brightness = Math.random() * 40 - 20
      ctx.fillStyle = canvasRgb(
        leavesR + brightness,
        leavesG + brightness,
        leavesB + brightness,
      )
      ctx.fillRect(x, y, 2, 2)
    }
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建树叶法线贴图
 */
export function createLeavesNormalMap(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = tokenSolidColors.sceneNormalMapBase
    ctx.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const r = Math.floor(128 + Math.random() * 30 - 15)
      const g = Math.floor(128 + Math.random() * 30 - 15)
      ctx.fillStyle = canvasRgb(r, g, 255)
      ctx.fillRect(x, y, 1, 1)
    }
  }

  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建草纹理
 */
export function createGrassTexture(THREE: any): any {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.clearRect(0, 0, 64, 128)

    ctx.strokeStyle = tokenSolidColors.sceneGrassStrokeDark
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(32, 128)
    ctx.quadraticCurveTo(20, 64, 32, 0)
    ctx.stroke()

    ctx.strokeStyle = tokenSolidColors.sceneGrassStrokeLight
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(28, 128)
    ctx.quadraticCurveTo(35, 64, 25, 10)
    ctx.stroke()
  }

  return new THREE.CanvasTexture(canvas)
}
