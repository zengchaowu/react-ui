export interface TpLeafletProps {
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
}


export interface TpLeafletStyles {
  root: string;
  map: string;
  controls?: string;
  controlButton?: string;
  controlButtonActive?: string;
  loading?: string;
  loadingSpinner?: string;
  loadingText?: string;
  error?: string;
  errorIcon?: string;
  errorText?: string;
  retryButton?: string;
  popup?: string;
  popupTitle?: string;
  popupContent?: string;
  marker?: string;
  markerActive?: string;
  tooltip?: string;
}

export interface TpLeafletTexts {
  // Placeholder for texts
}

export interface TpLeafletEmits {
  // 地图准备就绪
  ready: [map: any]
  // 地图移动结束
  moveend: [center: { lat: number; lng: number }]
  // 地图缩放结束
  zoomend: [zoom: number]
  // 地图点击事件
  click: [position: { lat: number; lng: number }]
  // 地图错误
  error: [error: any]
}