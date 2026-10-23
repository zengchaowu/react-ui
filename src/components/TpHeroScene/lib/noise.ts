/**
 * Perlin 噪声生成函数（纯函数）
 */

/**
 * 平滑插值函数
 */
export function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * 线性插值
 */
export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

/**
 * 梯度函数
 */
export function grad(hash: number, x: number, y: number): number {
  const h = hash & 15
  const u = h < 8 ? x : y
  const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

/**
 * 2D Perlin 噪声
 */
export function perlinNoise(x: number, y: number): number {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  
  x -= Math.floor(x)
  y -= Math.floor(y)
  
  const u = fade(x)
  const v = fade(y)
  
  const a = (X + Y * 57) * 8253729 % 65536
  const b = (X + 1 + Y * 57) * 8253729 % 65536
  const c = (X + (Y + 1) * 57) * 8253729 % 65536
  const d = (X + 1 + (Y + 1) * 57) * 8253729 % 65536
  
  const x1 = lerp(grad(a, x, y), grad(b, x - 1, y), u)
  const x2 = lerp(grad(c, x, y - 1), grad(d, x - 1, y - 1), u)
  
  return lerp(x1, x2, v)
}

/**
 * 多层 Perlin 噪声（更真实的地形效果）
 */
export function multiOctaveNoise(x: number, y: number, octaves: number): number {
  let total = 0
  let frequency = 1
  let amplitude = 1
  let maxValue = 0
  
  for (let i = 0; i < octaves; i++) {
    total += perlinNoise(x * frequency, y * frequency) * amplitude
    maxValue += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  
  return total / maxValue
}

