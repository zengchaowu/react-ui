import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CwMusicPlayerExpose, CwMusicPlayerProps } from './types'
import { CwMusicPlayerControls } from './CwMusicPlayerControls'
import { CwIcon } from '../CwIcon/CwIcon'
import { musicPlayerBase } from './styles'
import { defaultTexts } from './texts'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'

export const CwMusicPlayer = forwardRef<CwMusicPlayerExpose, CwMusicPlayerProps>(
  function CwMusicPlayer(
    {
      src,
      title,
      artist,
      cover,
      lyrics,
      controls = true,
      autoplay = false,
      loop = false,
      shuffleActive = false,
      preload = 'metadata',
      volume = 1,
      showCover = true,
      showLyrics = false,
      showTransport = true,
      showVolume = true,
      hasPrev = true,
      hasNext = true,
      disabled = false,
      texts: textsProp,
      className,
      onLoadedMetadata,
      onTimeUpdate,
      onPlay,
      onPause,
      onEnded,
      onVolumeChange,
      onPrev,
      onNext,
      onShuffle,
      onPlaylist,
      onError,
      ...rest
    },
    ref,
  ) {
    const texts = { ...defaultTexts, ...(textsProp ?? {}) }

    const displayTitle = title?.trim() || texts.unknownTitle
    const displayArtist = artist?.trim() || ''

    const tabIndex = disabled ? undefined : 0

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentVolume, setCurrentVolume] = useState(volume)
    const [loading, setLoading] = useState(true)
    const [loopEnabled, setLoopEnabled] = useState(loop)
    const lastVolumeRef = useRef(volume)

    const {
      isFocusVisible,
      handleFocus: handleFocusVisibleFocus,
      handleBlur: handleFocusVisibleBlur,
    } = useBrowserFocusVisible()

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    function handleFocus() {
      if (disabled) return
      handleFocusVisibleFocus()
    }

    function handleBlur() {
      handleFocusVisibleBlur()
    }

    function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
      if (disabled || !audioRef.current) return

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          event.preventDefault()
          handleSeek(Math.max(0, currentTime - 5))
          break
        case 'ArrowRight':
          event.preventDefault()
          handleSeek(Math.min(duration, currentTime + 5))
          break
        case 'ArrowUp':
          event.preventDefault()
          handleVolumeChangeFromControls(Math.min(1, currentVolume + 0.1))
          break
        case 'ArrowDown':
          event.preventDefault()
          handleVolumeChangeFromControls(Math.max(0, currentVolume - 0.1))
          break
        case 'm':
        case 'M':
          event.preventDefault()
          toggleMute()
          break
      }
    }

    function togglePlay() {
      const audio = audioRef.current
      if (!audio || disabled) return
      if (isPlaying) {
        audio.pause()
      } else {
        void audio.play().catch(() => {
          onError?.(texts.error)
        })
      }
    }

    function toggleMute() {
      const audio = audioRef.current
      if (!audio || disabled) return
      const isMuted = audio.muted || audio.volume === 0
      if (isMuted) {
        audio.muted = false
        if (audio.volume === 0) {
          audio.volume = lastVolumeRef.current
        }
      } else {
        if (audio.volume > 0) {
          lastVolumeRef.current = audio.volume
        }
        audio.muted = true
      }
    }

    function toggleLoop() {
      if (disabled) return
      const nextLoop = !loopEnabled
      setLoopEnabled(nextLoop)
      if (audioRef.current) {
        audioRef.current.loop = nextLoop
      }
    }

    function handleSeek(time: number) {
      const audio = audioRef.current
      if (!audio || disabled) return
      audio.currentTime = time
      setCurrentTime(time)
    }

    function handleVolumeChangeFromControls(nextVolume: number) {
      const audio = audioRef.current
      if (!audio || disabled) return
      audio.muted = false
      audio.volume = nextVolume
      setCurrentVolume(nextVolume)
      lastVolumeRef.current = nextVolume
    }

    function handleLoadedMetadata() {
      const audio = audioRef.current
      if (!audio) return
      const nextDuration = audio.duration
      setDuration(nextDuration)
      setLoading(false)
      onLoadedMetadata?.({ duration: nextDuration })
    }

    function handleTimeUpdate() {
      const audio = audioRef.current
      if (!audio) return
      setCurrentTime(audio.currentTime)
      onTimeUpdate?.(audio.currentTime)
    }

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

    function handleVolumeChange() {
      const audio = audioRef.current
      if (!audio) return
      const displayVolume = audio.muted ? 0 : audio.volume
      setCurrentVolume(displayVolume)
      if (!audio.muted && audio.volume > 0) {
        lastVolumeRef.current = audio.volume
      }
      onVolumeChange?.(displayVolume)
    }

    function handleError() {
      setLoading(false)
      onError?.(texts.error)
    }

    useEffect(() => {
      setLoading(true)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
    }, [src])

    useEffect(() => {
      setLoopEnabled(loop)
      if (audioRef.current) {
        audioRef.current.loop = loop
      }
    }, [loop])

    useEffect(() => {
      const audio = audioRef.current
      if (audio) {
        audio.volume = volume
        audio.loop = loop
        setCurrentVolume(volume)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        play: () => audioRef.current?.play(),
        pause: () => audioRef.current?.pause(),
        seek: (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time
          }
        },
        setVolume: (nextVolume: number) => {
          if (audioRef.current) {
            audioRef.current.volume = nextVolume
            setCurrentVolume(nextVolume)
          }
        },
        getCurrentTime: () => currentTime,
        getDuration: () => duration,
        getAudioElement: () => audioRef.current,
      }),
      [currentTime, duration],
    )

    return (
      <div
        {...rest}
        className={[
          musicPlayerBase.container,
          isFocusVisible && !disabled ? musicPlayerBase.containerFocused : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        tabIndex={tabIndex}
        role="application"
        aria-label={texts.player}
        aria-disabled={disabled ? 'true' : 'false'}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <audio
          ref={audioRef}
          className="sr-only"
          src={src}
          loop={loopEnabled}
          autoPlay={autoplay}
          preload={preload}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          onVolumeChange={handleVolumeChange}
          onError={handleError}
        />

        {showCover ? (
          <div className={musicPlayerBase.coverWrap} onClick={togglePlay}>
            {cover ? (
              <img
                src={cover}
                alt={displayTitle}
                className={musicPlayerBase.cover}
              />
            ) : (
              <div className={musicPlayerBase.coverPlaceholder}>
                <CwIcon
                  name="common--media--headphone-line"
                  prefix="icon"
                  size={musicPlayerBase.playButtonIconStyles?.size ?? 1}
                  className={musicPlayerBase.playButtonIconStyles?.class}
                />
              </div>
            )}

            {loading ? (
              <div className={musicPlayerBase.overlayLoading}>
                <CwIcon
                  name="common--status--loading-line"
                  prefix="icon"
                  spin
                  size={musicPlayerBase.loadingIconStyles?.size ?? 1}
                  className={musicPlayerBase.loadingIconStyles?.class}
                />
              </div>
            ) : !isPlaying && !autoplay ? (
              <div className={musicPlayerBase.overlayPlayButton}>
                <div className={musicPlayerBase.playButtonLarge}>
                  <CwIcon
                    name="common--media--play-filled"
                    prefix="icon"
                    size={musicPlayerBase.playButtonIconStyles?.size ?? 1}
                    className={musicPlayerBase.playButtonIconStyles?.class}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={musicPlayerBase.meta}>
          <p className={musicPlayerBase.title}>{displayTitle}</p>
          {displayArtist ? (
            <p className={musicPlayerBase.artist}>{displayArtist}</p>
          ) : null}
        </div>

        {showLyrics && lyrics?.trim() ? (
          <div className={musicPlayerBase.lyricsWrap}>
            <p className={musicPlayerBase.lyrics}>{lyrics}</p>
          </div>
        ) : null}

        {controls ? (
          <CwMusicPlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={currentVolume}
            progress={progress}
            loop={loopEnabled}
            shuffleActive={shuffleActive}
            showTransport={showTransport}
            showVolume={showVolume}
            hasPrev={hasPrev}
            hasNext={hasNext}
            disabled={disabled}
            texts={texts}
            onTogglePlay={togglePlay}
            onToggleMute={toggleMute}
            onToggleLoop={toggleLoop}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChangeFromControls}
            onPrev={onPrev}
            onNext={onNext}
            onShuffle={onShuffle}
            onPlaylist={onPlaylist}
          />
        ) : null}
      </div>
    )
  },
)

export default CwMusicPlayer
