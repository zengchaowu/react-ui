import { useEffect } from 'react'
import { useReactiveComputed, useReactiveRef, useStableBox, type ReactiveRef } from './reactivity'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import { extractDesignPlanFromAiResponse } from '@zengchaowu/shared/design-document/designPlan'
import type { FabricDesignPlanV1 } from '@zengchaowu/shared/design-document/designPlan'
import { extractDesignDocumentFromAiResponse } from '../document/fabricDesignDocument.pure'
import type { FabricDesignDocumentV1 } from '../document/fabricDesignDocument.types'
import type {
  FabricDesignEditorEmitFn,
  TpFabricDesignEditorAiOptions,
  TpFabricDesignEditorAiStreamPhase,
  TpFabricDesignEditorProps,
} from '../types'

export type DesignAiChatMessageStatus =
  | 'streaming'
  | 'done'
  | 'error'
  | 'applied'
  | 'stopped'
  | 'plan'

export type DesignAiChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  status?: DesignAiChatMessageStatus
  error?: string
  at: Date
}

export type DesignAiPlanTodoStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'error'
  | 'skipped'

export type DesignAiPlanTodoView = {
  id: string
  content: string
  status: DesignAiPlanTodoStatus
  error?: string
}

export type DesignAiActivePlan = {
  title: string
  /** 触发本计划的用户原文 */
  userGoal: string
  todos: DesignAiPlanTodoView[]
  /** 已落稿组件名，避免子任务重复 */
  appliedNames: string[]
}

const DESIGN_AI_USER_ID = 'design-ai-user'
const DESIGN_AI_ASSISTANT_ID = 'design-ai-assistant'

/** 侧栏头像占位（不依赖外部资源） */
export const DESIGN_AI_AVATAR_FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="%23D1D5DB"/></svg>',
  )

