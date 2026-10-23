import { useEffect, useRef, useState } from 'react'
import { copyTextToClipboard } from '@zengchaowu/shared/functions/dom/copyTextToClipboard'
import type { TpCodePreviewProps } from './types'

export function TpCodePreview({
  code,
  language,
  title,
  copyable,
  className,
}: TpCodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copyCode = async () => {
    if (!code) return
    const ok = await copyTextToClipboard(code)
    if (!ok) return
    setCopied(true)
    timerRef.current = setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div
      className={[
        'code-preview bg-[var(--bg-color-secondarycontainer)] rounded-lg overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title ? (
        <div className="code-preview-header px-4 py-2 bg-[var(--bg-color-component)] flex justify-between items-center">
          <span className="text-sm font-medium text-[var(--text-color-primary)]">
            {title}
          </span>
          <div className="flex items-center space-x-2">
            {copyable ? (
              <div
                onClick={copyCode}
                className="text-[var(--text-color-placeholder)] hover:text-[var(--text-color-primary)] transition-colors cursor-pointer"
              >
                {copied ? (
                  <span className="text-xs text-[var(--success-color-6)]">
                    已复制
                  </span>
                ) : (
                  <span className="text-xs">复制</span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <pre
        className={[
          'code-block m-0 overflow-auto p-4 font-mono text-[0.8125rem] leading-snug',
          `language-${language}`,
        ].join(' ')}
      >
        <code
          className={[
            'font-[inherit] text-[length:inherit] leading-[inherit]',
            `language-${language}`,
          ].join(' ')}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}

export default TpCodePreview
