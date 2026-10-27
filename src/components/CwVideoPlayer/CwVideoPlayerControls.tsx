import type { MouseEvent as ReactMouseEvent } from 'react'
import { CwIcon } from '../CwIcon/CwIcon'
import type { CwVideoPlayerControlsProps } from './types'
import { videoPlayerBase } from '@zengchaowu/ui-shared/components/CwVideoPlayer/styles'

export function CwVideoPlayerControls({
  visible,
  isPlaying,
  currentTime,
  duration,
  volume,
  progress,
  fullscreen,
  isFullscreen,
  onTogglePlay,
  onToggleMute,
  onToggleFullscreen,
  onSeek,
  onVolumeChange,
}: CwVideoPlayerControlsProps) {
  function handleProgressClick(event: ReactMouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    onSeek?.(percent * duration)
  }

  function handleVolumeClick(event: ReactMouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    let percent = (event.clientX - rect.left) / rect.width

    // 限制音量范围在0-1之间
    percent = Math.max(0, Math.min(1, percent))

    onVolumeChange?.(percent)
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={[
        videoPlayerBase.controls,
        visible ? videoPlayerBase.controlsVisible : videoPlayerBase.controlsHidden,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 进度条 */}
      <div className={videoPlayerBase.progressBarContainer}>
        <div
          className={videoPlayerBase.progressBarTrack}
          onClick={handleProgressClick}
        >
          <div
            className={videoPlayerBase.progressFill}
            style={{ width: `${progress}%` }}
          >
            <div className={videoPlayerBase.progressThumb} />
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className={videoPlayerBase.controlsRow}>
        <div className={videoPlayerBase.controlsGroupLeft}>
          {/* 播放/暂停按钮 */}
          <div className={videoPlayerBase.playButton} onClick={onTogglePlay}>
            {!isPlaying ? (
              <CwIcon
                name="common--media--play-filled"
                prefix="icon"
                size={videoPlayerBase.playIconStyles?.size ?? 1}
                className={videoPlayerBase.playIconStyles?.class}
              />
            ) : (
              <CwIcon
                name="common--media--pause-filled"
                prefix="icon"
                size={videoPlayerBase.playIconStyles?.size ?? 1}
                className={videoPlayerBase.playIconStyles?.class}
              />
            )}
          </div>

          {/* 音量控制 */}
          <div className={videoPlayerBase.volumeGroup}>
            <div className={videoPlayerBase.volumeButton} onClick={onToggleMute}>
              {volume === 0 ? (
                <CwIcon
                  name="common--media--volume-mute-line"
                  prefix="icon"
                  size={videoPlayerBase.volumeIconStyles?.size ?? 1}
                  className={videoPlayerBase.volumeIconStyles?.class}
                />
              ) : volume < 0.5 ? (
                <CwIcon
                  name="common--media--volume-low-line"
                  prefix="icon"
                  size={videoPlayerBase.volumeIconStyles?.size ?? 1}
                  className={videoPlayerBase.volumeIconStyles?.class}
                />
              ) : (
                <CwIcon
                  name="common--media--volume-high-line"
                  prefix="icon"
                  size={videoPlayerBase.volumeIconStyles?.size ?? 1}
                  className={videoPlayerBase.volumeIconStyles?.class}
                />
              )}
            </div>
            <div className={videoPlayerBase.volumeSlider} onClick={handleVolumeClick}>
              <div
                className={videoPlayerBase.volumeSliderFill}
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>

          {/* 时间显示 */}
          <span className={videoPlayerBase.timeDisplay}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className={videoPlayerBase.controlsGroupRight}>
          {/* 全屏按钮 */}
          {fullscreen ? (
            <div
              className={videoPlayerBase.fullscreenButton}
              onClick={onToggleFullscreen}
            >
              {!isFullscreen ? (
                <CwIcon
                  name="common--media--fullscreen-enter-line"
                  prefix="icon"
                  size={videoPlayerBase.fullscreenIconStyles?.size ?? 1}
                  className={videoPlayerBase.fullscreenIconStyles?.class}
                />
              ) : (
                <CwIcon
                  name="common--media--fullscreen-exit-line"
                  prefix="icon"
                  size={videoPlayerBase.fullscreenIconStyles?.size ?? 1}
                  className={videoPlayerBase.fullscreenIconStyles?.class}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default CwVideoPlayerControls
