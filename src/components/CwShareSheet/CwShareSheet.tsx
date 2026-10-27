import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { showDynamicSheet } from '../CwDynamicSheet/showDynamicSheet'
import type { ShowDynamicSheetReturn } from '../CwDynamicSheet/showDynamicSheet'
import type { CwDynamicSheetConfig } from '../CwDynamicSheet/types'
import { defaultTexts as defaultSheetTexts } from '@zengchaowu/ui-shared/components/CwDynamicSheet/texts'
import { CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import CwShareSheetContent from './CwShareSheetContent'
import type {
  CwShareSheetHandle,
  CwShareSheetOption,
  CwShareSheetProps,
} from './types'
import { shareSheetBase, SHARE_SHEET_BODY_CLASS } from './styles'
import { defaultTexts } from './texts'

export interface CwShareSheetComponentProps extends CwShareSheetProps {}

export const CwShareSheet = forwardRef<
  CwShareSheetHandle,
  CwShareSheetComponentProps
>(function CwShareSheet(
  {
    title = '',
    options = [],
    columns = 3,
    breakpoints,
    gutter = 0,
    rowGap = 20,
    texts: textsProp,
    onChange,
    onClose,
  },
  ref,
) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const sheetInstanceRef = useRef<ShowDynamicSheetReturn | null>(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // 关闭 Sheet
  const closeSheet = useCallback(() => {
    const instance = sheetInstanceRef.current
    if (instance) {
      sheetInstanceRef.current = null
      instance.close()
    }
    onCloseRef.current?.()
  }, [])

  // 显示 Sheet
  const show = useCallback(() => {
    // 如果已经有打开的 Sheet，先关闭
    if (sheetInstanceRef.current) {
      closeSheet()
    }

    const titleText = title || texts.title

    const header = titleText ? (
      <div
        className={shareSheetBase.titleContainer}
        style={{ position: 'relative', width: '100%' }}
      >
        <span className={shareSheetBase.title}>{titleText}</span>
      </div>
    ) : undefined

    const sheetConfig: CwDynamicSheetConfig = {
      header,
      direction: 'bottom',
      closeOnClickOutside: true,
      bodyPadding: false,
      content: { class: CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS },
      body: { class: SHARE_SHEET_BODY_CLASS },
    }

    const instance = showDynamicSheet({
      component: (
        <CwShareSheetContent
          options={options}
          columns={columns}
          breakpoints={breakpoints}
          gutter={gutter}
          rowGap={rowGap}
          onChange={(
            type: 'option' | 'cancel',
            option?: CwShareSheetOption,
          ) => onChangeRef.current?.(type, option)}
          onRequestClose={closeSheet}
        />
      ),
      config: sheetConfig,
      texts: defaultSheetTexts,
    })

    sheetInstanceRef.current = instance

    // 监听 Promise resolve，当 Sheet 关闭时清理
    instance.promise.then(() => {
      if (sheetInstanceRef.current === instance) {
        sheetInstanceRef.current = null
        onCloseRef.current?.()
      }
    })
  }, [
    title,
    options,
    columns,
    breakpoints,
    gutter,
    rowGap,
    texts,
    closeSheet,
  ])

  useImperativeHandle(ref, () => ({ show }), [show])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      const instance = sheetInstanceRef.current
      if (instance) {
        sheetInstanceRef.current = null
        instance.close()
      }
    }
  }, [])

  return null
})

export default CwShareSheet
