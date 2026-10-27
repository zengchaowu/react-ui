import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import {
  formatAgentToolStepLabel,
  formatExecCommandKindLabel,
  formatDelegateHeadline,
  agentToolStem,
  isAgentTerminalToolName,
  parseExecCommandText,
  parseRunAgentStepPresentation,
} from '@zengchaowu/shared/functions/ai/agentToolDisplayPolicy'
import { CwIcon } from '../CwIcon'
import { resolveAgentToolStepLayoutClasses } from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/styles'
import {
  AGENT_TOOL_CHEVRON_SIZE,
  AGENT_TOOL_TERMINAL_COLLAPSED_MAX_LINES,
  agentToolTerminalHoverChevronClass,
  agentToolTerminalHoverToggleButtonClass,
  agentToolTerminalHoverToggleClass,
  agentToolTerminalOutputCollapsedClass,
  agentToolTerminalOutputExpandedClass,
} from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/chrome'
import CwAgentToolShimmerLabel from './CwAgentToolShimmerLabel'
import CwChatAgentToolStatusIcon from './CwChatAgentToolStatusIcon'
import { defaultCwChatAgentToolStepTexts } from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/texts'
import type { CwChatAgentToolStepProps } from './types'
import type { CwChatAgentToolStepTexts } from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/types'

export interface CwChatAgentToolStepComponentProps
  extends CwChatAgentToolStepProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  className?: string
}

interface TerminalPreview {
  command?: string
  stdout?: string
  stderr?: string
  exitCode?: number | null
}

function isDelegateToolName(name: string): boolean {
  return agentToolStem(name) === 'task'
}

function unwrapToolError(raw: string | undefined): string {
  const text = String(raw ?? '').trim()
  if (!text.startsWith('{')) return text
  try {
    const parsed = JSON.parse(text) as { error?: unknown }
    const inner = typeof parsed?.error === 'string' ? parsed.error.trim() : ''
    return inner || text
  } catch {
    return text
  }
}

function unwrapPreviewRecord(obj: Record<string, unknown>): Record<string, unknown> {
  const inner = obj.result
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>
  }
  return obj
}

function parseTerminalPreview(preview: string | undefined): TerminalPreview | null {
  const raw = String(preview ?? '').trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null
    const j = unwrapPreviewRecord(parsed)
    if (!('stdout' in j || 'stderr' in j || 'exit_code' in j || 'exitCode' in j)) {
      return null
    }
    return {
      command: typeof j.command === 'string' ? j.command : undefined,
      stdout: typeof j.stdout === 'string' ? j.stdout : '',
      stderr: typeof j.stderr === 'string' ? j.stderr : '',
      exitCode:
        typeof j.exit_code === 'number'
          ? j.exit_code
          : typeof j.exitCode === 'number'
            ? j.exitCode
            : null,
    }
  } catch {
    return null
  }
}

function countTerminalOutputLines(out: {
  stdout?: string
  stderr?: string
}): number {
  let lines = 0
  for (const chunk of [out.stdout, out.stderr]) {
    const text = String(chunk ?? '').trimEnd()
    if (!text) continue
    lines += text.split('\n').length
  }
  return lines
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightShellCommand(command: string): string {
  if (!command) return ''
  let html = escapeHtml(command)
  const kinds = formatExecCommandKindLabel(command)
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'shell')
  for (const kind of kinds) {
    const re = new RegExp(
      `(^|[\\s;|&]+)${kind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$|[;&|])`,
      'gi',
    )
    html = html.replace(re, (full, sep: string) => {
      const token = full.slice(sep.length)
      return `${sep}<span class="text-[var(--warning-color-6)]">${token}</span>`
    })
  }
  html = html.replace(
    /(^|[\s;|&]+)(\/[A-Za-z0-9_-]+)(?=\s|$)/g,
    '$1<span class="text-[var(--warning-color-6)]">$2</span>',
  )
  return html
}

function scrollWheelToParent(el: HTMLElement, deltaY: number) {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const { overflowY } = getComputedStyle(node)
    const canScroll =
      /(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight
    if (canScroll) {
      node.scrollTop += deltaY
      return
    }
    node = node.parentElement
  }
}

