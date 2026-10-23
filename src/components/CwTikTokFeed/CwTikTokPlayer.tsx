import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { CwVideoPlayer } from '../CwVideoPlayer'
import type { CwVideoPlayerExpose } from '../CwVideoPlayer/types'
import { CwAvatar } from '../CwAvatar'
import CwSocialSidebar from './CwSocialSidebar'
import type { CwSocialActionEvent, CwTikTokPlayerHandle, CwTikTokPlayerProps } from './types'

export const CwTikTokPlayer = forwardRef<CwTikTokPlayerHandle, CwTikTokPlayerProps>(
  function CwTikTokPlayer(
    {
      userAvatarFallbackSrc,
      video,
      user,
      socialActions,
      showUserInfo = true,
      showVideoInfo = true,
      showSocialSidebar = true,
      autoplay = false,
      muted = true,
      loop = true,
      videoConfig,
      avatarConfig,
      onPlay,
      onPause,
      onEnded,
      onUserClick,
      onFollowClick,
      onSocialAction,
      onVideoInfoClick,
    },
    ref,
  ) {
    // 组件引用
    const videoPlayerRef = useRef<CwVideoPlayerExpose | null>(null)

    // 播放状态
    const [isPlaying, setIsPlaying] = useState(false)

    // 合并配置
    const mergedVideoConfig = useMemo(
      () => ({
        autoplay,
        muted,
        loop,
        controls: false,
        showOverlay: false,
        ...videoConfig,
      }),
      [autoplay, muted, loop, videoConfig],
    )

    const mergedAvatarConfig = {
      fallbackSrc: userAvatarFallbackSrc,
      text: user.nickname || user.username,
      ...avatarConfig,
    }

    function isPlayableUrl(v: unknown): v is string {
      if (typeof v !== 'string') return false
      const s = v.trim()
      if (!s) return false
      return (
        s.startsWith('http://') ||
        s.startsWith('https://') ||
        s.startsWith('blob:') ||
        s.startsWith('data:') ||
        s.startsWith('/')
      )
    }

    const resolvedVideoSrc = (() => {
      const anyVideo = video as unknown as Record<string, unknown>
      const candidates: unknown[] = [
        anyVideo.videoUrl,
        anyVideo.video_url,
        anyVideo.playUrl,
        anyVideo.play_url,
        anyVideo.url,
        anyVideo.src,
        video.id,
      ]
      for (const item of candidates) {
        if (isPlayableUrl(item)) return item
      }
      return ''
    })()

    // 事件处理
    function handlePlay() {
      setIsPlaying(true)
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

    function play() {
      return videoPlayerRef.current?.play()
    }

    function pause() {
      videoPlayerRef.current?.pause()
    }

    function togglePlayPause() {
      if (isPlaying) {
        pause()
      } else {
        play()
      }
    }

    function handleUserClick() {
      onUserClick?.(user)
    }

    function handleFollowClick() {
      onFollowClick?.(user)
    }

    function handleSocialAction(data: CwSocialActionEvent) {
      onSocialAction?.(data)
    }

    function handleVideoInfoClick() {
      onVideoInfoClick?.(video)
    }

    function onUserKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleUserClick()
    }

    function onFollowKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      handleFollowClick()
    }

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        play,
        pause,
        seek: (time: number) => {
          videoPlayerRef.current?.seek(time)
        },
        setVolume: (volume: number) => {
          videoPlayerRef.current?.setVolume(volume)
        },
        getCurrentTime: () => videoPlayerRef.current?.getCurrentTime() || 0,
        getDuration: () => videoPlayerRef.current?.getDuration() || 0,
        getVideoElement: () => videoPlayerRef.current?.getVideoElement() ?? null,
      }),
      [],
    )

    return (
      <div className="relative w-full h-full bg-[var(--bg-color-page)] overflow-hidden">
        {/* 视频播放器 */}
        <div className="relative w-full h-full" onClick={togglePlayPause}>
          <CwVideoPlayer
            ref={videoPlayerRef}
            src={resolvedVideoSrc}
            {...mergedVideoConfig}
            className="w-full h-full"
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
          />

          {/* 暂停时显示的播放按钮 */}
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                className="w-16 h-16 text-[var(--text-color-anti)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5.14v13.72L19 12z" />
              </svg>
            </div>
          ) : null}
        </div>

        {/* 底部信息和交互区域 */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-between items-end px-4 pointer-events-none">
          {/* 视频信息区域 */}
          {showVideoInfo ? (
            <div className="flex-1 max-w-xs pointer-events-auto">
              {/* 视频信息 */}
              <div className="space-y-1">
                {video.title ? (
                  <p
                    className="text-[var(--text-color-anti)] text-sm leading-relaxed cursor-pointer hover:underline"
                    onClick={handleVideoInfoClick}
                  >
                    {video.title}
                  </p>
                ) : null}
                {video.description ? (
                  <p className="text-[var(--text-color-anti)] text-sm opacity-90 leading-relaxed line-clamp-2">
                    {video.description}
                  </p>
                ) : null}
                {video.tags && video.tags.length ? (
                  <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[var(--text-color-anti)] text-sm opacity-90 cursor-pointer hover:underline"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 右侧交互区域 */}
          {showUserInfo || (showSocialSidebar && socialActions) ? (
            <div className="flex flex-col items-center space-y-4 pointer-events-auto">
              {/* 用户头像 */}
              {showUserInfo ? (
                <div>
                  <div
                    role="button"
                    className="relative cursor-pointer outline-none"
                    tabIndex={0}
                    aria-label={user.nickname || user.username}
                    onClick={handleUserClick}
                    onKeyDown={onUserKeyDown}
                  >
                    <CwAvatar
                      {...mergedAvatarConfig}
                      src={user.avatar}
                      shape="circle"
                      size={2.5}
                    />
                    {!user.isFollowed ? (
                      <div
                        role="button"
                        tabIndex={0}
                        className="pointer-events-auto absolute bottom-[-4px] right-[-4px] flex h-[1.375rem] w-[1.375rem] cursor-pointer items-center justify-center rounded-full border-2 border-[var(--text-color-anti)] bg-[var(--brand-color-focus)] text-xs font-semibold leading-none text-[var(--text-color-anti)]"
                        aria-label="关注"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleFollowClick()
                        }}
                        onKeyDown={onFollowKeyDown}
                      >
                        +
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* 社交侧边栏 */}
              {showSocialSidebar && socialActions ? (
                <div className="mt-4">
                  <CwSocialSidebar actions={socialActions} onAction={handleSocialAction} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    )
  },
)

export default CwTikTokPlayer
