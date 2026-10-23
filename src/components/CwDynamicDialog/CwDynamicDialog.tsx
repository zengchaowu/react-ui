import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwDynamicDialogInner from './CwDynamicDialogInner'
import type {
  CwDynamicDialogConfig,
  CwDynamicDialogHandle,
  CwDynamicDialogProps,
  DynamicDialogInstance,
} from './types'
import { defaultTexts } from './texts'

function generateId(): string {
  return `dialog_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

const CwDynamicDialog = forwardRef<CwDynamicDialogHandle, CwDynamicDialogProps>(
  function CwDynamicDialog({ texts: textsProp, className, onClose }, ref) {
    const texts = { ...defaultTexts, ...(textsProp ?? {}) }

    const [mounted, setMounted] = useState(false)
    const [dialogs, setDialogs] = useState<DynamicDialogInstance[]>([])

    const dialogsRef = useRef(dialogs)
    dialogsRef.current = dialogs

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
      (component: ReactNode, config: CwDynamicDialogConfig = {}): string => {
        const id = generateId()
        const dialog: DynamicDialogInstance = {
          id,
          component,
          config: { ...config },
          visible: true,
        }
        setDialogs((prev) => [...prev, dialog])
        return id
      },
      [],
    )

    const hide = useCallback((id: string): void => {
      if (!dialogsRef.current.some((d) => d.id === id)) return
      setDialogs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, visible: false } : d)),
      )
      // 延迟移除，给动画时间
      const timer = setTimeout(() => {
        timersRef.current.delete(timer)
        setDialogs((prev) => prev.filter((d) => d.id !== id))
      }, 300)
      timersRef.current.add(timer)
    }, [])

    const hideAll = useCallback((): void => {
      if (dialogsRef.current.length === 0) return
      setDialogs((prev) => prev.map((d) => ({ ...d, visible: false })))
      const timer = setTimeout(() => {
        timersRef.current.delete(timer)
        setDialogs([])
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

    useImperativeHandle(ref, () => ({ show, hide, hideAll }), [
      show,
      hide,
      hideAll,
    ])

    useEffect(() => {
      if (bodyMountRef.current) {
        scheduleBringOverlayHostToFront(bodyMountRef.current)
      }
    }, [mounted, dialogs.length])

    if (!mounted || typeof document === 'undefined') return null

    return createPortal(
      <div
        ref={bodyMountRef}
        className={['cw-dynamic-dialog-body-mount', className]
          .filter(Boolean)
          .join(' ')}
      >
        {dialogs.map((dialog) => (
          <CwDynamicDialogInner
            key={dialog.id}
            id={dialog.id}
            component={dialog.component}
            config={dialog.config}
            visible={dialog.visible}
            texts={texts}
            onClose={handleClose}
          />
        ))}
      </div>,
      document.body,
    )
  },
)

export default CwDynamicDialog
