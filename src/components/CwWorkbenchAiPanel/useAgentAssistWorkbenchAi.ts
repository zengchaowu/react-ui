import { useEffect, useMemo, useRef, useState } from 'react'
import { materializeImRichHtmlToPlainText } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { defaultCwWorkbenchAiPanelTexts } from './texts'
import type { CwWorkbenchAiMessage } from './types'
import { newWorkbenchAiMessageId } from './functions/workbenchAiChatHistory'
import { workbenchAiMessagesToChatList } from './functions/workbenchAiMessagesToChatList'

export type AgentAssistAiConfig = {
  configured: boolean
  agent: {
    displayName?: string | null
    enabled?: boolean
  } | null
}

export type AgentAssistAiStreamParams = {
  prompt: string
  selectionContext: string
  phase?: 'plan' | 'execute' | 'oneshot'
  onDelta: (text: string) => void
  onProposal?: (proposal: unknown) => void
  onDomain?: (type: string, payload: unknown) => void
  signal?: AbortSignal
}

export type AgentAssistAiStreamResult =
  | { ok: true }
  | { ok: false; error: string }

export type UseAgentAssistWorkbenchAiOptions = {
  getAuthToken: () => string | null | undefined
  fetchConfig: () => Promise<AgentAssistAiConfig>
  streamChat: (
    params: AgentAssistAiStreamParams,
  ) => Promise<AgentAssistAiStreamResult>
  /** Selection / document context JSON at send time */
  buildSelectionContext: () => string | Promise<string>
  hasSelectionContext?: boolean
  selectedCount?: number
  materializePromptHtml?: (html: string) => string
  notConfiguredError?: string
  assistantFallbackName?: string
  streamPhase?: 'plan' | 'execute' | 'oneshot'
  onProposal?: (proposal: unknown) => void
}

const DEFAULT_NOT_CONFIGURED =
  '尚未配置工作台助手：请管理员在后台绑定并启用对应 Agent'

/**
 * L2 Agent Assist workbench panel state machine (config, stream, history, panel open).
 * Apps inject auth/config/stream and domain `buildSelectionContext`.
 * （React hook 版，等价 vue-ui 同名 composable）
 */
