import type { ReactNode } from 'react'

/**
 * React stub — full port of vue-ui openResponsiveOverlayDialog pending CwDynamicDialog imperative API.
 */
export interface OpenResponsiveOverlayDialogOptions {
  isBelowMd: boolean
  contentClass: string
  wrapHost?: boolean
  hostClass?: string
  styles?: Record<string, unknown>
  render: () => ReactNode
  config?: {
    fullscreen?: Record<string, unknown>
    modal?: Record<string, unknown>
  }
  modalDefaults?: Record<string, unknown>
}

export interface ShowDynamicDialogReturn {
  close: () => void
}

export function openResponsiveOverlayDialog(
  _options: OpenResponsiveOverlayDialogOptions,
): ShowDynamicDialogReturn {
  console.warn(
    '[react-ui] openResponsiveOverlayDialog is a stub until CwDynamicDialog is fully ported',
  )
  return { close: () => {} }
}
