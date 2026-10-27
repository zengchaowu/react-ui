import { useMemo, useRef } from 'react'
import CwDynamicDialogLayer from '../CwDynamicDialog/CwDynamicDialogLayer'
import type { CwDynamicDialogConfig } from '../CwDynamicDialog/types'
import CwIcon from '../CwIcon/CwIcon'
import CwLoading from '../CwLoading/CwLoading'
import CwRichText from '../CwRichText/CwRichText'
import { cwToastContentStyles } from '@zengchaowu/ui-shared/components/CwToast/styles'
import { defaultCwToastTexts } from '@zengchaowu/ui-shared/components/CwToast/texts'
import { useCwToastDrag } from './useCwToastDrag'
import type { CwToastProps } from './types'
import type { CwToastType } from '@zengchaowu/ui-shared/components/CwToast/types'

const ICON_TYPES: CwToastType[] = ['success', 'fail', 'loading']

export function CwToast({
  visible = false,
  message = '',
  dsl = [],
  type = 'text',
  position = 'top',
  texts: textsProp,
  contentKey = 0,
  className,
  onClose,
  onVisibleChange,
  onAutoClosePause,
  onAutoCloseResume,
  onLinkClick,
}: CwToastProps) {
  const styles = cwToastContentStyles

  const texts = useMemo(
    () => ({
      ...defaultCwToastTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const toastDialogConfig = useMemo<CwDynamicDialogConfig>(
    () => ({
      variant: 'toast',
      toastPosition: position,
      dismissStack: false,
      bodyPadding: false,
      bodyScroll: false,
    }),
    [position],
  )

  const boxRef = useRef<HTMLDivElement | null>(null)

  /** 上滑隐藏：拖动超过阈值后置为不可见，交由壳层播关闭动画 */
  const { dragStyle, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useCwToastDrag({
      elRef: boxRef,
      isVisible: visible,
      onDismiss: () => {
        onVisibleChange?.(false)
      },
    })

  function handleAfterLeave() {
    onVisibleChange?.(false)
    onClose?.()
  }

  const showRichText = (dsl?.length ?? 0) > 0

  const showIcon = ICON_TYPES.includes(type)

  let iconToneClass = ''
  if (type === 'success') {
    iconToneClass = 'text-[var(--success-color-6)]'
  } else if (type === 'fail') {
    iconToneClass = 'text-[var(--error-color-6)]'
  } else if (type === 'loading') {
    iconToneClass = 'text-[var(--brand-color-6)]'
  }

  return (
    <CwDynamicDialogLayer
      visible={visible}
      config={toastDialogConfig}
      layerId="cw-toast"
      onClose={handleAfterLeave}
      className={className}
    >
      <div
        ref={boxRef}
        key={contentKey}
        className={styles.box}
        style={dragStyle}
        onMouseEnter={onAutoClosePause}
        onMouseLeave={onAutoCloseResume}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {showIcon ? (
          <span
            className={[styles.iconWrap, iconToneClass].filter(Boolean).join(' ')}
          >
            {type === 'loading' ? (
              <CwLoading
                type="spinner"
                size="small"
                texts={texts.loadingTexts}
              />
            ) : type === 'success' ? (
              <CwIcon
                name="common--status--check-line"
                prefix="icon"
                size={1}
                className="inline-flex items-center justify-center"
              />
            ) : type === 'fail' ? (
              <CwIcon
                name="common--status--close-line"
                size={1}
                className="inline-flex items-center justify-center"
              />
            ) : null}
          </span>
        ) : null}
        {showRichText ? (
          <div className={styles.messageWrap}>
            <CwRichText
              size="medium"
              appearance="toast"
              dsl={dsl}
              onLinkClick={(href, event) => onLinkClick?.(href, event)}
            />
          </div>
        ) : message ? (
          <div className={styles.messageWrap}>
            <p className={styles.message}>{message}</p>
          </div>
        ) : null}
      </div>
    </CwDynamicDialogLayer>
  )
}

export default CwToast
