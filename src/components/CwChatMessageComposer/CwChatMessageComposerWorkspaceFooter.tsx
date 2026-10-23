import type { ReactNode } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import { composerBase } from './styles'

export interface CwChatMessageComposerWorkspaceFooterProps {
  disabled?: boolean
  canSend?: boolean
  showStop?: boolean
  showAttachButton?: boolean
  /** 等价 Vue 具名插槽 `left` */
  leftSlot?: ReactNode
  /** 等价 Vue `@attach` */
  onAttach?: () => void
  /** 等价 Vue `@send` */
  onSend?: () => void
  /** 等价 Vue `@stop` */
  onStop?: () => void
}

const ACTION_ICON_SIZE = 1.5
const ATTACH_ICON_SIZE = 1.125

export function CwChatMessageComposerWorkspaceFooter({
  disabled = false,
  canSend = false,
  showStop = false,
  showAttachButton = true,
  leftSlot,
  onAttach,
  onSend,
  onStop,
}: CwChatMessageComposerWorkspaceFooterProps) {
  const shellStyles = composerBase

  function onSendClick() {
    if (disabled) return
    if (showStop) {
      onStop?.()
      return
    }
    if (!canSend) return
    onSend?.()
  }

  return (
    <div className={shellStyles.workspaceFooter}>
      {leftSlot != null ? (
        <div className={shellStyles.workspaceFooterLeft}>{leftSlot}</div>
      ) : null}
      <div className={shellStyles.workspaceFooterRight}>
        {showAttachButton ? (
          <button
            type="button"
            className={shellStyles.workspaceIconBtn}
            disabled={disabled}
            aria-label="添加附件"
            onClick={() => onAttach?.()}
          >
            <CwIcon
              name="common--action--link-line"
              prefix="icon"
              size={ATTACH_ICON_SIZE}
            />
          </button>
        ) : null}
        <div
          role="button"
          tabIndex={disabled ? undefined : 0}
          className={[
            showStop ? shellStyles.workspaceStopBtn : shellStyles.workspaceSendBtn,
            !showStop && !canSend ? shellStyles.workspaceSendBtnDisabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled || (!showStop && !canSend) ? 'true' : undefined}
          aria-label={showStop ? '停止回复' : '发送'}
          onClick={onSendClick}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            onSendClick()
          }}
        >
          {showStop ? (
            <CwIcon
              name="common--status--stop-filled"
              prefix="icon"
              size={ACTION_ICON_SIZE}
            />
          ) : (
            <CwIcon
              name="chat--msg--send-filled"
              prefix="icon"
              size={ACTION_ICON_SIZE}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CwChatMessageComposerWorkspaceFooter
