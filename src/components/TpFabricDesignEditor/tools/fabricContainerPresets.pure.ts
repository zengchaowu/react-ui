import type { CwDesignToolRailItemConfig } from '../../CwDesignToolRail/types'

export const FABRIC_CONTAINER_PRESET_KEY_PREFIX = 'container:'

export type FabricContainerPreset = {
  id: string
  label: string
  width: number
  height: number
  category: 'phone' | 'tablet' | 'desktop' | 'square'
}

export const FABRIC_CONTAINER_PRESETS: readonly FabricContainerPreset[] = [
  { id: 'android-phone', label: '安卓手机', width: 360, height: 780, category: 'phone' },
  { id: 'iphone-se', label: 'iPhone SE', width: 320, height: 568, category: 'phone' },
  { id: 'iphone-13-mini', label: 'iPhone 13 mini', width: 375, height: 812, category: 'phone' },
  { id: 'iphone-14-15', label: 'iPhone 14 / 15', width: 393, height: 852, category: 'phone' },
  { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max', width: 430, height: 932, category: 'phone' },
  { id: 'iphone-16', label: 'iPhone 16', width: 393, height: 852, category: 'phone' },
  { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max', width: 440, height: 956, category: 'phone' },
  { id: 'ipad', label: 'iPad', width: 768, height: 1024, category: 'tablet' },
  { id: 'ipad-pro-11', label: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet' },
  { id: 'pc-browser', label: 'PC 浏览器', width: 1440, height: 900, category: 'desktop' },
  { id: 'pc-browser-sm', label: 'PC 浏览器（小）', width: 1280, height: 800, category: 'desktop' },
  { id: 'desktop-hd', label: '桌面宽屏', width: 1920, height: 1080, category: 'desktop' },
  { id: 'square-1024', label: '方形 1024', width: 1024, height: 1024, category: 'square' },
  { id: 'square-512', label: '方形 512', width: 512, height: 512, category: 'square' },
] as const

const CATEGORY_LABELS: Record<FabricContainerPreset['category'], string> = {
  phone: '手机',
  tablet: '平板',
  desktop: '桌面',
  square: '方形',
}

const CATEGORY_ORDER: FabricContainerPreset['category'][] = [
  'phone',
  'tablet',
  'desktop',
  'square',
]

export function fabricContainerPresetKey(id: string): string {
  return `${FABRIC_CONTAINER_PRESET_KEY_PREFIX}${id}`
}

export function parseFabricContainerPresetKey(
  key: string,
): string | null {
  if (!key.startsWith(FABRIC_CONTAINER_PRESET_KEY_PREFIX)) return null
  const id = key.slice(FABRIC_CONTAINER_PRESET_KEY_PREFIX.length)
  if (!id || id.startsWith('cat-')) return null
  return id
}

export function resolveFabricContainerPreset(
  id: string,
): FabricContainerPreset | undefined {
  return FABRIC_CONTAINER_PRESETS.find((p) => p.id === id)
}

export function fabricContainerMenuItems(): CwDesignToolRailItemConfig[] {
  const items: CwDesignToolRailItemConfig[] = []
  for (const category of CATEGORY_ORDER) {
    items.push({
      key: `${FABRIC_CONTAINER_PRESET_KEY_PREFIX}cat-${category}`,
      label: CATEGORY_LABELS[category],
      disabled: true,
    })
    for (const preset of FABRIC_CONTAINER_PRESETS) {
      if (preset.category !== category) continue
      items.push({
        key: fabricContainerPresetKey(preset.id),
        label: `${preset.label}  ${preset.width}×${preset.height}`,
        toggle: true,
      })
    }
  }
  return items
}
