import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { CwEditableText } from '../CwEditableText'
import type { CwInlineRenameLabelProps } from './types'
import { defaultCwInlineRenameLabelTexts } from '@zengchaowu/ui-shared/components/CwInlineRenameLabel/texts'
import './cw-inline-rename-label.css'

export function CwInlineRenameLabel({
  name,
  renaming,
  asyncModify,
  labelClass = '',
  align = 'left',
  texts: textsProp,
  onCancel,
  onSuccess,
  className,
}: CwInlineRenameLabelProps) {
  const [displayName, setDisplayName] = useState(name)

  const texts = useMemo(
    () => ({
      ...defaultCwInlineRenameLabelTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const editorTexts = useMemo(
    () => ({
      edit: `${texts.renamePrefix} ${name}`,
      placeholder: name,
    }),
    [texts.renamePrefix, name],
  )

  useEffect(() => {
    if (!renaming) {
      setDisplayName(name)
    }
  }, [name])

  useEffect(() => {
    if (renaming) {
      setDisplayName(name)
    }
  }, [renaming])

  function handleCancel() {
    setDisplayName(name)
    onCancel?.()
  }

  function handleSuccess(value: string) {
    setDisplayName(value)
    onSuccess?.(value)
  }

  if (renaming) {
    return (
      <span className={[labelClass, 'cw-inline-rename-label', className].filter(Boolean).join(' ')}>
        <CwEditableText
          value={displayName}
          onChange={setDisplayName}
          appearance="plain"
          align={align}
          defaultEditing
          editIconVisibility="never"
          asyncModify={asyncModify}
          texts={editorTexts}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
          onClick={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
          onMouseDown={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
          onDoubleClick={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
        />
      </span>
    )
  }

  return <span className={[labelClass, className].filter(Boolean).join(' ')}>{name}</span>
}

export default CwInlineRenameLabel
