import { useEffect, useState } from 'react'
import CwGrid from '../CwGrid/CwGrid'
import CwIcon from '../CwIcon/CwIcon'
import type { CwWalletPayPasswordPanelProps } from './types'
import './CwWalletPayPasswordPanel.css'

type SetupStep = 'enter' | 'confirm'

const PASSWORD_LENGTH = 6

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
] as const

export function CwWalletPayPasswordPanel({
  mode,
  embedded = false,
  presentation = 'page',
  submitPassword,
  onCancel,
  onComplete,
  className,
}: CwWalletPayPasswordPanelProps) {
  const [setupStep, setSetupStep] = useState<SetupStep>('enter')
  const [digits, setDigits] = useState('')
  const [firstPassword, setFirstPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorText, setErrorText] = useState('')

  const navTitle = mode === 'setup' ? '设置支付密码' : '请输入支付密码'

  const promptText =
    mode === 'verify'
      ? '请输入支付密码'
      : setupStep === 'confirm'
        ? '请再次填写以确认'
        : '请设置支付密码'

  const descText =
    mode === 'verify'
      ? ''
      : setupStep === 'confirm'
        ? '请再次输入，以确认你的支付密码'
        : '请设置支付密码，用于转账和发红包验证'

  useEffect(() => {
    setSetupStep('enter')
    setFirstPassword('')
    setDigits('')
    setErrorText('')
  }, [mode])

  function resetInput() {
    setDigits('')
  }

  function onKeyTap(key: string) {
    if (submitting) return
    setErrorText('')

    if (key === 'delete') {
      setDigits(digits.slice(0, -1))
      return
    }
    if (!/^\d$/.test(key) || digits.length >= PASSWORD_LENGTH) return

    const nextDigits = digits + key
    setDigits(nextDigits)
    if (nextDigits.length === PASSWORD_LENGTH) {
      void handleComplete(nextDigits)
    }
  }

  async function handleComplete(password: string) {
    if (mode === 'setup') {
      if (setupStep === 'enter') {
        setFirstPassword(password)
        setSetupStep('confirm')
        resetInput()
        return
      }

      if (password !== firstPassword) {
        setErrorText('两次密码输入不一致')
        setSetupStep('enter')
        setFirstPassword('')
        resetInput()
        return
      }
    }

    setSubmitting(true)
    try {
      await submitPassword(password)
      onComplete?.(password)
    } catch (e) {
      setErrorText(
        e instanceof Error && e.message.trim() ? e.message.trim() : '操作失败，请重试',
      )
      if (mode === 'setup') {
        setSetupStep('enter')
        setFirstPassword('')
      }
      resetInput()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={[
        'cw-wallet-pay-password',
        embedded && 'cw-wallet-pay-password--embedded',
        presentation === 'sheet' && 'cw-wallet-pay-password--sheet',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!embedded && presentation !== 'sheet' && (
        <header className="cw-wallet-pay-password__nav">
          <button
            type="button"
            className="cw-wallet-pay-password__nav-btn"
            aria-label="返回"
            onClick={() => onCancel?.()}
          >
            <CwIcon name="common--dir--arrow-left-line" prefix="icon" size={1.375} />
          </button>
          <h1 className="cw-wallet-pay-password__nav-title">{navTitle}</h1>
        </header>
      )}

      <div className="cw-wallet-pay-password__body">
        {presentation === 'sheet' ? (
          <p className="cw-wallet-pay-password__sheet-title">{promptText}</p>
        ) : (
          <p className="cw-wallet-pay-password__prompt">{promptText}</p>
        )}
        {descText ? <p className="cw-wallet-pay-password__desc">{descText}</p> : null}

        <div className="cw-wallet-pay-password__cells" aria-hidden="true">
          {Array.from({ length: PASSWORD_LENGTH }, (_, index) => (
            <span
              key={index}
              className={[
                'cw-wallet-pay-password__cell',
                digits.length >= index + 1 && 'is-filled',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>

        {errorText ? <p className="cw-wallet-pay-password__error">{errorText}</p> : null}
      </div>

      <div className="cw-wallet-pay-password__keypad hairline-border-t border-[var(--border-color)]">
        {keypadRows.map((row, rowIndex) => (
          <CwGrid
            key={rowIndex}
            columns={3}
            gutter={0}
            rowGap={0}
            align="stretch"
            className={[
              'cw-wallet-pay-password__keypad-row',
              rowIndex === keypadRows.length - 1 && 'is-last-row',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {row.map((key, keyIndex) => (
              <button
                key={`${rowIndex}-${keyIndex}`}
                type="button"
                className={[
                  'cw-wallet-pay-password__key hairline-border-r hairline-border-b border-[var(--border-color)]',
                  !key && 'is-empty',
                  key === 'delete' && 'is-delete',
                  keyIndex === 2 && 'hairline-border-r-0',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!key || submitting}
                onClick={() => {
                  if (key) onKeyTap(key)
                }}
              >
                {key === 'delete' ? '删除' : key ? key : null}
              </button>
            ))}
          </CwGrid>
        ))}
      </div>
    </div>
  )
}

export default CwWalletPayPasswordPanel
