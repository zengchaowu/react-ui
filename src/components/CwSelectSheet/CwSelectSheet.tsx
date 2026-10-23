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
import { defaultTexts as defaultSheetTexts } from '../CwDynamicSheet/texts'
import { CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import CwSelectSheetContent from './CwSelectSheetContent'
import type {
  CwSelectSheetHandle,
  CwSelectSheetOption,
  CwSelectSheetProps,
} from './types'
import { selectSheetBase, SELECT_SHEET_BODY_CLASS } from './styles'
import { defaultTexts } from './texts'

export interface CwSelectSheetComponentProps extends CwSelectSheetProps {}

export const CwSelectSheet = forwardRef<
  CwSelectSheetHandle,
  CwSelectSheetComponentProps
>(function CwSelectSheet(
  {
    options = [],
    value = null,
    title = '',
    disabled = false,
    readonly = false,
    columns = 3,
    breakpoints,
    gutter = 12,
    rowGap = 12,
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

  const componentIdRef = useRef('')
  if (!componentIdRef.current) {
    componentIdRef.current = `cw-select-sheet-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`
  }
  const componentId = componentIdRef.current

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
    if (disabled || readonly) return

    // 如果已经有打开的 Sheet，先关闭
    if (sheetInstanceRef.current) {
      closeSheet()
    }

    const header = (
      <div className={selectSheetBase.headerContainer}>
        <span className={selectSheetBase.headerTitle}>
          {title || texts.title}
        </span>
      </div>
    )

    const sheetConfig: CwDynamicSheetConfig = {
      header,
      direction: 'bottom',
      closeOnClickOutside: true,
      bodyPadding: false,
      content: { class: CW_OVERLAY_SHEET_BOTTOM_ROUNDED_CONTENT_CLASS },
      body: { class: SELECT_SHEET_BODY_CLASS },
    }

    const instance = showDynamicSheet({
      component: (
        <CwSelectSheetContent
          options={options}
          value={value}
          disabled={disabled}
          readonly={readonly}
          columns={columns}
          breakpoints={breakpoints}
          gutter={gutter}
          rowGap={rowGap}
          componentId={componentId}
          onChange={(
            nextValue: string | number | null,
            option: CwSelectSheetOption | null,
          ) => onChangeRef.current?.(nextValue, option)}
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
    disabled,
    readonly,
    options,
    value,
    title,
    texts,
    columns,
    breakpoints,
    gutter,
    rowGap,
    componentId,
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

export default CwSelectSheet
