import CwIcon from '../CwIcon/CwIcon'
import CwLoading from '../CwLoading/CwLoading'
import { AGENT_TOOL_STATUS_ICON_SIZE } from './chrome'

export interface CwChatAgentToolStatusIconProps {
  status: string
  wrapClass: string
  doneIconName?: string
  iconSize?: number
  className?: string
}

export function CwChatAgentToolStatusIcon({
  status,
  wrapClass,
  doneIconName = 'common--status--select-line',
  iconSize = AGENT_TOOL_STATUS_ICON_SIZE,
  className,
  ...rest
}: CwChatAgentToolStatusIconProps & Record<string, unknown>) {
  return (
    <span
      {...rest}
      className={[wrapClass, className].filter(Boolean).join(' ')}
    >
      {status === 'running' ? (
        <CwLoading type="spinner" size="small" />
      ) : status === 'error' ? (
        <CwIcon
          name="common--status--info-filled"
          prefix="icon"
          size={iconSize}
        />
      ) : (
        <CwIcon name={doneIconName} prefix="icon" size={iconSize} />
      )}
    </span>
  )
}

export default CwChatAgentToolStatusIcon
