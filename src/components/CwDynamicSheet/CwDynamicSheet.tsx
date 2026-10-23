import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwDynamicSheetInner from './CwDynamicSheetInner'
import type {
  CwDynamicSheetConfig,
  CwDynamicSheetHandle,
  CwDynamicSheetProps,
  SheetInstance,
} from './types'
import { defaultTexts } from './texts'

function generateId(): string {
  return `sheet_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export interface CwDynamicSheetComponentProps
  extends CwDynamicSheetProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onClose'> {
  className?: string
}

export const CwDynamicSheet = forwardRef<
  CwDynamicSheetHandle,
  CwDynamicSheetComponentProps
>(function CwDynamicSheet({ texts: textsProp, className, onClose, ...rest }, ref) {
  const texts = { ...defaultTexts, ...(textsProp ?? {}) }

  const [mounted, setMounted] = useState(false)
  const [sheets, setSheets] = useState<SheetInstance[]>([])

  const sheetsRef = useRef(sheets)
  sheetsRef.current = sheets

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const bodyMountRef = useRef<HTMLDivElement | null>(null)
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const show = useCallback(
    (component: ReactNode, config: CwDynamicSheetConfig = {}): string => {
      const id = generateId()
      const sheet: SheetInstance = {
        id,
        component,
        config: { ...config },
        visible: true,
      }
      setSheets((prev) => [...prev, sheet])
      return id
    },
    [],
  )

  const hide = useCallback((id: string): void => {
    if (!sheetsRef.current.some((sheet) => sheet.id === id)) return
    setSheets((prev) =>
      prev.map((sheet) => (sheet.id === id ? { ...sheet, visible: false } : sheet)),
    )
    // 延迟移除，给动画时间
    const timer = setTimeout(() => {
      timersRef.current.delete(timer)
      setSheets((prev) => prev.filter((sheet) => sheet.id !== id))
    }, 300)
    timersRef.current.add(timer)
  }, [])

  const hideAll = useCallback((): void => {
    if (sheetsRef.current.length === 0) return
    setSheets((prev) => prev.map((sheet) => ({ ...sheet, visible: false })))
    // 延迟移除，给动画时间
    const timer = setTimeout(() => {
      timersRef.current.delete(timer)
      setSheets([])
    }, 300)
    timersRef.current.add(timer)
  }, [])

  const handleClose = useCallback(
    (id: string): void => {
      onCloseRef.current?.(id)
      hide(id)
    },
    [hide],
  )

  useImperativeHandle(ref, () => ({ show, hide, hideAll }), [show, hide, hideAll])

  useEffect(() => {
    if (bodyMountRef.current) {
      scheduleBringOverlayHostToFront(bodyMountRef.current)
    }
  }, [mounted, sheets.length])

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      {...rest}
      ref={bodyMountRef}
      className={['cw-dynamic-sheet-body-mount', className]
        .filter(Boolean)
        .join(' ')}
      style={{ display: 'contents' }}
    >
      {sheets.map((sheet) => (
        <CwDynamicSheetInner
          key={sheet.id}
          id={sheet.id}
          component={sheet.component}
          config={sheet.config}
          visible={sheet.visible}
          texts={texts}
          onClose={handleClose}
        />
      ))}
    </div>,
    document.body,
  )
})

export default CwDynamicSheet
