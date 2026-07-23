import { mixColors } from '@zengchaowu/shared/functions/design-tokens/mixColors'

/**
 * 自动监听和更新品牌色系统
 * 
 * 这是最优雅的解决方案：
 * 1. 自动监听 --el-color-primary 的变化
 * 2. 自动计算所有派生颜色（--brand-color-7 等）
 * 3. 支持动态主题切换
 * 4. 兼容所有浏览器
 * 
 * @param target - 要监听的目标元素，默认为 document.documentElement
 * @returns 停止监听的函数
 * 
 * @example
 * ```typescript
 * import { initBrandColorSystem } from '@zengchaowu/vue-ui'
 * 
 * // 在应用启动时调用一次即可
 * const stopWatching = initBrandColorSystem()
 * 
 * // 后续任何地方修改主色都会自动更新派生色
 * document.documentElement.style.setProperty('--el-color-primary', '#FF0000')
 * ```
 */
export function initBrandColorSystem(
  target: HTMLElement = document.documentElement
): () => void {
  updateDerivedColors(target)

  let updateTimer: ReturnType<typeof setTimeout> | null = null
  const debouncedUpdate = () => {
    if (updateTimer) clearTimeout(updateTimer)
    updateTimer = setTimeout(() => {
      updateDerivedColors(target)
      updateTimer = null
    }, 16)
  }

  let observer: MutationObserver | null = null
  let lastPrimaryColor = ''
  try {
    lastPrimaryColor = getComputedStyle(target).getPropertyValue('--el-color-primary').trim()
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          try {
            const newColor = getComputedStyle(target).getPropertyValue('--el-color-primary').trim()
            if (newColor && newColor !== lastPrimaryColor) {
              lastPrimaryColor = newColor
              debouncedUpdate()
              break
            }
          } catch {
            debouncedUpdate()
          }
        }
      }
    })
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['style'],
    })
  } catch {
    observer = null
  }

  console.log('✅ 品牌色自动监听系统已启动')

  return () => {
    if (updateTimer) clearTimeout(updateTimer)
    observer?.disconnect()
    console.log('⏹ 品牌色监听系统已停止')
  }
}

/**
 * 更新派生颜色
 * @internal
 */
function updateDerivedColors(target: HTMLElement): void {
  try {
    // 读取当前的主色
    const computedStyle = getComputedStyle(target)
    let primaryColor = computedStyle.getPropertyValue('--el-color-primary').trim()
    
    // 如果没有主色，使用默认值
    if (!primaryColor || !primaryColor.startsWith('#')) {
      primaryColor = '#0077FF'
    }
    
    // 计算 brand-color-7（主色 + 20% 黑色）
    const brandColor7 = mixColors(primaryColor, '#000000', 0.2)
    
    // 设置派生色
    target.style.setProperty('--brand-color-7', brandColor7)
    
    // 未来如果有更多派生色，可以在这里添加
    // const brandColor8 = mixColors(primaryColor, '#000000', 0.3)
    // target.style.setProperty('--brand-color-8', brandColor8)
    
  } catch (error) {
    // 静默失败，使用 CSS 中的降级值
  }
}

/**
 * 手动触发颜色更新（用于特殊场景）
 * 
 * @param target - 要更新的目标元素
 * 
 * @example
 * ```typescript
 * import { updateBrandColors } from '@zengchaowu/vue-ui'
 * 
 * // 手动触发更新
 * updateBrandColors()
 * ```
 */
export function updateBrandColors(
  target: HTMLElement = document.documentElement
): void {
  updateDerivedColors(target)
}

