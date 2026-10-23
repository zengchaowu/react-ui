import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { Map as LeafletMap, Marker, MarkerOptions } from 'leaflet'
import type { TpLeafletHandle, TpLeafletLatLng, TpLeafletProps } from './types'

export const TpLeaflet = forwardRef<TpLeafletHandle, TpLeafletProps>(function TpLeaflet(
  {
    center = [39.9042, 116.4074], // 北京
    zoom = 13,
    height = '25rem',
    width = '100%',
    showToolbar = true,
    showZoomControl = true,
    showFullscreenControl = true,
    showInfo = false,
    containerClass = '',
    loading: loadingProp = false,
    onReady,
    onMoveend,
    onZoomend,
    onClick,
    onError,
    className,
    style,
    ...rest
  },
  ref,
) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const [currentCenter, setCurrentCenter] = useState<TpLeafletLatLng | null>(null)
  const [currentZoom, setCurrentZoom] = useState<number>(zoom)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(loadingProp)

  const callbacksRef = useRef({ onReady, onMoveend, onZoomend, onClick, onError })
  callbacksRef.current = { onReady, onMoveend, onZoomend, onClick, onError }

  // 地图初始化（对应 Vue onMounted + nextTick）
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    let cancelled = false

    const initMap = async () => {
      try {
        setLoading(true)

        // 动态导入 Leaflet
        const L = await import('leaflet')
        if (cancelled || !mapContainerRef.current) return

        // 创建地图实例
        const map = L.map(mapContainerRef.current, {
          center: [center[0], center[1]],
          zoom,
          zoomControl: false, // 我们使用自定义的缩放控件
        })
        mapInstanceRef.current = map

        // 添加默认图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map)

        // 监听地图事件
        map.on('moveend', () => {
          const c = map.getCenter()
          setCurrentCenter({ lat: c.lat, lng: c.lng })
          callbacksRef.current.onMoveend?.({ lat: c.lat, lng: c.lng })
        })

        map.on('zoomend', () => {
          const z = map.getZoom()
          setCurrentZoom(z)
          callbacksRef.current.onZoomend?.(z)
        })

        map.on('click', (e) => {
          callbacksRef.current.onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng })
        })

        // 设置初始中心点
        setCurrentCenter({ lat: center[0], lng: center[1] })

        setLoading(false)
        callbacksRef.current.onReady?.(map)
      } catch (error) {
        console.error('Leaflet 地图初始化失败:', error)
        setLoading(false)
        callbacksRef.current.onError?.(error)
      }
    }

    void initMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
    // 与 Vue 一致：仅在挂载时初始化一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听 center（对应 Vue watch props.center deep）
  useEffect(() => {
    const map = mapInstanceRef.current
    if (map && center) {
      map.setView([center[0], center[1]], map.getZoom())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]])

  // 监听 zoom（对应 Vue watch props.zoom）
  useEffect(() => {
    const map = mapInstanceRef.current
    if (map && zoom) {
      map.setZoom(zoom)
    }
  }, [zoom])

  // 监听 loading prop（对应 Vue watch props.loading）
  useEffect(() => {
    if (loadingProp !== undefined) {
      setLoading(loadingProp)
    }
  }, [loadingProp])

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 缩放控制
  const zoomIn = useCallback(() => {
    mapInstanceRef.current?.zoomIn()
  }, [])

  const zoomOut = useCallback(() => {
    mapInstanceRef.current?.zoomOut()
  }, [])

  // 全屏控制
  const toggleFullscreen = useCallback(() => {
    const container = mapContainerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        void container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen()
      }
    }
  }, [isFullscreen])

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    setCenter: (lat: number, lng: number) => {
      const map = mapInstanceRef.current
      if (map) {
        map.setView([lat, lng], map.getZoom())
      }
    },
    setZoom: (nextZoom: number) => {
      mapInstanceRef.current?.setZoom(nextZoom)
    },
    addMarker: async (lat: number, lng: number, options?: MarkerOptions) => {
      const map = mapInstanceRef.current
      if (map) {
        const L = await import('leaflet')
        const marker: Marker = L.marker([lat, lng], options).addTo(map)
        return marker
      }
      return null
    },
    removeMarker: (marker: Marker) => {
      const map = mapInstanceRef.current
      if (marker && map) {
        map.removeLayer(marker)
      }
    },
  }), [])

  return (
    <div
      {...rest}
      ref={mapContainerRef}
      className={[
        'w-full h-full bg-[var(--bg-color-secondarycontainer)] rounded-lg overflow-hidden',
        containerClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...style, height, width }}
    >
      {/* 地图加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-color-secondarycontainer)] z-[var(--z-index-sticky)]">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]"></div>
            <span className="text-sm text-[var(--text-color-secondary)]">地图加载中...</span>
          </div>
        </div>
      )}

      {/* 地图工具栏 */}
      {showToolbar && !loading && (
        <div className="absolute top-4 right-4 z-[var(--z-index-float)] flex flex-col space-y-2">
          {showZoomControl && (
            <div
              role="button"
              tabIndex={0}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[var(--bg-color-container)] transition-colors hover:bg-[var(--bg-color-component-hover)]"
              title="放大"
              onClick={zoomIn}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  zoomIn()
                }
              }}
            >
              <svg className="w-5 h-5 text-[var(--text-color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          )}
          {showZoomControl && (
            <div
              role="button"
              tabIndex={0}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[var(--bg-color-container)] transition-colors hover:bg-[var(--bg-color-component-hover)]"
              title="缩小"
              onClick={zoomOut}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  zoomOut()
                }
              }}
            >
              <svg className="w-5 h-5 text-[var(--text-color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
              </svg>
            </div>
          )}
          {showFullscreenControl && (
            <div
              role="button"
              tabIndex={0}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[var(--bg-color-container)] transition-colors hover:bg-[var(--bg-color-component-hover)]"
              title={isFullscreen ? '退出全屏' : '全屏'}
              onClick={toggleFullscreen}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleFullscreen()
                }
              }}
            >
              <svg className="w-5 h-5 text-[var(--text-color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {!isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                )}
              </svg>
            </div>
          )}
        </div>
      )}

      {/* 地图信息显示 */}
      {showInfo && !loading && (
        <div className="absolute bottom-4 left-4 z-[var(--z-index-float)] bg-[var(--bg-color-container)] rounded-md p-3 max-w-xs">
          <div className="text-sm text-[var(--text-color-secondary)]">
            {currentCenter && (
              <div>
                中心点: {currentCenter.lat.toFixed(4)}, {currentCenter.lng.toFixed(4)}
              </div>
            )}
            {currentZoom ? <div>缩放级别: {currentZoom}</div> : null}
          </div>
        </div>
      )}
    </div>
  )
})

export default TpLeaflet
