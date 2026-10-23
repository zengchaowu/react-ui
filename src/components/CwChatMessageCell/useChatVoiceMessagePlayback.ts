import { useSyncExternalStore } from 'react'

/** 当前正在播放的 Audio 元素（全局只保留一个，切换时先停掉上一个） */
let activeAudio: HTMLAudioElement | null = null
let activeMessageId: string | null = null
let activeBackend: 'html' | 'driver' | null = null

/** 正在播放的消息 id（响应式，驱动气泡里的动效） */
let playingMessageId: string | null = null

const listeners = new Set<() => void>()

function emitPlaybackChange() {
  listeners.forEach((listener) => listener())
}

function subscribePlayback(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 已播放过的消息 id（用于未读圆点） */
const playedMessageIds = new Set<string>()

export type ChatVoicePlaybackToggleResult = {
  result: 'ok' | 'blocked' | 'media-error' | 'invalid'
  detail: string
}

/**
 * 原生播放驱动。uni 壳等 WebView 对 ADTS AAC 支持不完整，
 * HTMLAudio 失败时由壳侧原生播放器（MediaPlayer / createInnerAudioContext）兜底。
 * play 在播放真正开始后 resolve；onEnded/onError 负责复位播放状态。
 */
export type ChatVoicePlaybackDriver = {
  play: (
    url: string,
    events: { onEnded: () => void; onError: (error: Error) => void },
  ) => Promise<void>
  stop: () => void
}

let externalDriver: ChatVoicePlaybackDriver | null = null

export function registerChatVoicePlaybackDriver(
  driver: ChatVoicePlaybackDriver | null,
): void {
  externalDriver = driver
}

function setPlayingMessageId(id: string | null) {
  if (playingMessageId === id) return
  playingMessageId = id
  emitPlaybackChange()
}

function stopActivePlayback() {
  if (activeBackend === 'driver') {
    try {
      externalDriver?.stop()
    } catch {
      /* ignore */
    }
  }
  if (activeAudio) {
    try {
      activeAudio.pause()
      activeAudio.src = ''
    } catch {
      /* ignore */
    }
  }
  activeAudio = null
  activeMessageId = null
  activeBackend = null
  setPlayingMessageId(null)
}

function markPlayed(id: string) {
  playedMessageIds.add(id)
}

function playWithHtmlAudio(
  id: string,
  url: string,
): Promise<ChatVoicePlaybackToggleResult> {
  const audio = new Audio(url)
  activeAudio = audio
  activeMessageId = id
  activeBackend = 'html'
  setPlayingMessageId(id)

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: 'ok' | 'blocked' | 'media-error', detail: string) => {
      if (settled) return
      settled = true
      resolve({ result, detail })
    }

    audio.onended = () => {
      if (activeMessageId === id) stopActivePlayback()
    }
    audio.onerror = () => {
      const mediaError = audio.error
      if (activeMessageId === id) stopActivePlayback()
      finish(
        'media-error',
        mediaError
          ? `MediaError code=${mediaError.code} ${mediaError.message || ''}`.trim()
          : 'error',
      )
    }

    void audio.play().then(
      () => finish('ok', ''),
      (error: unknown) => {
        stopActivePlayback()
        const name = error instanceof DOMException ? error.name : ''
        const detail = name || String(error ?? 'play rejected')
        finish(name === 'NotAllowedError' ? 'blocked' : 'media-error', detail)
      },
    )

    // play() 在某些 WebView 上会因解码卡住而始终不 settle，超时后让原生驱动兜底
    setTimeout(() => {
      if (settled) return
      stopActivePlayback()
      finish('media-error', 'play timeout')
    }, 8000)
  })
}

function playWithDriver(
  id: string,
  url: string,
): Promise<ChatVoicePlaybackToggleResult> {
  const driver = externalDriver
  if (!driver) return Promise.resolve({ result: 'invalid', detail: 'no driver' })
  activeAudio = null
  activeMessageId = id
  activeBackend = 'driver'
  setPlayingMessageId(id)

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: 'ok' | 'media-error', detail: string) => {
      if (settled) return
      settled = true
      resolve({ result, detail })
    }
    driver
      .play(url, {
        onEnded: () => {
          if (activeMessageId === id && activeBackend === 'driver') {
            stopActivePlayback()
          }
        },
        onError: (error) => {
          if (activeMessageId === id && activeBackend === 'driver') {
            stopActivePlayback()
          }
          finish('media-error', error.message || 'driver error')
        },
      })
      .then(
        () => finish('ok', ''),
        (error: unknown) => {
          stopActivePlayback()
          finish(
            'media-error',
            error instanceof Error ? error.message : String(error),
          )
        },
      )
  })
}

async function toggleChatVoicePlayback(
  messageId: string,
  audioUrl: string,
): Promise<ChatVoicePlaybackToggleResult> {
  const id = messageId.trim()
  const url = audioUrl.trim()
  if (!id || !url) return { result: 'invalid', detail: '' }

  if (
    activeMessageId === id &&
    (activeBackend === 'driver' || (activeAudio != null && !activeAudio.paused))
  ) {
    stopActivePlayback()
    return { result: 'ok', detail: '' }
  }

  stopActivePlayback()
  markPlayed(id)

  const htmlResult = await playWithHtmlAudio(id, url)
  if (htmlResult.result === 'ok' || !externalDriver) return htmlResult

  const driverResult = await playWithDriver(id, url)
  if (driverResult.result === 'ok') return driverResult
  return {
    result: driverResult.result,
    detail: `${htmlResult.detail}; driver: ${driverResult.detail}`,
  }
}

export function useChatVoiceMessagePlayback() {
  const playingId = useSyncExternalStore(
    subscribePlayback,
    () => playingMessageId,
    () => playingMessageId,
  )

  function isPlaying(messageId: string): boolean {
    return playingId === messageId
  }

  function isPlayed(messageId: string): boolean {
    return playedMessageIds.has(messageId)
  }

  /**
   * 切换播放；返回结果供调用方提示。
   * - blocked：play() 被自动播放策略拒绝（NotAllowedError）
   * - media-error：资源无法加载/解码（含 NotSupportedError），detail 带错误名
   * HTMLAudio 失败且注册了原生驱动时自动走原生兜底。
   */
  const toggle = toggleChatVoicePlayback

  function stop() {
    stopActivePlayback()
  }

  return { playingMessageId: playingId, isPlaying, isPlayed, toggle, stop }
}
