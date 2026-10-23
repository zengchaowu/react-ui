import type { PointerEvent as ReactPointerEvent } from 'react'
import { CwIcon } from '../CwIcon/CwIcon'
import type { CwMusicPlayerControlsProps } from './types'
import { musicPlayerBase } from './styles'
import { defaultTexts } from './texts'

export function CwMusicPlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  progress,
  loop,
  shuffleActive,
  showTransport,
  showVolume,
  hasPrev,
  hasNext,
  disabled,
  texts: textsProp,
  onTogglePlay,
  onToggleMute,
  onToggleLoop,
  onSeek,
  onVolumeChange,
  onPrev,
  onNext,
  onShuffle,
  onPlaylist,
}: CwMusicPlayerControlsProps) {
  const texts = { ...defaultTexts, ...(textsProp ?? {}) }

  function ratioFromPointer(event: ReactPointerEvent<HTMLDivElement>): number {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width <= 0) return 0
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  }

  function handleProgressPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (disabled) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    onSeek?.(ratioFromPointer(event) * duration)
  }

  function handleProgressPointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (disabled) return
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    onSeek?.(ratioFromPointer(event) * duration)
  }

  function handleProgressPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const el = event.currentTarget
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }
  }

  function handleVolumePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    onVolumeChange?.(ratioFromPointer(event))
  }

  function handleVolumePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    onVolumeChange?.(ratioFromPointer(event))
  }

  function handleVolumePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const el = event.currentTarget
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }
  }

  function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={musicPlayerBase.controls}>
      <div className={musicPlayerBase.progressBarContainer}>
        <span className={[musicPlayerBase.timeDisplay, 'text-left'].join(' ')}>
          {formatTime(currentTime)}
        </span>
        <div
          className={musicPlayerBase.progressBarTrack}
          onPointerDown={handleProgressPointerDown}
          onPointerMove={handleProgressPointerMove}
          onPointerUp={handleProgressPointerUp}
          onPointerCancel={handleProgressPointerUp}
        >
          <div
            className={musicPlayerBase.progressFill}
            style={{ width: `${progress}%` }}
          >
            <div className={musicPlayerBase.progressThumb} />
          </div>
        </div>
        <span className={[musicPlayerBase.timeDisplay, 'text-right'].join(' ')}>
          {formatTime(duration)}
        </span>
      </div>

      {showTransport ? (
        <div className={musicPlayerBase.transportRow}>
          <button
            type="button"
            className={[
              musicPlayerBase.transportButton,
              shuffleActive ? musicPlayerBase.transportButtonActive : '',
              disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            aria-label={texts.shuffle}
            aria-pressed={shuffleActive ? 'true' : 'false'}
            onClick={onShuffle}
          >
            <CwIcon
              name="common--media--shuffle-line"
              prefix="icon"
              size={musicPlayerBase.transportIconStyles?.size ?? 1}
              className={musicPlayerBase.transportIconStyles?.class}
            />
          </button>

          <button
            type="button"
            className={[
              musicPlayerBase.transportButton,
              !hasPrev || disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={!hasPrev || disabled}
            aria-label={texts.prev}
            onClick={onPrev}
          >
            <CwIcon
              name="common--media--skip-back-filled"
              prefix="icon"
              size={musicPlayerBase.transportIconStyles?.size ?? 1}
              className={musicPlayerBase.transportIconStyles?.class}
            />
          </button>

          <button
            type="button"
            className={[
              musicPlayerBase.transportPlayButton,
              disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            aria-label={isPlaying ? texts.pause : texts.play}
            onClick={onTogglePlay}
          >
            {!isPlaying ? (
              <CwIcon
                name="common--media--play-filled"
                prefix="icon"
                size={musicPlayerBase.transportPlayIconStyles?.size ?? 1}
                className={musicPlayerBase.transportPlayIconStyles?.class}
              />
            ) : (
              <CwIcon
                name="common--media--pause-filled"
                prefix="icon"
                size={musicPlayerBase.transportPlayIconStyles?.size ?? 1}
                className={musicPlayerBase.transportPlayIconStyles?.class}
              />
            )}
          </button>

          <button
            type="button"
            className={[
              musicPlayerBase.transportButton,
              !hasNext || disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={!hasNext || disabled}
            aria-label={texts.next}
            onClick={onNext}
          >
            <CwIcon
              name="common--media--skip-forward-filled"
              prefix="icon"
              size={musicPlayerBase.transportIconStyles?.size ?? 1}
              className={musicPlayerBase.transportIconStyles?.class}
            />
          </button>

          <button
            type="button"
            className={[
              musicPlayerBase.transportButton,
              loop ? musicPlayerBase.transportButtonActive : '',
              disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            aria-label={texts.repeat}
            aria-pressed={loop ? 'true' : 'false'}
            onClick={onToggleLoop}
          >
            <CwIcon
              name="common--media--repeat-line"
              prefix="icon"
              size={musicPlayerBase.transportIconStyles?.size ?? 1}
              className={musicPlayerBase.transportIconStyles?.class}
            />
          </button>

          <button
            type="button"
            className={[
              musicPlayerBase.transportButton,
              disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            aria-label={texts.playlist}
            onClick={onPlaylist}
          >
            <CwIcon
              name="common--action--menu-line"
              prefix="icon"
              size={musicPlayerBase.transportIconStyles?.size ?? 1}
              className={musicPlayerBase.transportIconStyles?.class}
            />
          </button>
        </div>
      ) : (
        <div className={musicPlayerBase.transportRow}>
          <button
            type="button"
            className={[
              musicPlayerBase.transportPlayButton,
              disabled ? musicPlayerBase.transportButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            aria-label={isPlaying ? texts.pause : texts.play}
            onClick={onTogglePlay}
          >
            {!isPlaying ? (
              <CwIcon
                name="common--media--play-filled"
                prefix="icon"
                size={musicPlayerBase.transportPlayIconStyles?.size ?? 1}
                className={musicPlayerBase.transportPlayIconStyles?.class}
              />
            ) : (
              <CwIcon
                name="common--media--pause-filled"
                prefix="icon"
                size={musicPlayerBase.transportPlayIconStyles?.size ?? 1}
                className={musicPlayerBase.transportPlayIconStyles?.class}
              />
            )}
          </button>
        </div>
      )}

      {showVolume ? (
        <div className={musicPlayerBase.volumeRow}>
          <button
            type="button"
            className={musicPlayerBase.volumeButton}
            aria-label={volume === 0 ? texts.unmute : texts.mute}
            onClick={onToggleMute}
          >
            {volume === 0 ? (
              <CwIcon
                name="common--media--volume-mute-line"
                prefix="icon"
                size={musicPlayerBase.volumeIconStyles?.size ?? 1}
                className={musicPlayerBase.volumeIconStyles?.class}
              />
            ) : volume < 0.5 ? (
              <CwIcon
                name="common--media--volume-low-line"
                prefix="icon"
                size={musicPlayerBase.volumeIconStyles?.size ?? 1}
                className={musicPlayerBase.volumeIconStyles?.class}
              />
            ) : (
              <CwIcon
                name="common--media--volume-high-line"
                prefix="icon"
                size={musicPlayerBase.volumeIconStyles?.size ?? 1}
                className={musicPlayerBase.volumeIconStyles?.class}
              />
            )}
          </button>
          <div className={musicPlayerBase.volumeGroup}>
            <div
              className={musicPlayerBase.volumeSlider}
              onPointerDown={handleVolumePointerDown}
              onPointerMove={handleVolumePointerMove}
              onPointerUp={handleVolumePointerUp}
              onPointerCancel={handleVolumePointerUp}
            >
              <div
                className={musicPlayerBase.volumeSliderFill}
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CwMusicPlayerControls
