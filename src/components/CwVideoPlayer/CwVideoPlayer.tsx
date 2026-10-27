import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwVideoPlayerExpose, CwVideoPlayerProps } from './types'
import { CwVideoPlayerControls } from './CwVideoPlayerControls'
import { CwIcon } from '../CwIcon/CwIcon'
import { videoPlayerBase } from '@zengchaowu/ui-shared/components/CwVideoPlayer/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwVideoPlayer/texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export const CwVideoPlayer = forwardRef<CwVideoPlayerExpose, CwVideoPlayerProps>(
  function CwVideoPlayer(
    {
      src,
      poster,
      controls = true,
      autoplay = false,
      muted = false,
      loop = false,
      preload = 'metadata',
      fullscreen = true,
      volume = 1,
      showOverlay = true,
      disabled = false,
      fitToParent = false,
      texts: textsProp,
      className,
      onLoadedMetadata,
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
      onVolumeChange,
      ...rest
    },
    ref,
  ) {
    const texts = { ...defaultTexts, ...textsProp }

    const containerClass = [
      fitToParent
        ? videoPlayerBase.containerFillParent
        : videoPlayerBase.container,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const videoClass = fitToParent
      ? videoPlayerBase.videoObjectFit
      : videoPlayerBase.video

    // tabindex
    const tabIndex = disabled ? undefined : 0

    // 响应式数据
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentVolume, setCurrentVolume] = useState(volume)
    const [loading, setLoading] = useState(preload !== 'none')
    const [showControls, setShowControls] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    )
    const [hasUserInteracted, setHasUserInteracted] = useState(false)
    // Focus 状态 - 使用 useFocusVisible 来区分键盘导航和鼠标点击
    const {
      isFocusVisible,
      handleFocus: handleFocusVisibleFocus,
      handleBlur: handleFocusVisibleBlur,
    } = useBrowserFocusVisible()

    // 保存上一次的非零音量值
    const lastVolumeRef = useRef(volume)
    const currentVolumeRef = useRef(volume)
    useEffect(() => {
      currentVolumeRef.current = currentVolume
    }, [currentVolume])

    const onVolumeChangeRef = useRef(onVolumeChange)
    useEffect(() => {
      onVolumeChangeRef.current = onVolumeChange
    }, [onVolumeChange])

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    // Focus 和 Blur 处理 - 只在键盘导航时显示 focus 样式
    function handleFocus() {
      if (disabled) return
      handleFocusVisibleFocus()
    }

    function handleBlur() {
      handleFocusVisibleBlur()
    }

    // 键盘事件处理
    function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
      // 重要：disabled 状态下不允许键盘操作
      if (disabled) return

      if (!videoRef.current) return

      switch (event.key) {
        case ' ': // Space
        case 'Enter':
          event.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft': {
          event.preventDefault()
          // 快退 5 秒
          handleSeek(Math.max(0, currentTime - 5))
          break
        }
        case 'ArrowRight': {
          event.preventDefault()
          // 快进 5 秒
          handleSeek(Math.min(duration, currentTime + 5))
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          // 音量增加 10%
          handleVolumeChangeFromControls(Math.min(1, currentVolume + 0.1))
          break
        }
        case 'ArrowDown': {
          event.preventDefault()
          // 音量减少 10%
          handleVolumeChangeFromControls(Math.max(0, currentVolume - 0.1))
          break
        }
        case 'f':
        case 'F':
          event.preventDefault()
          if (fullscreen) {
            toggleFullscreen()
          }
          break
        case 'm':
        case 'M':
          event.preventDefault()
          toggleMute()
          break
      }
    }

    // 方法
    function togglePlay() {
      const video = videoRef.current
      if (!video || disabled) return

      setHasUserInteracted(true)

      if (isPlaying) {
        video.pause()
      } else {
        setLoading(true)
        void video.play().catch(() => {
          setLoading(false)
        })
      }
    }

    function handleVideoClick() {
      // 在全屏模式下，不处理自定义点击事件，让浏览器原生控件处理
      if (isFullscreen) {
        return
      }

      // 非全屏模式下，使用自定义的播放/暂停逻辑
      togglePlay()
    }

    function toggleMute() {
      const video = videoRef.current
      if (!video || disabled) return

      // 检查当前是否处于静音状态（考虑both volume和muted属性）
      const isMuted = video.muted || video.volume === 0

      if (isMuted) {
        // 从静音状态恢复
        video.muted = false
        if (video.volume === 0) {
          video.volume = lastVolumeRef.current
        }
        // currentVolume会通过volumechange事件自动更新
      } else {
        // 进入静音状态前，保存当前音量值
        if (video.volume > 0) {
          lastVolumeRef.current = video.volume
        }
        // 优先使用muted属性，这样更兼容浏览器原生控件
        video.muted = true
        // currentVolume会通过volumechange事件自动更新
      }
    }

    function toggleFullscreen() {
      const video = videoRef.current
      if (!video || disabled) return

      if (!isFullscreen) {
        if (video.requestFullscreen) {
          void video.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          void document.exitFullscreen()
        }
      }
    }

    function handleSeek(time: number) {
      const video = videoRef.current
      if (!video || disabled) return

      video.currentTime = time
      setCurrentTime(time)
    }

    function handleVolumeChangeFromControls(nextVolume: number) {
      const video = videoRef.current
      if (!video || disabled) return

      video.volume = nextVolume
      setCurrentVolume(nextVolume)
    }

    function handleMouseLeave() {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }

      controlsTimerRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 2000)
    }

    // 事件处理
    function handleVideoError() {
      setLoading(false)
    }

    function handleLoadedMetadata() {
      const video = videoRef.current
      if (!video) return

      const nextDuration = video.duration
      setDuration(nextDuration)
      setLoading(false)
      onLoadedMetadata?.({
        duration: nextDuration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      })
    }

    function handleTimeUpdate() {
      const video = videoRef.current
      if (!video) return

      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
    }

    function handlePlay() {
      setIsPlaying(true)
      setLoading(false)
      onPlay?.()
    }

    function handlePause() {
      setIsPlaying(false)
      onPause?.()
    }

    function handleEnded() {
      setIsPlaying(false)
      onEnded?.()
    }

    function handleVolumeChange() {
      const video = videoRef.current
      if (!video) return

      // 如果视频被静音，显示音量为0，否则显示实际音量
      const displayVolume = video.muted ? 0 : video.volume
      setCurrentVolume(displayVolume)
      onVolumeChange?.(displayVolume)
    }

    // 生命周期
    useEffect(() => {
      const video = videoRef.current
      if (video) {
        video.volume = volume
        setCurrentVolume(volume)
      }

      // 全屏事件监听
      function handleFullscreenChange() {
        setIsFullscreen(!!document.fullscreenElement)

        // 在全屏模式变化时，确保我们能捕获到浏览器原生控件的静音操作
        const currentVideo = videoRef.current
        if (currentVideo) {
          // 重新同步当前音量状态
          const displayVolume = currentVideo.muted ? 0 : currentVideo.volume
          setCurrentVolume(displayVolume)
          onVolumeChangeRef.current?.(displayVolume)

          // 如果不是静音状态且音量大于0，更新lastVolume
          if (!currentVideo.muted && currentVideo.volume > 0) {
            lastVolumeRef.current = currentVideo.volume
          }
        }
      }

      // 定期检查音量和静音状态变化的函数
      function checkVolumeChanges() {
        const currentVideo = videoRef.current
        if (currentVideo && document.fullscreenElement) {
          // 计算应该显示的音量值（考虑muted状态）
          const displayVolume = currentVideo.muted ? 0 : currentVideo.volume

          // 如果显示音量与记录的音量不同，说明用户可能通过浏览器原生控件改变了音量或静音状态
          if (displayVolume !== currentVolumeRef.current) {
            currentVolumeRef.current = displayVolume
            setCurrentVolume(displayVolume)
            onVolumeChangeRef.current?.(displayVolume)

            // 如果从静音状态恢复且音量大于0，更新lastVolume
            if (!currentVideo.muted && currentVideo.volume > 0) {
              lastVolumeRef.current = currentVideo.volume
            }
          }
        }
      }

      document.addEventListener('fullscreenchange', handleFullscreenChange)

      // 添加定期检查音量变化的定时器
      const volumeCheckInterval = setInterval(checkVolumeChanges, 500)

      return () => {
        clearInterval(volumeCheckInterval)
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        if (controlsTimerRef.current) {
          clearTimeout(controlsTimerRef.current)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        play: () => videoRef.current?.play(),
        pause: () => videoRef.current?.pause(),
        seek: (time: number) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time
          }
        },
        setVolume: (nextVolume: number) => {
          if (videoRef.current) {
            videoRef.current.volume = nextVolume
            setCurrentVolume(nextVolume)
          }
        },
        getCurrentTime: () => currentTime,
        getDuration: () => duration,
        getVideoElement: () => videoRef.current,
      }),
      [currentTime, duration],
    )

    return (
      <div
        {...rest}
        className={[
          containerClass,
          isFocusVisible && !disabled ? videoPlayerBase.containerFocused : '',
        ]
          .filter(Boolean)
          .join(' ')}
        tabIndex={tabIndex}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={handleMouseLeave}
        role="application"
        aria-label={texts.player}
        aria-disabled={disabled ? 'true' : 'false'}
      >
        {/* 视频元素 */}
        <video
          ref={videoRef}
          className={videoClass}
          src={src}
          poster={poster}
          muted={muted}
          loop={loop}
          autoPlay={autoplay}
          preload={preload}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleVideoError}
          onVolumeChange={handleVolumeChange}
          onClick={handleVideoClick}
        />

        {/* 加载状态 */}
        {loading && showOverlay ? (
          <div className={videoPlayerBase.overlayLoading}>
            <CwIcon
              name="common--status--loading-line"
              prefix="icon"
              spin
              size={videoPlayerBase.loadingIconStyles?.size ?? 1}
              className={videoPlayerBase.loadingIconStyles?.class}
            />
          </div>
        ) : null}

        {/* 播放按钮覆盖层 */}
        {!isPlaying &&
        !loading &&
        (!autoplay || hasUserInteracted) &&
        showOverlay &&
        !isFullscreen ? (
          <div
            className={videoPlayerBase.overlayPlayButton}
            onClick={togglePlay}
          >
            <div className={videoPlayerBase.playButton}>
              <CwIcon
                name="common--media--play-filled"
                prefix="icon"
                size={videoPlayerBase.playButtonIconStyles?.size ?? 1}
                className={videoPlayerBase.playButtonIconStyles?.class}
              />
            </div>
          </div>
        ) : null}

        {/* 控制栏 */}
        {controls && (showControls || !isPlaying) ? (
          <CwVideoPlayerControls
            visible={showControls || !isPlaying}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={currentVolume}
            progress={progress}
            fullscreen={fullscreen}
            isFullscreen={isFullscreen}
            onTogglePlay={togglePlay}
            onToggleMute={toggleMute}
            onToggleFullscreen={toggleFullscreen}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChangeFromControls}
          />
        ) : null}
      </div>
    )
  },
)

export default CwVideoPlayer
