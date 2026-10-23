import { useState } from 'react'
import { CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { showDynamicDialog } from '../CwDynamicDialog'
import CwButton from '../CwButton/CwButton'
import CwInput from '../CwInput/CwInput'
import type { CwButtonTexts } from '../CwButton/types'
import type {
  CwNameConfirmDialogOptions,
  CwNameConfirmDialogResult,
  CwNameConfirmDialogStyles,
} from './types'
import { nameConfirmDialogBase } from './styles'
import { defaultCwNameConfirmDialogTexts } from './texts'

interface CwNameConfirmDialogBodyProps {
  styles: CwNameConfirmDialogStyles
  message?: string
  expected: string
  hintBefore: string
  hintAfter: string
  inputPlaceholder: string
  confirmText: string
  cancelText: string
  confirmButtonTexts?: Partial<CwButtonTexts>
  cancelButtonTexts?: Partial<CwButtonTexts>
  onCancel: () => void
  onConfirm: () => void
}

function CwNameConfirmDialogBody({
  styles,
  message,
  expected,
  hintBefore,
  hintAfter,
  inputPlaceholder,
  confirmText,
  cancelText,
  confirmButtonTexts,
  cancelButtonTexts,
  onCancel,
  onConfirm,
}: CwNameConfirmDialogBodyProps) {
  const [typed, setTyped] = useState('')
  const canConfirm = typed.trim().length > 0 && typed.trim() === expected

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        {message ? <div className={styles.message}>{message}</div> : null}
        <p className={styles.hint}>
          {hintBefore}
          <span className={styles.expected}>{expected}</span>
          {hintAfter}
        </p>
        <CwInput
          value={typed}
          onChange={(value: string) => {
            setTyped(value)
          }}
          placeholder={inputPlaceholder}
          showLabel={false}
          size="small"
          className="w-full"
        />
      </div>
      <div className={styles.footer}>
        <CwButton
          type="default"
          variant="outline"
          texts={cancelButtonTexts}
          onClick={onCancel}
        >
          {cancelText}
        </CwButton>
        <CwButton
          type="danger"
          disabled={!canConfirm}
          texts={confirmButtonTexts}
          onClick={() => {
            if (!canConfirm) return
            onConfirm()
          }}
        >
          {confirmText}
        </CwButton>
      </div>
    </div>
  )
}

/**
 * Dangerous-action confirm: user must type expectedName before confirm is enabled.
 */
export function showNameConfirmDialog(
  options: CwNameConfirmDialogOptions,
): Promise<CwNameConfirmDialogResult> {
  const texts = {
    ...defaultCwNameConfirmDialogTexts,
    ...options.texts,
  } as typeof defaultCwNameConfirmDialogTexts
  const {
    title = texts.title,
    message = texts.message,
    expectedName,
    confirmText = texts.confirmText,
    cancelText = texts.cancelText,
    inputPlaceholder = texts.inputPlaceholder,
    dialogConfig = {},
  } = options

  const expected = expectedName.trim()
  const styles = nameConfirmDialogBase

  return new Promise((resolve) => {
    let dialogInstance: ReturnType<typeof showDynamicDialog> | null = null
    let isResolved = false

    const settle = (result: boolean) => {
      if (isResolved) return
      isResolved = true
      dialogInstance?.close()
      setTimeout(() => resolve(result), 300)
    }

    const body = (
      <CwNameConfirmDialogBody
        styles={styles}
        message={message}
        expected={expected}
        hintBefore={texts.confirmHintBefore}
        hintAfter={texts.confirmHintAfter}
        inputPlaceholder={inputPlaceholder}
        confirmText={confirmText}
        cancelText={cancelText}
        confirmButtonTexts={options.texts?.confirmButtonTexts}
        cancelButtonTexts={options.texts?.cancelButtonTexts}
        onCancel={() => settle(false)}
        onConfirm={() => settle(true)}
      />
    )

    dialogInstance = showDynamicDialog({
      component: body,
      config: {
        ...dialogConfig,
        header:
          dialogConfig.header ?? (
            <div className={CW_OVERLAY_HEADER_TITLE_IN_BAR_CLASS}>{title}</div>
          ),
        closeOnClickOutside: dialogConfig.closeOnClickOutside ?? true,
        content: {
          class:
            'w-full max-w-md min-w-0 max-h-[min(85vh,28rem)] overflow-hidden flex flex-col',
          ...dialogConfig.content,
        },
      },
    })

    dialogInstance.promise.then(() => {
      if (!isResolved) {
        setTimeout(() => resolve(false), 300)
      }
    })
  })
}