const COMPLEX_PLAN_HINT =
  /组件库|设计系统|多页面|多屏|一套|多个组件|一整套|系列组件|先做计划|先出计划/i

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/** Composer 提交的 HTML → 纯文本 */
export function designAiHtmlToPlainText(html: string): string {
  const withBreaks = String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
  const stripped = withBreaks.replace(/<[^>]+>/g, '')
  return stripped
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\u200b/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** 无选区且像复杂任务时走 Plan 模式 */
export function shouldUseDesignAiPlanMode(
  prompt: string,
  hasSelection: boolean,
): boolean {
  if (hasSelection) return false
  return COMPLEX_PLAN_HINT.test(prompt)
}

function formatPlanMessageText(plan: FabricDesignPlanV1): string {
  const lines = plan.todos.map((t, i) => `${i + 1}. ${t.content}`)
  return `计划：${plan.title}\n\n${lines.join('\n')}\n\n确认后点击下方「开始执行」。`
}

function collectRootNames(doc: FabricDesignDocumentV1): string[] {
  return (doc.roots ?? [])
    .map((r) => String(r.name ?? '').trim())
    .filter(Boolean)
}

export function designAiMessagesToChatList(
  messages: DesignAiChatMessage[],
  agentDisplayName: string,
): ChatMessage[] {
  return messages.map((m) => {
    let content = m.text
    if (m.status === 'streaming' && !content.trim()) {
      content = '…'
    }
    if (m.status === 'plan') {
      content = m.text
    } else if (m.status === 'applied') {
      content = m.text.trim()
        ? `✓ ${m.text.trim()}`
        : '✓ 已应用到画布'
    } else if (m.status === 'stopped') {
      content = content.trim()
        ? `${content}\n\n（已停止）`
        : '（已停止）'
    } else if (m.status === 'error' && m.error) {
      content = content.trim()
        ? `${content}\n\n⚠ ${m.error}`
        : `⚠ ${m.error}`
    }
    const isUser = m.role === 'user'
    return {
      id: m.id,
      type: 'text' as const,
      content,
      timestamp: m.at,
      sender: isUser
        ? { id: DESIGN_AI_USER_ID, name: '我' }
        : {
            id: DESIGN_AI_ASSISTANT_ID,
            name: agentDisplayName || 'AI 助手',
            avatar: DESIGN_AI_AVATAR_FALLBACK_SRC,
          },
      isOwn: isUser,
      status: m.status === 'streaming' ? 'sending' : 'sent',
    }
  })
}

export function useFabricDesignEditorAiPanel(options: {
  getProps: () => Pick<TpFabricDesignEditorProps, 'readonly' | 'designAi'>
  getSelectionContextJson: () => string
  hasSelection: () => boolean
  applyDesignDocument: (
    doc: FabricDesignDocumentV1,
    opts?: { replace?: boolean },
  ) => void
  replaceSelectionWithDesignDocument: (doc: FabricDesignDocumentV1) => void
  emit: FabricDesignEditorEmitFn
}) {
  const aiPanelOpen = useReactiveRef(false)
  const messages = useReactiveRef<DesignAiChatMessage[]>([]) as ReactiveRef<DesignAiChatMessage[]>
  const streaming = useReactiveRef(false)
  const executingPlan = useReactiveRef(false)
  const errMsg = useReactiveRef('')
  const activePlan = useReactiveRef<DesignAiActivePlan | null>(null)
  const streamState = useStableBox(() => ({
    abortCtl: null as AbortController | null,
    activeAssistantId: null as string | null,
    stopRequested: false,
  }))

  const aiAssistantEnabled = useReactiveComputed(() => {
    return Boolean(
      !options.getProps().readonly && options.getProps().designAi != null,
    )
  })

  const aiAssistantReady = useReactiveComputed(() => {
    const opt = options.getProps().designAi
    return Boolean(opt?.enabled && typeof opt.stream === 'function')
  })

  const agentDisplayName = useReactiveComputed(() => {
    const name = options.getProps().designAi?.agentDisplayName?.trim()
    return name || 'AI 助手'
  })

  const showAssistantPanel = useReactiveComputed(
    () => aiAssistantEnabled.value && aiPanelOpen.value,
  )

  const hasSelectionContext = useReactiveComputed(() => options.hasSelection())

  const chatListMessages = useReactiveComputed(() =>
    designAiMessagesToChatList(messages.value, agentDisplayName.value),
  )

  const planAwaitingStart = useReactiveComputed(() => {
    const p = activePlan.value
    if (!p || executingPlan.value || streaming.value) return false
    return p.todos.some((t) => t.status === 'pending')
  })

  const busy = useReactiveComputed(() => streaming.value || executingPlan.value)

  function abortStream() {
    streamState.value.abortCtl?.abort()
    streamState.value.abortCtl = null
  }

  function patchAssistant(
    id: string,
    patch: Partial<Pick<DesignAiChatMessage, 'text' | 'status' | 'error'>>,
  ) {
    const idx = messages.value.findIndex((m) => m.id === id)
    if (idx < 0) return
    const cur = messages.value[idx]!
    // React：不可变更新以触发重渲染（Vue Proxy 支持按下标原位赋值）
    const nextList = messages.value.slice()
    nextList[idx] = { ...cur, ...patch }
    messages.value = nextList
  }

  function closeAiPanel() {
    streamState.value.stopRequested = true
    abortStream()
    streaming.value = false
    executingPlan.value = false
    aiPanelOpen.value = false
  }

  function toggleAiPanel() {
    if (!aiAssistantEnabled.value) return
    if (aiPanelOpen.value) {
      closeAiPanel()
      return
    }
    aiPanelOpen.value = true
  }

  function openAiPanel() {
    if (!aiAssistantEnabled.value) return
    aiPanelOpen.value = true
  }

  function clearChat() {
    streamState.value.stopRequested = true
    abortStream()
    streaming.value = false
    executingPlan.value = false
    streamState.value.activeAssistantId = null
    activePlan.value = null
    messages.value = []
    errMsg.value = ''
  }

  function stopStream() {
    streamState.value.stopRequested = true
    abortStream()
    if (streamState.value.activeAssistantId) {
      patchAssistant(streamState.value.activeAssistantId, { status: 'stopped' })
    }
    if (activePlan.value) {
      activePlan.value = {
        ...activePlan.value,
        todos: activePlan.value.todos.map((t) =>
          t.status === 'running' || t.status === 'pending'
            ? { ...t, status: t.status === 'running' ? 'error' : 'skipped', error: t.status === 'running' ? '已停止' : undefined }
            : t,
        ),
      }
    }
    streaming.value = false
    executingPlan.value = false
    streamState.value.activeAssistantId = null
  }

  function applyDesignDocFromResponse(
    acc: string,
    mode: 'create' | 'edit',
  ):
    | { ok: true; doc: FabricDesignDocumentV1 }
    | { ok: false; error: string } {
    const docResult = extractDesignDocumentFromAiResponse(acc)
    if (!docResult.ok) {
      return {
        ok: false,
        error: docResult.error || '未能解析 Design Document JSON',
      }
    }
    if (mode === 'edit') {
      options.replaceSelectionWithDesignDocument(docResult.doc)
    } else {
      options.applyDesignDocument(docResult.doc, { replace: false })
    }
    return { ok: true, doc: docResult.doc }
  }

  async function runStream(params: {
    prompt: string
    phase: TpFabricDesignEditorAiStreamPhase
    mode: 'create' | 'edit'
    assistantId: string
  }): Promise<{ ok: true; acc: string } | { ok: false; error: string; acc: string }> {
    const opt = options.getProps().designAi
    const stream = opt?.stream as
      | TpFabricDesignEditorAiOptions['stream']
      | undefined
    if (!opt?.enabled || typeof stream !== 'function') {
      return {
        ok: false,
        error:
          '尚未配置设计画布助手：请管理员在后台「设计画布助手」绑定并启用 Agent',
        acc: '',
      }
    }

    const selectionContext = options.getSelectionContextJson()?.trim() ?? ''
    abortStream()
    streamState.value.abortCtl = new AbortController()
    streamState.value.activeAssistantId = params.assistantId
    streaming.value = true
    let acc = ''

    try {
      const result = await stream({
        prompt: params.prompt,
        selectionContext,
        mode: params.mode,
        phase: params.phase,
        signal: streamState.value.abortCtl.signal,
        onDelta: (t) => {
          acc += t
          patchAssistant(params.assistantId, { text: acc, status: 'streaming' })
        },
      })
      if (!result.ok) {
        return { ok: false, error: result.error || '请求失败', acc }
      }
      return { ok: true, acc }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        return { ok: false, error: '已停止', acc }
      }
      return {
        ok: false,
        error: (e as Error)?.message || '请求失败',
        acc,
      }
    } finally {
      streaming.value = false
      streamState.value.abortCtl = null
      if (streamState.value.activeAssistantId === params.assistantId) {
        streamState.value.activeAssistantId = null
      }
    }
  }

  async function runOneshot(prompt: string) {
    const hasSel = options.hasSelection()
    const mode: 'create' | 'edit' = hasSel ? 'edit' : 'create'
    const userMsg: DesignAiChatMessage = {
      id: newId('u'),
      role: 'user',
      text: prompt,
      status: 'done',
      at: new Date(),
    }
    const assistantId = newId('a')
    messages.value = [
      ...messages.value,
      userMsg,
      {
        id: assistantId,
        role: 'assistant',
        text: '',
        status: 'streaming',
        at: new Date(),
      },
    ]

    const streamed = await runStream({
      prompt,
      phase: 'oneshot',
      mode,
      assistantId,
    })
    if (!streamed.ok) {
      const stopped = streamed.error === '已停止'
      patchAssistant(assistantId, {
        text: streamed.acc,
        status: stopped ? 'stopped' : 'error',
        error: stopped ? undefined : streamed.error,
      })
      if (!stopped) errMsg.value = streamed.error
      return
    }

    const applied = applyDesignDocFromResponse(streamed.acc, mode)
    if (!applied.ok) {
      patchAssistant(assistantId, {
        text: streamed.acc,
        status: 'error',
        error: applied.error,
      })
      errMsg.value = applied.error
      return
    }
    const names = collectRootNames(applied.doc)
    patchAssistant(assistantId, {
      text: names.length
        ? `已应用到画布：${names.join('、')}`
        : '已应用到画布',
      status: 'applied',
    })
    options.emit('design-ai-applied')
    errMsg.value = ''
  }

  async function runPlanPhase(prompt: string) {
    const userMsg: DesignAiChatMessage = {
      id: newId('u'),
      role: 'user',
      text: prompt,
      status: 'done',
      at: new Date(),
    }
    const assistantId = newId('a')
    messages.value = [
      ...messages.value,
      userMsg,
      {
        id: assistantId,
        role: 'assistant',
        text: '',
        status: 'streaming',
        at: new Date(),
      },
    ]

    const streamed = await runStream({
      prompt: `请把下列用户意图拆成 DesignPlan 子任务（每个 todo 一批可独立落稿的组件/页面）：\n${prompt}`,
      phase: 'plan',
      mode: 'create',
      assistantId,
    })

    if (!streamed.ok) {
      // plan 失败则回退 oneshot：用同一份输出尝试 Design Document
      const asDoc = applyDesignDocFromResponse(streamed.acc, 'create')
      if (asDoc.ok) {
        const names = collectRootNames(asDoc.doc)
        patchAssistant(assistantId, {
          text: names.length
            ? `已应用到画布：${names.join('、')}`
            : '已应用到画布',
          status: 'applied',
        })
        options.emit('design-ai-applied')
        errMsg.value = ''
        return
      }
      const stopped = streamed.error === '已停止'
      patchAssistant(assistantId, {
        text: streamed.acc,
        status: stopped ? 'stopped' : 'error',
        error: stopped ? undefined : streamed.error,
      })
      if (!stopped) errMsg.value = streamed.error
      return
    }

    const planResult = extractDesignPlanFromAiResponse(streamed.acc)
    if (!planResult.ok) {
      // 模型可能直接吐了 Design Document
      const asDoc = applyDesignDocFromResponse(streamed.acc, 'create')
      if (asDoc.ok) {
        const names = collectRootNames(asDoc.doc)
        patchAssistant(assistantId, {
          text: names.length
            ? `已应用到画布：${names.join('、')}`
            : '已应用到画布',
          status: 'applied',
        })
        options.emit('design-ai-applied')
        errMsg.value = ''
        return
      }
      patchAssistant(assistantId, {
        text: streamed.acc,
        status: 'error',
        error: planResult.error,
      })
      errMsg.value = planResult.error
      return
    }

    activePlan.value = {
      title: planResult.plan.title,
      userGoal: prompt,
      todos: planResult.plan.todos.map((t) => ({
        id: t.id,
        content: t.content,
        status: 'pending' as const,
      })),
      appliedNames: [],
    }
    patchAssistant(assistantId, {
      text: formatPlanMessageText(planResult.plan),
      status: 'plan',
    })
    errMsg.value = ''
  }

  async function startPlanExecution() {
    const plan = activePlan.value
    if (!plan || executingPlan.value || streaming.value) return
    const pending = plan.todos.filter((t) => t.status === 'pending')
    if (!pending.length) return

    streamState.value.stopRequested = false
    executingPlan.value = true
    errMsg.value = ''

    try {
      for (const todo of pending) {
        if (streamState.value.stopRequested) break
        const planNow = activePlan.value
        if (!planNow) break

        activePlan.value = {
          ...planNow,
          todos: planNow.todos.map((t) =>
            t.id === todo.id ? { ...t, status: 'running' } : t,
          ),
        }

        const assistantId = newId('a')
        messages.value = [
          ...messages.value,
          {
            id: assistantId,
            role: 'assistant',
            text: '',
            status: 'streaming',
            at: new Date(),
          },
        ]

        const doneNames = activePlan.value.appliedNames
        const executePrompt = [
          `【用户总目标】${planNow.userGoal}`,
          `【计划】${planNow.title}`,
          `【当前子任务】${todo.id}: ${todo.content}`,
          doneNames.length
            ? `【已完成组件 name，勿重复】${doneNames.join('、')}`
            : '【已完成组件】无',
          '只输出本子任务的 Design Document JSON（version+roots），追加到画布；Button/Card 用 container 外壳 fill/stroke。',
        ].join('\n')

        const streamed = await runStream({
          prompt: executePrompt,
          phase: 'execute',
          mode: 'create',
          assistantId,
        })

        if (
          streamState.value.stopRequested ||
          (!streamed.ok && streamed.error === '已停止')
        ) {
          patchAssistant(assistantId, {
            text: streamed.acc,
            status: 'stopped',
          })
          activePlan.value = {
            ...activePlan.value!,
            todos: activePlan.value!.todos.map((t) =>
              t.id === todo.id
                ? { ...t, status: 'error', error: '已停止' }
                : t,
            ),
          }
          break
        }

        if (!streamed.ok) {
          patchAssistant(assistantId, {
            text: streamed.acc,
            status: 'error',
            error: streamed.error,
          })
          activePlan.value = {
            ...activePlan.value!,
            todos: activePlan.value!.todos.map((t) =>
              t.id === todo.id
                ? { ...t, status: 'error', error: streamed.error }
                : t,
            ),
          }
          errMsg.value = streamed.error
          continue
        }

        const applied = applyDesignDocFromResponse(streamed.acc, 'create')
        if (!applied.ok) {
          patchAssistant(assistantId, {
            text: streamed.acc,
            status: 'error',
            error: applied.error,
          })
          activePlan.value = {
            ...activePlan.value!,
            todos: activePlan.value!.todos.map((t) =>
              t.id === todo.id
                ? { ...t, status: 'error', error: applied.error }
                : t,
            ),
          }
          errMsg.value = applied.error
          continue
        }

        const names = collectRootNames(applied.doc)
        activePlan.value = {
          ...activePlan.value!,
          appliedNames: [
            ...activePlan.value!.appliedNames,
            ...names.filter(
              (n) => !activePlan.value!.appliedNames.includes(n),
            ),
          ],
          todos: activePlan.value!.todos.map((t) =>
            t.id === todo.id ? { ...t, status: 'done' } : t,
          ),
        }
        patchAssistant(assistantId, {
          text: names.length
            ? `已应用到画布：${names.join('、')}`
            : `已完成：${todo.content}`,
          status: 'applied',
        })
        options.emit('design-ai-applied')
      }
    } finally {
      executingPlan.value = false
    }
  }

  async function sendPrompt(rawPrompt: string) {
    if (options.getProps().readonly) return
    if (busy.value) return
    const prompt = rawPrompt.trim()
    if (!prompt) return

    errMsg.value = ''
    streamState.value.stopRequested = false

    if (shouldUseDesignAiPlanMode(prompt, options.hasSelection())) {
      await runPlanPhase(prompt)
      return
    }
    await runOneshot(prompt)
  }

  function onComposerSubmit(payload: { html: string; files: File[] }) {
    void sendPrompt(designAiHtmlToPlainText(payload.html))
  }

  useEffect(
    () => () => {
      streamState.value.stopRequested = true
      streamState.value.abortCtl?.abort()
      streamState.value.abortCtl = null
    },
    [streamState],
  )

  return {
    aiPanelOpen,
    aiAssistantEnabled,
    aiAssistantReady,
    showAssistantPanel,
    agentDisplayName,
    hasSelectionContext,
    messages,
    chatListMessages,
    streaming,
    executingPlan,
    busy,
    activePlan,
    planAwaitingStart,
    errMsg,
    toggleAiPanel,
    openAiPanel,
    closeAiPanel,
    clearChat,
    stopStream,
    sendPrompt,
    startPlanExecution,
    onComposerSubmit,
  }
}
