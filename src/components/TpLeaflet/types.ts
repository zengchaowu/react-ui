import type { HTMLAttributes } from 'react'
import type { Map as LeafletMap, Marker, MarkerOptions } from 'leaflet'

export interface TpLeafletLatLng {
  lat: number
  lng: number
}

export interface TpLeafletProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onError'> {
  // 地图中心点坐标 [纬度, 经度]
  center?: [number, number]
  // 初始缩放级别
  zoom?: number
  // 地图容器高度
  height?: string
  // 地图容器宽度
  width?: string
  // 是否显示工具栏
  showToolbar?: boolean
  // 是否显示缩放控件
  showZoomControl?: boolean
  // 是否显示全屏控件
  showFullscreenControl?: boolean
  // 是否显示地图信息
  showInfo?: boolean
  // 容器自定义类名
  containerClass?: string
  // 加载状态
  loading?: boolean
  // 地图准备就绪（对应 Vue `ready` 事件）
  onReady?: (map: LeafletMap) => void
  // 地图移动结束（对应 Vue `moveend` 事件）
  onMoveend?: (center: TpLeafletLatLng) => void
  // 地图缩放结束（对应 Vue `zoomend` 事件）
  onZoomend?: (zoom: number) => void
  // 地图点击事件（对应 Vue `click` 事件）
  onClick?: (position: TpLeafletLatLng) => void
  // 地图错误（对应 Vue `error` 事件）
  onError?: (error: unknown) => void
}

export interface TpLeafletTexts {
  loading?: string
  error?: string
  retry?: string
  zoomIn?: string
  zoomOut?: string
  reset?: string
  fullscreen?: string
  locate?: string
  layer?: string
  satellite?: string
  street?: string
  terrain?: string
  marker?: string
  popup?: string
  tooltip?: string
  coordinates?: string
  address?: string
  distance?: string
  area?: string
}

/** `defineExpose` 等价物：通过 ref 调用 */
export interface TpLeafletHandle {
  getMap: () => LeafletMap | null
  setCenter: (lat: number, lng: number) => void
  setZoom: (zoom: number) => void
  addMarker: (lat: number, lng: number, options?: MarkerOptions) => Promise<Marker | null>
  removeMarker: (marker: Marker) => void
}