export function CwChatAgentToolStep({
  step,
  defaultExpanded,
  detailExpanded,
  showDetailChevron = true,
  layout = 'standalone',
  showStatus = true,
  showStatusIcon = true,
  texts: textsProp,
  onUpdateDetailExpanded,
  className,
  ...rest
}: CwChatAgentToolStepComponentProps) {
  const styles = useMemo(
    () => resolveAgentToolStepLayoutClasses(layout ?? 'standalone'),
    [layout],
  )

  const texts = useMemo<CwChatAgentToolStepTexts>(
    () => ({
      ...defaultCwChatAgentToolStepTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const isLogLine = layout === 'logLine'
  const isTerminalTool = isAgentTerminalToolName(step.name)
  const isTerminalCard = isTerminalTool && !isLogLine

  const [internalExpanded, setInternalExpanded] = useState<boolean>(
    () => defaultExpanded ?? false,
  )

  useEffect(() => {
    if (detailExpanded !== undefined) setInternalExpanded(detailExpanded)
  }, [detailExpanded])

  useEffect(() => {
    if (defaultExpanded !== undefined && detailExpanded === undefined) {
      setInternalExpanded(defaultExpanded)
    }
    // 与 Vue `watch(() => props.defaultExpanded, …)` 一致：仅随 defaultExpanded 变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExpanded])

  const delegatePresentation = useMemo(
    () =>
      isDelegateToolName(step.name)
        ? parseRunAgentStepPresentation(step)
        : null,
    [step],
  )

  const showDelegateDetail =
    isDelegateToolName(step.name) &&
    !!(delegatePresentation?.detail || delegatePresentation?.error)

  const stepErrorText = useMemo(() => unwrapToolError(step.error), [step.error])

  const terminalOutput = useMemo(
    () => parseTerminalPreview(step.resultPreview),
    [step.resultPreview],
  )

  const shellCommandText = useMemo(() => parseExecCommandText(step), [step])

  const showTerminalBlock = isTerminalTool && (!!terminalOutput || !!shellCommandText)

  const isDetailExpanded =
    detailExpanded !== undefined ? detailExpanded : internalExpanded

  const hasDetail = useMemo(() => {
    if (isDelegateToolName(step.name)) {
      return !!(step.children?.length) || showDelegateDetail
    }
    if (isLogLine) {
      return step.status === 'error' && !!step.error?.trim()
    }
    if (isAgentTerminalToolName(step.name)) {
      return !!(
        parseExecCommandText(step) ||
        step.resultPreview?.trim() ||
        step.error?.trim()
      )
    }
    return !!step.error?.trim()
  }, [step, isLogLine, showDelegateDetail])

  function toggleDetail() {
    if (!hasDetail) return
    const next = !isDetailExpanded
    if (detailExpanded !== undefined) {
      onUpdateDetailExpanded?.(next)
      return
    }
    setInternalExpanded(next)
  }

  const terminalOutputIsCollapsible =
    !!terminalOutput &&
    countTerminalOutputLines(terminalOutput) > AGENT_TOOL_TERMINAL_COLLAPSED_MAX_LINES

  const showTerminalHoverToggle =
    isTerminalCard &&
    hasDetail &&
    showTerminalBlock &&
    terminalOutputIsCollapsible

  const terminalToggleIconName = isDetailExpanded
    ? 'common--dir--arrow-up-line'
    : 'common--dir--arrow-down-line'

  function onHeaderClick() {
    if (isTerminalCard) return
    toggleDetail()
  }

  const isLabelShimmering = step.status === 'running'

  const showStatusText = showStatus !== false && !isLogLine && !isTerminalTool

  const statusIconVisible =
    showStatusIcon !== false && !isLogLine && !isTerminalTool

  const commandKindLabel =
    !isTerminalTool || isLogLine
      ? ''
      : formatExecCommandKindLabel(parseExecCommandText(step))

  function statusLabel(target: AgentToolStep): string {
    if (target.status === 'running') return texts.runningLabel
    if (target.status === 'error') return texts.errorLabel
    return texts.doneLabel
  }

  const stepHeadline = useMemo(() => {
    if (isDelegateToolName(step.name)) {
      return formatDelegateHeadline(step)
    }
    return formatAgentToolStepLabel(step)
  }, [step])

  const showChevron = useMemo(() => {
    if (!showDetailChevron) return false
    if (isLogLine && !isDelegateToolName(step.name)) return false
    return hasDetail
  }, [showDetailChevron, isLogLine, step.name, hasDetail])

  const stepIconWrapClass = useMemo(() => {
    const st = step.status
    const tone =
      st === 'running'
        ? styles.stepIconRunning
        : st === 'error'
          ? styles.stepIconError
          : styles.stepIconDone
    return [styles.stepIcon, tone].filter(Boolean).join(' ')
  }, [styles, step.status])

  const stepNameClass = useMemo(() => {
    if (isLabelShimmering) {
      return styles.stepName
        .split(/\s+/)
        .filter((c) => !c.startsWith('text-[') && c !== 'font-medium')
        .join(' ')
    }
    return [
      styles.stepName,
      isLogLine && step.status === 'running'
        ? 'text-[var(--text-color-primary)]'
        : '',
    ]
      .filter(Boolean)
      .join(' ')
  }, [styles.stepName, isLabelShimmering, isLogLine, step.status])

  const terminalExtraError = useMemo(() => {
    const err = (delegatePresentation?.error || stepErrorText).trim()
    if (!err) return ''
    const stderr = terminalOutput?.stderr?.trim() ?? ''
    if (stderr && (stderr === err || stderr.includes(err))) return ''
    return err
  }, [delegatePresentation?.error, stepErrorText, terminalOutput])

  const displayShellCommand = (
    terminalOutput?.command || shellCommandText
  ).trim()

  const highlightedShellCommandHtml = useMemo(
    () => highlightShellCommand(displayShellCommand),
    [displayShellCommand],
  )

  const terminalTitleClass = isLabelShimmering
    ? 'min-w-0 truncate [font-size:var(--font-size-body)] leading-snug'
    : 'min-w-0 truncate [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]'

  const terminalOutputRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = terminalOutputRef.current
    if (!el) return
    const target = el
    function handleWheel(e: WheelEvent) {
      if (!isDetailExpanded) {
        e.preventDefault()
        scrollWheelToParent(target, e.deltaY)
        return
      }
      if (target.scrollHeight <= target.clientHeight) return
      const atTop = target.scrollTop <= 0 && e.deltaY < 0
      const atBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 1 &&
        e.deltaY > 0
      if (!atTop && !atBottom) {
        e.stopPropagation()
      }
    }
    // 折叠态需要 preventDefault，必须显式 non-passive
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [isDetailExpanded, isTerminalCard, showTerminalBlock, hasDetail])

  const headerClickable = hasDetail && !isTerminalCard

  const headerClass = [
    headerClickable ? styles.header : styles.headerStatic,
    isTerminalCard
      ? 'bg-[var(--bg-color-secondarycontainer)]'
      : isTerminalTool && !isLogLine
        ? 'bg-[var(--bg-color-secondarycontainer)] hover:bg-[var(--bg-color-secondarycontainer)]'
        : '',
  ]
    .filter(Boolean)
    .join(' ')

  const headerBody = (
    <>
      {/* Cursor Shell：>_ + 标题 + 紧挨 kind，不展示「参数」JSON */}
      {isTerminalTool && !isLogLine ? (
        <span
          className="shrink-0 font-mono leading-none text-[var(--text-color-primary)] [font-size:var(--font-size-body)]"
          aria-hidden="true"
        >
          &gt;_
        </span>
      ) : showChevron ? (
        <CwIcon
          name="common--dir--arrow-right-line"
          prefix="icon"
          className={[
            styles.headerChevron,
            isDetailExpanded ? styles.headerChevronExpanded : '',
          ]
            .filter(Boolean)
            .join(' ')}
          size={AGENT_TOOL_CHEVRON_SIZE}
        />
      ) : null}
      {statusIconVisible ? (
        <CwChatAgentToolStatusIcon
          status={step.status}
          wrapClass={stepIconWrapClass}
        />
      ) : null}
      {isTerminalTool && !isLogLine ? (
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden">
          <CwAgentToolShimmerLabel
            active={isLabelShimmering}
            className={terminalTitleClass}
          >
            {stepHeadline}
          </CwAgentToolShimmerLabel>
          {commandKindLabel ? (
            <span className="shrink-0 [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]">
              {commandKindLabel}
            </span>
          ) : null}
        </div>
      ) : (
        <>
          <CwAgentToolShimmerLabel
            active={isLabelShimmering}
            className={stepNameClass}
          >
            {stepHeadline}
          </CwAgentToolShimmerLabel>
          {showStatusText ? (
            <span className={styles.stepStatus}>{statusLabel(step)}</span>
          ) : null}
        </>
      )}
    </>
  )

  return (
    <div
      {...rest}
      className={[styles.root, isTerminalCard ? 'group' : '', className]
        .filter(Boolean)
        .join(' ')}
      data-cw-chat-agent-tool-step
    >
      {headerClickable ? (
        <button
          type="button"
          className={headerClass}
          aria-expanded={isDetailExpanded ? 'true' : 'false'}
          onClick={onHeaderClick}
        >
          {headerBody}
        </button>
      ) : (
        <div className={headerClass} onClick={onHeaderClick}>
          {headerBody}
        </div>
      )}

      {hasDetail && showTerminalBlock && isTerminalCard ? (
        <div className="relative space-y-1 hairline-border-t border-[var(--border-color)] px-2.5 py-1.5">
          {displayShellCommand ? (
            <div className="break-all font-mono [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]">
              <span className="text-[var(--warning-color-6)]">$</span>
              <span
                className="ml-1"
                dangerouslySetInnerHTML={{ __html: highlightedShellCommandHtml }}
              />
            </div>
          ) : null}
          {terminalOutput?.stdout?.trim() || terminalOutput?.stderr?.trim() ? (
            <div
              ref={terminalOutputRef}
              className={[
                'space-y-1',
                isDetailExpanded
                  ? agentToolTerminalOutputExpandedClass
                  : agentToolTerminalOutputCollapsedClass,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {terminalOutput?.stdout?.trim() ? (
                <pre className="cursor-text select-text whitespace-pre-wrap break-all font-mono [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]">
                  {terminalOutput.stdout}
                </pre>
              ) : null}
              {terminalOutput?.stderr?.trim() ? (
                <pre className="cursor-text select-text whitespace-pre-wrap break-all font-mono [font-size:var(--font-size-body)] leading-snug text-[var(--error-color-6)]">
                  {terminalOutput.stderr}
                </pre>
              ) : null}
            </div>
          ) : null}
          {terminalExtraError ? (
            <div className="[font-size:var(--font-size-body)] text-[var(--error-color-6)]">
              {terminalExtraError}
            </div>
          ) : null}

          {showTerminalHoverToggle ? (
            <div className={agentToolTerminalHoverToggleClass}>
              <button
                type="button"
                className={agentToolTerminalHoverToggleButtonClass}
                aria-expanded={isDetailExpanded ? 'true' : 'false'}
                aria-label={
                  isDetailExpanded ? texts.collapseLabel : texts.expandLabel
                }
                onClick={toggleDetail}
              >
                <CwIcon
                  name={terminalToggleIconName}
                  prefix="icon"
                  className={agentToolTerminalHoverChevronClass}
                  size={AGENT_TOOL_CHEVRON_SIZE}
                />
              </button>
            </div>
          ) : null}
        </div>
      ) : hasDetail && isDetailExpanded ? (
        <div
          className={
            isTerminalTool && !isLogLine
              ? 'space-y-1 hairline-border-t border-[var(--border-color)] px-2.5 py-1.5'
              : styles.stepDetail
          }
        >
          {/* Cursor：整卡一体，$ 命令 + 原始输出，无「参数/结果」分区 */}
          {showTerminalBlock && !isTerminalCard ? (
            <>
              {displayShellCommand ? (
                <div className="break-all font-mono [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]">
                  <span className="text-[var(--warning-color-6)]">$</span>
                  <span
                    className="ml-1"
                    dangerouslySetInnerHTML={{ __html: highlightedShellCommandHtml }}
                  />
                </div>
              ) : null}
              {terminalOutput?.stdout?.trim() ? (
                <pre className="max-h-40 cursor-text select-text overflow-auto font-mono [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]">
                  {terminalOutput.stdout}
                </pre>
              ) : null}
              {terminalOutput?.stderr?.trim() ? (
                <pre className="max-h-20 cursor-text select-text overflow-auto font-mono [font-size:var(--font-size-body)] leading-snug text-[var(--error-color-6)]">
                  {terminalOutput.stderr}
                </pre>
              ) : null}
            </>
          ) : null}

          {!isLogLine && !isTerminalTool ? (
            <>
              {delegatePresentation?.goal && isDelegateToolName(step.name) ? (
                <div className="mb-2 whitespace-pre-wrap [font-size:var(--font-size-body)] leading-relaxed text-[var(--text-color-secondary)]">
                  {delegatePresentation.goal}
                </div>
              ) : null}
              {showDelegateDetail && delegatePresentation?.detail ? (
                <div className="whitespace-pre-wrap [font-size:var(--font-size-body)] leading-relaxed text-[var(--text-color-secondary)]">
                  {delegatePresentation.detail}
                </div>
              ) : step.error?.trim() || delegatePresentation?.error ? (
                <div>
                  <pre
                    className={[styles.stepDetailPre, 'text-[var(--error-color-6)]']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {delegatePresentation?.error || stepErrorText}
                  </pre>
                </div>
              ) : null}
            </>
          ) : null}

          {isTerminalTool && !isTerminalCard && terminalExtraError ? (
            <div className="[font-size:var(--font-size-body)] text-[var(--error-color-6)]">
              {terminalExtraError}
            </div>
          ) : null}
          {isLogLine && (step.error?.trim() || delegatePresentation?.error) ? (
            <div className="[font-size:var(--font-size-body)] text-[var(--error-color-6)]">
              {delegatePresentation?.error || stepErrorText}
            </div>
          ) : null}

          {step.children?.length ? (
            <div className="flex flex-col gap-0 pl-4">
              {step.children.map((child) => (
                <CwChatAgentToolStep
                  key={child.id}
                  step={child}
                  layout="logLine"
                  showDetailChevron={false}
                  showStatus={false}
                  showStatusIcon={false}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default CwChatAgentToolStep