export function useAgentAssistWorkbenchAi(
  options: UseAgentAssistWorkbenchAiOptions,
) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const notConfiguredError =
    options.notConfiguredError ?? DEFAULT_NOT_CONFIGURED
  const streamPhase = options.streamPhase ?? 'oneshot'

  const [assistantConfig, setAssistantConfig] =
    useState<AgentAssistAiConfig | null>(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [messages, setMessages] = useState<CwWorkbenchAiMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const abortCtlRef = useRef<AbortController | null>(null)
  const activeAssistantIdRef = useRef<string | null>(null)
  const streamingRef = useRef(streaming)
  streamingRef.current = streaming
  const assistantConfigRef = useRef(assistantConfig)
  assistantConfigRef.current = assistantConfig

  async function refreshConfig() {
    if (!optionsRef.current.getAuthToken()) {
      setAssistantConfig(null)
      return
    }
    try {
      setAssistantConfig(await optionsRef.current.fetchConfig())
    } catch {
      setAssistantConfig({ configured: false, agent: null })
    }
  }

  const aiAssistantEnabled = Boolean(options.getAuthToken())

  const aiAssistantReady = (() => {
    const cfg = assistantConfig
    const agent = cfg?.agent
    return (
      Boolean(cfg?.configured) &&
      Boolean(agent) &&
      agent?.enabled !== false
    )
  })()

  const agentDisplayName = (() => {
    const name = assistantConfig?.agent?.displayName?.trim()
    return (
      name ||
      options.assistantFallbackName ||
      defaultCwWorkbenchAiPanelTexts.assistantFallbackName
    )
  })()

  const showAssistantPanel = aiAssistantEnabled && aiPanelOpen

  const hasSelectionContext = Boolean(options.hasSelectionContext ?? false)

  const selectedCount = Number(options.selectedCount ?? 0) || 0

  const chatListMessages = useMemo(
    () => workbenchAiMessagesToChatList(messages, agentDisplayName),
    [messages, agentDisplayName],
  )

  function abortStream() {
    abortCtlRef.current?.abort()
    abortCtlRef.current = null
  }

  function patchAssistant(
    id: string,
    patch: Partial<
      Pick<
        CwWorkbenchAiMessage,
        'text' | 'status' | 'error' | 'knowledgeSources'
      >
    >,
  ) {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx < 0) return prev
      const next = prev.slice()
      next[idx] = { ...next[idx]!, ...patch }
      return next
    })
  }

  function parseKnowledgeSourcesFromDomain(
    payload: unknown,
  ): CwWorkbenchAiMessage['knowledgeSources'] {
    if (!payload || typeof payload !== 'object') return undefined
    const raw = (payload as { sources?: unknown }).sources
    if (!Array.isArray(raw) || raw.length === 0) return undefined
    const out: NonNullable<CwWorkbenchAiMessage['knowledgeSources']> = []
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const row = item as Record<string, unknown>
      const documentId = String(row.documentId ?? '').trim()
      if (!documentId) continue
      const title = String(row.title ?? '').trim() || '文档'
      const score =
        typeof row.score === 'number' ? row.score : Number(row.score)
      const snippet = String(row.snippet ?? '').trim()
      const collectionId = String(row.collectionId ?? '').trim()
      out.push({
        documentId,
        title,
        score: Number.isFinite(score) ? score : 0,
        snippet,
        ...(collectionId ? { collectionId } : {}),
      })
    }
    return out.length > 0 ? out : undefined
  }

  function closeAiPanel() {
    abortStream()
    setStreaming(false)
    setAiPanelOpen(false)
  }

  function toggleAiPanel() {
    if (!aiAssistantEnabled) return
    if (aiPanelOpen) {
      closeAiPanel()
      return
    }
    setAiPanelOpen(true)
  }

  function clearChat() {
    abortStream()
    setStreaming(false)
    activeAssistantIdRef.current = null
    setMessages([])
    setErrMsg('')
  }

  function stopStream() {
    abortStream()
    if (activeAssistantIdRef.current) {
      patchAssistant(activeAssistantIdRef.current, { status: 'stopped' })
    }
    setStreaming(false)
    activeAssistantIdRef.current = null
  }

  async function sendPrompt(prompt: string) {
    const text = prompt.trim()
    if (!text || streamingRef.current) return

    const cfg = assistantConfigRef.current
    const agent = cfg?.agent
    const ready =
      Boolean(cfg?.configured) && Boolean(agent) && agent?.enabled !== false
    if (!ready) {
      setErrMsg(notConfiguredError)
      return
    }

    const userMsg: CwWorkbenchAiMessage = {
      id: newWorkbenchAiMessageId('u'),
      role: 'user',
      text,
      status: 'done',
      at: new Date(),
    }
    const assistantId = newWorkbenchAiMessageId('a')
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantId,
        role: 'assistant',
        text: '',
        status: 'streaming',
        at: new Date(),
      },
    ])

    const selectionContext = await optionsRef.current.buildSelectionContext()
    abortStream()
    abortCtlRef.current = new AbortController()
    activeAssistantIdRef.current = assistantId
    setStreaming(true)
    let acc = ''

    try {
      const result = await optionsRef.current.streamChat({
        prompt: text,
        selectionContext,
        phase: streamPhase,
        signal: abortCtlRef.current.signal,
        onDelta: (t) => {
          acc += t
          patchAssistant(assistantId, { text: acc, status: 'streaming' })
        },
        onProposal: optionsRef.current.onProposal,
        onDomain: (type, payload) => {
          if (type !== 'knowledge_sources') return
          const sources = parseKnowledgeSourcesFromDomain(payload)
          if (sources?.length) {
            patchAssistant(assistantId, { knowledgeSources: sources })
          }
        },
      })
      if (!result.ok) {
        const stopped = result.error === '已停止'
        patchAssistant(assistantId, {
          text: acc,
          status: stopped ? 'stopped' : 'error',
          error: stopped ? undefined : result.error || '请求失败',
        })
        if (!stopped) setErrMsg(result.error || '请求失败')
        return
      }
      patchAssistant(assistantId, { text: acc, status: 'done' })
      setErrMsg('')
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        patchAssistant(assistantId, { text: acc, status: 'stopped' })
        return
      }
      const msg = (e as Error)?.message || '请求失败'
      patchAssistant(assistantId, { text: acc, status: 'error', error: msg })
      setErrMsg(msg)
    } finally {
      setStreaming(false)
      abortCtlRef.current = null
      if (activeAssistantIdRef.current === assistantId) {
        activeAssistantIdRef.current = null
      }
    }
  }

  function onComposerSubmit(payload: { html: string; files: File[] }) {
    const materialize =
      optionsRef.current.materializePromptHtml ??
      materializeImRichHtmlToPlainText
    void sendPrompt(materialize(payload.html))
  }

  useEffect(() => {
    void refreshConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      abortCtlRef.current?.abort()
      abortCtlRef.current = null
    }
  }, [])

  return {
    assistantConfig,
    messages,
    aiAssistantEnabled,
    aiAssistantReady,
    showAssistantPanel,
    agentDisplayName,
    hasSelectionContext,
    selectedCount,
    chatListMessages,
    busy: streaming,
    errMsg,
    refreshConfig,
    toggleAiPanel,
    closeAiPanel,
    clearChat,
    stopStream,
    sendPrompt,
    onComposerSubmit,
  }
}
