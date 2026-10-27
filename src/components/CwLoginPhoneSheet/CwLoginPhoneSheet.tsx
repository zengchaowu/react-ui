import { useMemo } from 'react'
import CwLoginPhoneDialogContent from '../CwLoginPhoneDialog/CwLoginPhoneDialogContent'
import type { CwLoginPhoneSheetProps } from './types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwLoginPhoneSheet/texts'

/**
 * 手机号登录 Sheet 内容（Vue 侧为 showLoginPhoneSheet 内部的 CwLoginPhoneDialogContent VNode）。
 * 命令式弹层请使用 showLoginPhoneSheet。
 */
export function CwLoginPhoneSheet({
  loading = false,
  inputSize = 'large',
  layout = 'sheet',
  texts,
  ...rest
}: CwLoginPhoneSheetProps) {
  const resolvedTexts = useMemo(
    () => ({ ...defaultTexts, ...(texts ?? {}) }),
    [texts],
  )

  return (
    <CwLoginPhoneDialogContent
      {...rest}
      loading={loading}
      inputSize={inputSize}
      layout={layout}
      texts={resolvedTexts}
    />
  )
}

export default CwLoginPhoneSheet
