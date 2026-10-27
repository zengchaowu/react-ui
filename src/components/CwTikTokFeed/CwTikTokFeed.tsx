import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'
import CwTikTokPlayer from './CwTikTokPlayer'
import type { CwSocialActionEvent, CwTikTokFeedHandle, CwTikTokFeedProps, CwTikTokPlayerHandle } from './types'
import type { PreloadState, UserInfo, VideoInfo, VideoItem, VirtualItem } from '@zengchaowu/ui-shared/components/CwTikTokFeed/types'
import { tikTokFeedBase } from '@zengchaowu/ui-shared/components/CwTikTokFeed/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwTikTokFeed/texts'

/**
 * 触控板 / 高分鼠标一次轻扫会连续触发大量 wheel。
 * 翻页后加冷却，保证「一次手势 ≈ 一屏」。
 */
const WHEEL_PAGE_COOLDOWN_MS = 480
const WHEEL_DELTA_THRESHOLD_PX = 40

export const CwTikTokFeed = forwardRef<CwTikTokFeedHandle, CwTikTokFeedProps>(
  function CwTikTokFeed(
    {
      userAvatarFallbackSrc,
      videos,
      height = '100vh',
      itemHeight: itemHeightProp = 0, // 将在 mounted 时设置为视口高度
      bufferSize = 3,
      preloadOffset = 3,
      enableWheelControl = true,
      wheelSensitivity = 1,
      autoPlay = true,
      loop = true,
      initialIndex = 0,
      texts: textsProp,
      className,
      onCurrentChange,
      onLoadMore,
      onVideoPlay,
      onVideoPause,
      onVideoEnded,
      onUserClick,
      onFollowClick,
      onSocialAction,
      onVideoInfoClick,
      ...rest
    },
    ref,
  ) {
    const texts = { ...defaultTexts, ...(textsProp ?? {}) }

    // Refs
    const containerRef = useRef<HTMLDivElement | null>(null)
    const playerRefs = useRef<Map<number, CwTikTokPlayerHandle>>(new Map())

    // 响应式状态
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [scrollTop, setScrollTop] = useState(0)
    const [actualItemHeight, setActualItemHeight] = useState(0)

    // 预加载状态
    const [preloadState, setPreloadState] = useState<PreloadState>({
      isLoading: false,
      hasMore: true,
      loadedCount: 0,
    })

    // 触摸状态
    const touchState = useRef({
      startY: 0,
      startTime: 0,
      isMoving: false,
    })

    // 计算属性
    const containerHeight = typeof height === 'number' ? height + 'px' : height

    const itemHeight = itemHeightProp || actualItemHeight || window.innerHeight

    const totalHeight = videos.length * itemHeight

    const visibleRange = useMemo(() => {
      const viewHeight = actualItemHeight || window.innerHeight
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
      const endIndex = Math.min(
        videos.length - 1,
        Math.ceil((scrollTop + viewHeight) / itemHeight) + bufferSize,
      )
      return { startIndex, endIndex }
    }, [actualItemHeight, scrollTop, itemHeight, bufferSize, videos.length])

    const visibleItems = useMemo<VirtualItem[]>(() => {
      const { startIndex, endIndex } = visibleRange
      const items: VirtualItem[] = []

      for (let i = startIndex; i <= endIndex; i++) {
        if (videos[i]) {
          items.push({
            index: i,
            data: videos[i],
            height: itemHeight,
            top: i * itemHeight,
          })
        }
      }

      return items
    }, [visibleRange, videos, itemHeight])

    // 事件回调与最新值快照：滚轮等原生监听只挂一次，通过 ref 读最新值
    const emitRef = useRef({
      onCurrentChange,
      onLoadMore,
      onVideoPlay,
      onVideoPause,
      onVideoEnded,
      onUserClick,
      onFollowClick,
      onSocialAction,
      onVideoInfoClick,
    })
    emitRef.current = {
      onCurrentChange,
      onLoadMore,
      onVideoPlay,
      onVideoPause,
      onVideoEnded,
      onUserClick,
      onFollowClick,
      onSocialAction,
      onVideoInfoClick,
    }

    const latestRef = useRef({ videos, currentIndex, itemHeight, wheelSensitivity, enableWheelControl })
    latestRef.current = { videos, currentIndex, itemHeight, wheelSensitivity, enableWheelControl }

    const wheelLockedUntil = useRef(0)

    // 方法
    function setPlayerRef(player: CwTikTokPlayerHandle | null, index: number) {
      if (player) {
        playerRefs.current.set(index, player)
      } else {
        playerRefs.current.delete(index)
      }
    }

    function scrollToVideo(index: number) {
      const { videos: currentVideos, itemHeight: height } = latestRef.current
      if (index < 0 || index >= currentVideos.length) return

      const targetScrollTop = index * height
      setScrollTop(targetScrollTop)
      setCurrentIndex(index)

      emitRef.current.onCurrentChange?.(index, currentVideos[index])
    }

    function nextVideo() {
      const { videos: currentVideos, currentIndex: index } = latestRef.current
      if (index < currentVideos.length - 1) {
        scrollToVideo(index + 1)
      }
    }

    function prevVideo() {
      const { currentIndex: index } = latestRef.current
      if (index > 0) {
        scrollToVideo(index - 1)
      }
    }

    function playCurrentVideo() {
      const { videos: currentVideos, currentIndex: index } = latestRef.current
      const player = playerRefs.current.get(index)
      if (player && player.play) {
        void player.play()
      }
      const currentVideo = currentVideos[index]
      if (currentVideo) {
        emitRef.current.onVideoPlay?.(index, currentVideo)
      }
    }

    function pauseCurrentVideo() {
      const { videos: currentVideos, currentIndex: index } = latestRef.current
      const player = playerRefs.current.get(index)
      if (player && player.pause) {
        player.pause()
      }
      const currentVideo = currentVideos[index]
      if (currentVideo) {
        emitRef.current.onVideoPause?.(index, currentVideo)
      }
    }

    function getCurrentIndex() {
      return latestRef.current.currentIndex
    }

    function getCurrentVideo() {
      const { videos: currentVideos, currentIndex: index } = latestRef.current
      return currentVideos[index] || null
    }

    function refreshVirtualScroll() {
      // nextTick → rAF：重新计算可见项
      requestAnimationFrame(() => {
        const { videos: currentVideos, currentIndex: index, itemHeight: height } = latestRef.current
        const newIndex = Math.round(scrollTop / height)
        if (newIndex !== index) {
          const clamped = Math.max(0, Math.min(newIndex, currentVideos.length - 1))
          setCurrentIndex(clamped)
          emitRef.current.onCurrentChange?.(clamped, currentVideos[clamped])
        }
      })
    }

    function normalizeWheelDeltaY(event: WheelEvent): number {
      let dy = event.deltaY
      // 0=pixel, 1=line, 2=page
      if (event.deltaMode === 1) dy *= 16
      else if (event.deltaMode === 2) dy *= latestRef.current.itemHeight || window.innerHeight
      return dy * latestRef.current.wheelSensitivity
    }

    // React 的 onWheel 以 passive 方式挂到根节点，preventDefault 会失效；
    // 与 Vue 一致需要可取消的原生 wheel 监听。
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      function handleWheel(event: WheelEvent) {
        if (!latestRef.current.enableWheelControl) return

        event.preventDefault()

        const now = Date.now()
        if (now < wheelLockedUntil.current) return

        const delta = normalizeWheelDeltaY(event)
        if (Math.abs(delta) < WHEEL_DELTA_THRESHOLD_PX) return

        wheelLockedUntil.current = now + WHEEL_PAGE_COOLDOWN_MS
        if (delta > 0) {
          nextVideo()
        } else {
          prevVideo()
        }
      }

      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheel)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 触摸事件处理
    function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
      touchState.current.startY = event.touches[0].clientY
      touchState.current.startTime = Date.now()
      touchState.current.isMoving = false
    }

    function handleTouchMove(_event: ReactTouchEvent<HTMLDivElement>) {
      touchState.current.isMoving = true
    }

    function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
      if (!touchState.current.isMoving) return

      const endY = event.changedTouches[0].clientY
      const deltaY = touchState.current.startY - endY
      const deltaTime = Date.now() - touchState.current.startTime

      // 快速滑动或滑动距离足够大
      if (Math.abs(deltaY) > 50 || (Math.abs(deltaY) > 20 && deltaTime < 300)) {
        if (deltaY > 0) {
          nextVideo()
        } else {
          prevVideo()
        }
      }
    }

    // 视频事件处理
    function handleVideoPlay(index: number, video: VideoItem) {
      emitRef.current.onVideoPlay?.(index, video)
    }

    function handleVideoPause(index: number, video: VideoItem) {
      emitRef.current.onVideoPause?.(index, video)
    }

    function handleVideoEnded(index: number, video: VideoItem) {
      emitRef.current.onVideoEnded?.(index, video)

      // 自动播放下一个视频
      if (autoPlay && index < videos.length - 1) {
        nextVideo()
      }
    }

    function handleUserClick(user: UserInfo, video: VideoItem) {
      emitRef.current.onUserClick?.(user, video)
    }

    function handleFollowClick(user: UserInfo, video: VideoItem) {
      emitRef.current.onFollowClick?.(user, video)
    }

    function handleSocialAction(action: CwSocialActionEvent, video: VideoItem) {
      emitRef.current.onSocialAction?.(action, video)
    }

    function handleVideoInfoClick(videoInfo: VideoInfo, video: VideoItem) {
      emitRef.current.onVideoInfoClick?.(videoInfo, video)
    }

    // 预加载检查
    function checkPreload() {
      const { videos: currentVideos, currentIndex: index } = latestRef.current
      const remainingVideos = currentVideos.length - index - 1

      if (remainingVideos <= preloadOffset && !preloadState.isLoading && preloadState.hasMore) {
        setPreloadState((prev) => ({ ...prev, isLoading: true }))
        emitRef.current.onLoadMore?.(index, currentVideos)
      }
    }

    // 监听当前索引变化（immediate：挂载即执行一次）
    useEffect(() => {
      checkPreload()

      // 自动播放控制
      if (autoPlay) {
        // 暂停所有视频
        playerRefs.current.forEach((player, index) => {
          if (index !== currentIndex && player && player.pause) {
            player.pause()
          }
        })

        // 播放当前视频
        const currentVideo = videos[currentIndex]
        if (currentVideo) {
          // nextTick → rAF：等当前项挂载后再取播放器
          const raf = requestAnimationFrame(() => {
            const currentPlayer = playerRefs.current.get(currentIndex)
            if (currentPlayer && currentPlayer.play) {
              void currentPlayer.play()
            }
            emitRef.current.onVideoPlay?.(currentIndex, currentVideo)
          })
          return () => cancelAnimationFrame(raf)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, autoPlay])

    // 监听视频列表变化
    const prevVideosLength = useRef(videos.length)
    useEffect(() => {
      const newLength = videos.length
      const oldLength = prevVideosLength.current
      prevVideosLength.current = newLength
      if (newLength > oldLength) {
        setPreloadState((prev) => ({
          ...prev,
          isLoading: false,
          loadedCount: newLength - oldLength,
        }))
      }
    }, [videos.length])

    // 生命周期
    useEffect(() => {
      if (containerRef.current) {
        setActualItemHeight(containerRef.current.clientHeight || window.innerHeight)
      }

      // 初始化滚动位置
      if (initialIndex > 0) {
        scrollToVideo(initialIndex)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 暴露方法
    useImperativeHandle(
      ref,
      () => ({
        scrollToVideo,
        playCurrentVideo,
        pauseCurrentVideo,
        nextVideo,
        prevVideo,
        getCurrentIndex,
        getCurrentVideo,
        refreshVirtualScroll,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )

    return (
      <div
        {...rest}
        ref={containerRef}
        className={[tikTokFeedBase.root, className].filter(Boolean).join(' ')}
        style={{ height: containerHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 虚拟滚动容器 */}
        <div
          className={tikTokFeedBase.container}
          style={{
            height: totalHeight + 'px',
            transform: `translateY(-${scrollTop}px)`,
          }}
        >
          {/* 可见的视频项 */}
          {visibleItems.map((item) => (
            <div
              key={item.data.video.id}
              className={tikTokFeedBase.item}
              style={{
                height: itemHeight + 'px',
                top: item.top + 'px',
              }}
            >
              <CwTikTokPlayer
                ref={(player) => setPlayerRef(player, item.index)}
                userAvatarFallbackSrc={userAvatarFallbackSrc}
                video={item.data.video}
                user={item.data.user}
                socialActions={item.data.socialActions}
                autoplay={autoPlay && item.index === currentIndex}
                muted={item.index !== currentIndex}
                loop={loop}
                onPlay={() => handleVideoPlay(item.index, item.data)}
                onPause={() => handleVideoPause(item.index, item.data)}
                onEnded={() => handleVideoEnded(item.index, item.data)}
                onUserClick={(user: UserInfo) => handleUserClick(user, item.data)}
                onFollowClick={(user: UserInfo) => handleFollowClick(user, item.data)}
                onSocialAction={(action) => handleSocialAction(action, item.data)}
                onVideoInfoClick={(video: VideoInfo) => handleVideoInfoClick(video, item.data)}
              />
            </div>
          ))}
        </div>

        {/* 加载指示器 */}
        {preloadState.isLoading ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
            <div className="bg-[var(--overlay-scrim-half)] text-[var(--text-color-anti)] px-4 py-2 rounded-full text-sm">
              {texts.loading}
            </div>
          </div>
        ) : null}

        {/* 视频索引指示器 */}
        <div className="absolute top-4 right-4">
          <div className="bg-[var(--overlay-scrim-half)] text-[var(--text-color-anti)] px-3 py-1 rounded-full text-xs">
            {currentIndex + 1} / {videos.length}
          </div>
        </div>
      </div>
    )
  },
)

export default CwTikTokFeed
